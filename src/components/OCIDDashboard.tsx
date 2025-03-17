import { useEffect, useState, useCallback } from "react";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, PlusCircle, ClipboardCheck, User, Award } from "lucide-react";

const OCIDDashboard = () => {
  const { isInitialized, authState, OCId, ethAddress, ocAuth } = useOCAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Check if this is the first visit after authentication
    const isNewLogin = localStorage.getItem("auth_completed") === "true";

    if (isNewLogin) {
      // Clear the flag
      localStorage.removeItem("auth_completed");
      // Set a flag to indicate successful authentication
      localStorage.setItem("auth_success", "true");
      console.log("User has just authenticated");
    }

    // Clear any auth in progress flag
    localStorage.removeItem("auth_in_progress");
  }, []);

  useEffect(() => {
    // Only check authentication after initialization
    if (isInitialized) {
      console.log("Auth state:", authState);

      if (!authState?.isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate("/login");
      }

      setLoading(false);
    }
  }, [isInitialized, authState, navigate, toast]);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      if (ocAuth && typeof ocAuth.logout === "function") {
        // Pass the origin as the post-logout redirect URL
        await ocAuth.logout(window.location.origin);
        
        // Clear any auth flags
        localStorage.removeItem("auth_success");
        localStorage.removeItem("auth_completed");
        localStorage.removeItem("auth_in_progress");
        
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out",
        });
        
        // Force redirect to home page to ensure user lands there
        window.location.href = "/";
      } else {
        console.error("Logout function not available:", ocAuth);
        setLoggingOut(false);
        
        toast({
          title: "Logout Failed",
          description: "Could not complete logout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      
      toast({
        title: "Logout Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
      
      // Even on error, try to redirect to home
      navigate("/");
    }
  }, [ocAuth, navigate, toast]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we retrieve your information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="fixed top-0 w-full z-50 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">EB</span>
              </div>
              <span className="font-semibold text-lg">EduBounty</span>
            </a>
            
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-4">
              <div className="space-y-2">
                <Button 
                  variant={activeTab === 'profile' ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant={activeTab === 'create-task' ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('create-task')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
                <Button 
                  variant={activeTab === 'rewards' ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('rewards')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Rewards
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/dashboard')}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Review Tasks
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Card className="p-6 shadow-md">
              {activeTab === 'profile' && (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Profile
                  </h1>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold text-blue-800 mb-2">
                      Welcome, {authState.userInfo?.name || "User"}!
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <p className="text-sm text-gray-500 mb-1">Your OC ID</p>
                        <p className="font-mono text-blue-700 break-all">
                          {OCId || "Not available"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <p className="text-sm text-gray-500 mb-1">Your ETH Address</p>
                        <p className="font-mono text-blue-700 break-all">
                          {ethAddress || "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium">{authState.userInfo?.email || "Not available"}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Username</p>
                        <p className="font-medium">{authState.userInfo?.preferred_username || "Not available"}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'create-task' && (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Create a New Task
                  </h1>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-blue-800 mb-2">
                      Create educational tasks for others to complete
                    </h2>
                    <p className="text-blue-700">
                      Define tasks, set rewards, and review submissions from other users.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Task Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter a descriptive title" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea 
                          placeholder="Describe the task in detail" 
                          className="w-full p-2 border border-gray-300 rounded-md h-32"
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Reward (ETH)</label>
                          <input 
                            type="number" 
                            placeholder="0.1" 
                            className="w-full p-2 border border-gray-300 rounded-md"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Estimated Time</label>
                          <select className="w-full p-2 border border-gray-300 rounded-md">
                            <option>Less than 1 hour</option>
                            <option>1-2 hours</option>
                            <option>2-4 hours</option>
                            <option>4-8 hours</option>
                            <option>More than 8 hours</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Difficulty</label>
                          <select className="w-full p-2 border border-gray-300 rounded-md">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Create Task
                    </Button>
                  </div>
                </>
              )}
              
              {activeTab === 'rewards' && (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Rewards
                  </h1>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-blue-800 mb-1">
                          Total Earned
                        </h2>
                        <p className="text-blue-700">
                          Track your earnings from completed tasks
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        0.00 ETH
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-700">
                      You haven't earned any rewards yet. Complete tasks to start earning!
                    </p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OCIDDashboard;
