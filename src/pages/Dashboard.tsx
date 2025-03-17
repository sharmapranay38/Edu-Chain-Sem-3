import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, ArrowRight, Wallet, Plus, Loader2 } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import taskService from "@/services/TaskService";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  creator: string;
  completer: string;
  isCompleted: boolean;
}

// Task card component
const TaskCard: React.FC<{
  task: Task;
  onStartTask: (taskId: number) => void;
  currentAccount: string | null;
}> = ({ task, onStartTask, currentAccount }) => {
  const isCreator = currentAccount?.toLowerCase() === task.creator.toLowerCase();
  const isCompleted = task.isCompleted;
  
  return (
    <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{task.title}</h3>
          <Badge className={isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
            {isCompleted ? "Completed" : "Active"}
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-medium">{task.reward} EDU</span>
          </div>
          <div className="flex items-center">
            <Wallet className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-xs text-gray-500">
              {task.creator.slice(0, 6)}...{task.creator.slice(-4)}
            </span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-4 flex items-center justify-center"
        onClick={() => onStartTask(task.id)}
        disabled={isCompleted || isCreator}
        variant={isCompleted || isCreator ? "outline" : "default"}
      >
        {isCompleted 
          ? "Completed" 
          : isCreator 
            ? "You created this task" 
            : "Complete Task"}
        {!isCompleted && !isCreator && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </Card>
  );
};

const Dashboard = () => {
  const { account, isCorrectNetwork, switchNetwork, eduTokenBalance, refreshBalance } = useWeb3();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const navigate = useNavigate();

  // Check if user is connected before showing dashboard
  useEffect(() => {
    if (!account) {
      navigate("/dapp");
    }
  }, [account, navigate]);

  // Refresh the balance when component mounts
  useEffect(() => {
    const loadBalance = async () => {
      if (!account || !isCorrectNetwork) return;
      
      try {
        setIsLoadingBalance(true);
        await refreshBalance();
      } catch (error) {
        console.error("Error refreshing token balance:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
  }, [account, isCorrectNetwork, refreshBalance]);

  // Fetch tasks from the blockchain
  useEffect(() => {
    const fetchTasks = async () => {
      if (!account) return;
      
      if (!isCorrectNetwork) {
        toast({
          title: "Wrong network",
          description: "Please switch to the Open Campus Codex network to view tasks",
          variant: "destructive",
        });
        return;
      }
      
      try {
        setLoading(true);
        const fetchedTasks = await taskService.getAllTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [account, isCorrectNetwork]);

  const handleCompleteTask = async (taskId: number) => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to complete a task",
        variant: "destructive",
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong network",
        description: "Please switch to the Open Campus Codex network",
        variant: "destructive",
      });
      await switchNetwork();
      return;
    }
    
    try {
      setLoading(true);
      await taskService.completeTask(taskId);
      
      // Refresh the tasks list
      const updatedTasks = await taskService.getAllTasks();
      setTasks(updatedTasks);
      
      // Refresh balance after task completion
      await refreshBalance();
      
      toast({
        title: "Task completed",
        description: "You have successfully completed the task and earned EDU tokens!",
      });
    } catch (error: any) {
      console.error(`Error completing task ${taskId}:`, error);
      
      let errorMessage = "Failed to complete task. Please try again.";
      
      // Check for specific error messages
      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas * price + value.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Reset the TaskService provider to ensure fresh connection
      await taskService.resetProvider();
      
      // Refresh balance
      await refreshBalance();
      
      // Fetch tasks again
      const fetchedTasks = await taskService.getAllTasks();
      setTasks(fetchedTasks);
      
      toast({
        title: "Refreshed",
        description: "Task list and balance updated successfully",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

            {account && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-yellow-500" />
                  {isLoadingBalance ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{eduTokenBalance || "0"} EDU</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Wallet size={16} />
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Task Dashboard</h1>
          <p className="text-gray-600">
            Welcome to EduBounty! Here are available tasks you can work on to
            earn EDU token rewards.
          </p>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => navigate("/create-task")}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Task
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
              )}
              Refresh
            </Button>
            {!isCorrectNetwork && (
              <Button
                onClick={switchNetwork}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Wallet size={16} />
                Switch to Open Campus Codex
              </Button>
            )}
          </div>
        </div>

        {!isCorrectNetwork && (
          <Alert className="mb-6 bg-yellow-50">
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>You are not connected to the Open Campus Codex network.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-fit"
                onClick={switchNetwork}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No tasks available yet.</p>
            <Button onClick={() => navigate("/create-task")}>
              Create the first task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStartTask={handleCompleteTask}
                currentAccount={account} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
