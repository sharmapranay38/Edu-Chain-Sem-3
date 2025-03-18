import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, AlertCircle, Loader2 } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DApp = () => {
  const { account, connectWallet, isConnecting, isCorrectNetwork, switchNetwork } = useWeb3();
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (account) {
      navigate("/dashboard");
    }
  }, [account, navigate]);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      await connectWallet();
      
      if (!isCorrectNetwork) {
        toast({
          title: "Wrong network",
          description: "Please switch to the Open Campus Codex network",
          variant: "destructive",
        });
        await switchNetwork();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="fixed top-0 w-full z-50 py-2 glass">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">EB</span>
              </div>
              <span className="font-semibold text-lg">EduBounty</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid place-items-center h-[100vh]">
          <Card className="p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-6">
              Welcome to EduBounty dApp
            </h2>
            <p className="mb-8">
              Connect your wallet to access the task dashboard and start earning
              EDU tokens for educational contributions.
            </p>
            
            <Alert className="mb-6 bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Network Information</AlertTitle>
              <AlertDescription>
                This dApp runs on the Open Campus Codex testnet (Chain ID: 656476).
                Make sure your wallet is configured correctly.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center">
              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleConnectWallet}
                disabled={connecting || isConnecting}
              >
                {(connecting || isConnecting) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet size={20} />
                    Connect Wallet
                  </>
                )}
              </Button>

              {account && (
                <p className="text-sm text-gray-500 mt-4">
                  Wallet connected! Redirecting to dashboard...
                </p>
              )}
              
              {!isCorrectNetwork && account && (
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={switchNetwork}
                >
                  Switch to Open Campus Codex
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DApp;
