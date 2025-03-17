import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, ArrowRight, Wallet, Loader2, ClipboardCheck, PlusCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample task data
const sampleTasks = [
  {
    id: 1,
    title: "Create a Smart Contract for Token Distribution",
    description:
      "Develop a Solidity smart contract that handles token distribution for educational achievements",
    reward: 0.5,
    estimatedTime: "2-3 hours",
    difficulty: "Medium",
  },
  {
    id: 2,
    title: "Design a User Dashboard UI",
    description:
      "Create a responsive UI design for the student dashboard showing achievements and rewards",
    reward: 0.3,
    estimatedTime: "1-2 hours",
    difficulty: "Easy",
  },
  {
    id: 3,
    title: "Implement Authentication System",
    description:
      "Build a secure authentication system that works with both traditional login and wallet connection",
    reward: 0.8,
    estimatedTime: "4-5 hours",
    difficulty: "Hard",
  },
  {
    id: 4,
    title: "Create API for Course Data",
    description:
      "Develop a REST API that serves educational course data from the blockchain",
    reward: 0.4,
    estimatedTime: "2-3 hours",
    difficulty: "Medium",
  },
  {
    id: 5,
    title: "Build Certificate Verification System",
    description:
      "Create a system to verify educational certificates using blockchain technology",
    reward: 0.7,
    estimatedTime: "3-4 hours",
    difficulty: "Hard",
  },
  {
    id: 6,
    title: "Optimize Gas Costs for Smart Contracts",
    description:
      "Review and optimize existing smart contracts to reduce gas costs",
    reward: 0.6,
    estimatedTime: "2-3 hours",
    difficulty: "Medium",
  },
];

// Task card component
const TaskCard: React.FC<{
  task: {
    id: number;
    title: string;
    description: string;
    reward: number;
    estimatedTime: string;
    difficulty: string;
  };
  onStartTask: (taskId: number) => void;
}> = ({ task, onStartTask }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 border-0">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{task.title}</h3>
          <Badge className={getDifficultyColor(task.difficulty)}>
            {task.difficulty}
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-medium">{task.reward} EDU</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <span>{task.estimatedTime}</span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
        onClick={() => onStartTask(task.id)}
      >
        Start Task
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  );
};

const Dashboard = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [tasks, setTasks] = useState(sampleTasks);
  const [activeTab, setActiveTab] = useState('review-tasks');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is connected before showing dashboard
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const storedAccount = localStorage.getItem("connectedAccount");
        
        if (!storedAccount) {
          toast({
            title: "Authentication Required",
            description: "Please connect your wallet to access the dashboard",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Verify if the wallet is still connected
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          
          if (accounts.length === 0 || accounts[0].toLowerCase() !== storedAccount.toLowerCase()) {
            // Wallet is not connected or account has changed
            localStorage.removeItem("connectedAccount");
            toast({
              title: "Wallet Disconnected",
              description: "Your wallet is no longer connected. Please reconnect.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          
          setAccount(accounts[0]);
        } else {
          // No ethereum provider
          localStorage.removeItem("connectedAccount");
          toast({
            title: "Wallet Not Found",
            description: "MetaMask is not installed or not accessible",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        toast({
          title: "Connection Error",
          description: "Failed to verify wallet connection",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          localStorage.removeItem("connectedAccount");
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
            variant: "destructive",
          });
          navigate("/login");
        } else {
          // Account changed, update the stored account
          localStorage.setItem("connectedAccount", accounts[0]);
          setAccount(accounts[0]);
          toast({
            title: "Account Changed",
            description: "Your wallet account has changed",
          });
        }
      });
    }
    
    return () => {
      // Clean up event listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [navigate, toast]);

  const handleStartTask = (taskId: number) => {
    console.log(`Starting task ${taskId}`);
    // Here you would navigate to the task details page or start the task
    toast({
      title: "Task Started",
      description: `You've started task #${taskId}`,
    });
  };

  const disconnectWallet = () => {
    localStorage.removeItem("connectedAccount");
    setAccount(null);
    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we verify your wallet connection</p>
        </div>
      </div>
    );
  }

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

            {account && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={disconnectWallet}
              >
                <Wallet size={16} />
                {account.slice(0, 6)}...{account.slice(-4)}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-4 border-0">
              <div className="space-y-2">
                <Button 
                  variant={activeTab === 'review-tasks' ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('review-tasks')}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Available Tasks
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
                  variant={activeTab === 'profile' ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/ocid-dashboard')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Rewards
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'review-tasks' && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">Available Tasks</h1>
                  <p className="text-gray-600">
                    Review and complete these tasks to earn rewards and build your skills.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onStartTask={handleStartTask} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'create-task' && (
              <Card className="p-6 shadow-md border-0">
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
              </Card>
            )}

            {activeTab === 'profile' && (
              <Card className="p-6 shadow-md border-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Your Profile
                </h1>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">
                    Wallet Information
                  </h2>
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <p className="text-sm text-gray-500 mb-1">Connected Wallet Address</p>
                    <p className="font-mono text-blue-700 break-all">
                      {account || "Not connected"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-gray-500">Tasks Completed</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-gray-500">Tasks Created</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">0.00 ETH</p>
                      <p className="text-sm text-gray-500">Total Earned</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
