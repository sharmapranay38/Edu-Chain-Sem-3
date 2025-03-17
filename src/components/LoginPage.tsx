import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, UserCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOCAuth } from "@opencampus/ocid-connect-js";

const LoginPage = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocidLoading, setOcidLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, authState, isInitialized } = useOCAuth();

  // Check if user is already logged in
  useEffect(() => {
    const storedAccount = localStorage.getItem("connectedAccount");
    if (storedAccount) {
      navigate("/dashboard");
    }
    
    // Also check for OCID auth completion
    if (authState?.isAuthenticated) {
      console.log("User is authenticated with OCID, redirecting to dashboard");
      localStorage.setItem("auth_completed", "true");
      navigate("/ocid-dashboard");
    }
  }, [navigate, authState, isInitialized]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          // Save the connected account to localStorage
          localStorage.setItem("connectedAccount", accounts[0]);
          toast({
            title: "Wallet Connected",
            description: "You have successfully connected your wallet.",
          });
          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          throw new Error("No accounts found");
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to your wallet. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive",
      });
    }
  };

  const handleOCIDLogin = () => {
    setOcidLoading(true);
    try {
      // Set a flag to indicate authentication is in progress
      localStorage.setItem("auth_in_progress", "true");
      
      // Check if OCID is initialized
      if (!isInitialized) {
        console.error("OCID is not initialized yet");
        toast({
          title: "Login Failed",
          description: "OCID is not initialized yet. Please try again in a moment.",
          variant: "destructive",
        });
        setOcidLoading(false);
        return;
      }
      
      // Initiate OCID login
      login();
      // Note: Redirect handling is done in the Redirect.tsx component
    } catch (error) {
      console.error("Error initiating OCID login:", error);
      toast({
        title: "Login Failed",
        description: "Could not initiate Open Campus ID login. Please try again.",
        variant: "destructive",
      });
      setOcidLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="fixed top-0 w-full z-50 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">EB</span>
              </div>
              <span className="font-semibold text-lg">EduBounty</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid place-items-center h-[100vh]">
          <Card className="p-8 max-w-md w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Welcome to EduBounty
            </h2>
            <p className="text-center mb-8 text-gray-600">
              Sign in to access the platform and start earning rewards
            </p>
            
            <Tabs defaultValue="wallet" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                <TabsTrigger value="wallet" className="flex items-center justify-center gap-2 data-[state=active]:bg-white">
                  <Wallet size={16} />
                  Wallet
                </TabsTrigger>
                <TabsTrigger value="ocid" className="flex items-center justify-center gap-2 data-[state=active]:bg-white">
                  <UserCircle size={16} />
                  OCID
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Connect your wallet to access the dashboard and track your rewards.
                  </p>
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={connectWallet}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wallet size={20} />}
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="ocid">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Use your Open Campus ID to sign in securely to EduBounty.
                  </p>
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={handleOCIDLogin}
                    disabled={ocidLoading || !isInitialized}
                  >
                    {ocidLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCircle size={20} />}
                    {ocidLoading ? "Connecting..." : "Login with Open Campus ID"}
                  </Button>
                  {!isInitialized && (
                    <p className="text-xs text-amber-600 text-center">
                      OCID is initializing. Please wait a moment...
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an Open Campus ID?{" "}
                <a href="https://opencampus.io/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Create one
                </a>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;