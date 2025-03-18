import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Award, ArrowRight, Wallet, Plus, Loader2, User, Gift, Check, AlertTriangle } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import taskService from "@/services/TaskService";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ethers } from 'ethers';

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  creator: string;
  completer: string | null;
  isCompleted: boolean;
  isPaid: boolean;
  submission?: string;
  status: 'available' | 'in_progress' | 'completed' | 'paid';
}

// Task card component
const TaskCard: React.FC<{
  task: Task;
  onStartTask?: (taskId: number) => void;
  onMarkComplete?: (taskId: number) => void;
  onPay?: (taskId: number) => void;
  onSubmit?: (taskId: number, submission: string) => void;
  currentAccount: string | null;
  showSubmission?: boolean;
}> = ({ task, onStartTask, onMarkComplete, onPay, onSubmit, currentAccount, showSubmission }) => {
  const [submission, setSubmission] = useState("");
  const isCreator = currentAccount?.toLowerCase() === task.creator.toLowerCase();
  const isCompleter = task.completer?.toLowerCase() === currentAccount?.toLowerCase();
  
  return (
    <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{task.title}</h3>
          <div className="flex gap-2">
            {task.status === 'completed' && (
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            )}
            {task.status === 'paid' && (
              <Badge className="bg-yellow-100 text-yellow-800">Paid</Badge>
            )}
            {task.status === 'in_progress' && (
              <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
            )}
            {task.status === 'available' && (
              <Badge className="bg-purple-100 text-purple-800">Available</Badge>
            )}
          </div>
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
        {task.submission && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Submission:</p>
            <p className="text-gray-600">{task.submission}</p>
          </div>
        )}
      </div>
      <div className="space-y-3 mt-4">
        {showSubmission && task.status === 'in_progress' && isCompleter && (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your submission..."
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => onSubmit && onSubmit(task.id, submission)}
              disabled={!submission.trim()}
            >
              Submit Work
            </Button>
          </div>
        )}
        {onStartTask && task.status === 'available' && !isCreator && (
          <Button
            className="w-full flex items-center justify-center"
            onClick={() => onStartTask(task.id)}
          >
            Start Task
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {onMarkComplete && isCreator && task.status === 'in_progress' && task.submission && (
          <Button
            className="w-full flex items-center justify-center"
            onClick={() => onMarkComplete(task.id)}
            variant="outline"
          >
            Mark Complete
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
        {onPay && isCreator && task.status === 'completed' && (
          <Button
            className="w-full flex items-center justify-center"
            onClick={() => onPay(task.id)}
            variant="default"
          >
            Pay Reward
            <Award className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { account, isCorrectNetwork, switchNetwork, eduBalance, refreshBalance } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize tasks from localStorage or use default tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('educhain_tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [
      {
        id: 1,
        title: "Create a Landing Page",
        description: "Design and implement a responsive landing page for our DApp",
        reward: "50",
        creator: "0x1234567890123456789012345678901234567890",
        completer: null,
        isCompleted: false,
        isPaid: false,
        status: 'available'
      },
      {
        id: 2,
        title: "Smart Contract Testing",
        description: "Write comprehensive tests for our smart contracts",
        reward: "75",
        creator: "0x1234567890123456789012345678901234567890",
        completer: null,
        isCompleted: false,
        isPaid: false,
        status: 'available'
      }
    ];
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('educhain_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check if user is connected before showing dashboard
  useEffect(() => {
    if (!account) {
      navigate("/dapp");
    }
    setLoading(false);
  }, [account, navigate]);

  const [rewards, setRewards] = useState<{amount: string, taskId: number, title: string}[]>(() => {
    const savedRewards = localStorage.getItem('educhain_rewards');
    if (savedRewards) {
      return JSON.parse(savedRewards);
    }
    return [];
  });

  // Save rewards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('educhain_rewards', JSON.stringify(rewards));
  }, [rewards]);

  const handleStartTask = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        toast({
          title: "Task Started",
          description: "You have successfully started the task. Submit your work when ready.",
        });
        return { 
          ...task, 
          completer: account,
          status: 'in_progress'
        };
      }
      return task;
    }));
  };

  const handleSubmitWork = (taskId: number, submission: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        toast({
          title: "Work Submitted",
          description: "Your work has been submitted for review.",
        });
        return { 
          ...task, 
          submission,
          status: 'in_progress'
        };
      }
      return task;
    }));
  };

  const handleMarkComplete = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        toast({
          title: "Task Completed",
          description: "The task has been marked as complete.",
        });
        return { 
          ...task, 
          isCompleted: true,
          status: 'completed'
        };
      }
      return task;
    }));
  };

  const handlePay = async (taskId: number) => {
    try {
      setIsSubmitting(true);
      
      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.completer) return;
      
      // Simulate MetaMask payment transaction
      if (taskService.provider) {
        const signer = taskService.provider.getSigner();
        console.log("Requesting payment approval...");
        
        // Directly request accounts to ensure MetaMask opens
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Simulate a payment transaction
        const paymentAmount = ethers.utils.parseEther(task.reward);
        const tx = await signer.sendTransaction({
          to: task.completer, // Send to completer's address
          value: paymentAmount,
          gasLimit: 21000
        });
        
        console.log("Payment transaction submitted:", tx.hash);
        await tx.wait();
        
        // Add to rewards for the completer
        if (task.completer.toLowerCase() === account?.toLowerCase()) {
          // If current user is the completer, add to their rewards
          setRewards(prev => [...prev, {
            amount: task.reward,
            taskId: task.id,
            title: task.title
          }]);
        }
        
        // Update task status
        setTasks(tasks.map(t => {
          if (t.id === taskId) {
            toast({
              title: "Payment Sent",
              description: "The reward has been paid to the completer.",
            });
            return { 
              ...t, 
              isPaid: true,
              status: 'paid'
            };
          }
          return t;
        }));
      }
    } catch (error) {
      console.error("Error paying reward:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to send the payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawReward = async (rewardIndex: number) => {
    try {
      setIsSubmitting(true);
      
      // Find the reward
      const reward = rewards[rewardIndex];
      if (!reward) return;
      
      // Simulate MetaMask withdrawal transaction
      if (taskService.provider) {
        const signer = taskService.provider.getSigner();
        console.log("Requesting withdrawal approval...");
        
        // Directly request accounts to ensure MetaMask opens
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Simulate a withdrawal transaction
        const withdrawalAmount = ethers.utils.parseEther(reward.amount);
        const tx = await signer.sendTransaction({
          to: await signer.getAddress(), // Send to self (dummy transaction)
          value: ethers.utils.parseEther("0.001"), // Small amount for simulation
          gasLimit: 21000
        });
        
        console.log("Withdrawal transaction submitted:", tx.hash);
        await tx.wait();
        
        // Remove from rewards
        setRewards(prev => prev.filter((_, index) => index !== rewardIndex));
        
        toast({
          title: "Reward Withdrawn",
          description: `You have successfully withdrawn ${reward.amount} EDU`,
        });
      }
    } catch (error) {
      console.error("Error withdrawing reward:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to withdraw the reward. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    reward: ""
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = Math.max(...tasks.map(t => t.id), 0) + 1;
    const task: Task = {
      id: taskId,
      ...newTask,
      creator: account || "",
      completer: null,
      isCompleted: false,
      isPaid: false,
      status: 'available'
    };
    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", reward: "" });
    toast({
      title: "Task Created",
      description: "Your task has been created successfully!",
    });
    setActiveTab("available");
  };

  if (!account) {
    return null;
  }

  // Filter tasks based on their status and user role
  const availableTasks = tasks.filter(task => 
    task.status === 'available' && 
    task.creator.toLowerCase() !== account?.toLowerCase()
  );

  const myCreatedTasks = tasks.filter(task =>
    task.creator.toLowerCase() === account?.toLowerCase()
  );

  const myInProgressTasks = tasks.filter(task =>
    task.status === 'in_progress' &&
    task.completer?.toLowerCase() === account?.toLowerCase()
  );

  const tasksAwaitingReview = tasks.filter(task => 
    task.status === 'in_progress' &&
    task.creator.toLowerCase() === account?.toLowerCase() &&
    task.submission
  );

  const completedTasks = tasks.filter(task => 
    (task.status === 'completed' || task.status === 'paid') &&
    task.creator.toLowerCase() === account?.toLowerCase()
  );

  // Calculate total rewards
  const totalRewards = rewards.reduce((sum, reward) => {
    return sum + parseFloat(reward.amount);
  }, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 w-full z-50 py-2 glass">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-bold">EduBounty</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={refreshBalance}
                disabled={isLoadingBalance}
              >
                <ArrowRight className="h-4 w-4" />
                Refresh
                {isLoadingBalance && <Loader2 className="h-4 w-4 animate-spin" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={switchNetwork}
                className="flex items-center gap-2"
                disabled={isCorrectNetwork}
              >
                {isCorrectNetwork ? (
                  <>
                    <Check className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Switch Network
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Card className="p-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">EDU Balance</h3>
                <p className="text-2xl font-bold">
                  {isLoadingBalance ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    eduBalance ? `${eduBalance} EDU` : "Connect wallet"
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={refreshBalance}
                disabled={isLoadingBalance}
              >
                {isLoadingBalance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </Card>
          
          <Card className="p-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available Rewards</h3>
                <p className="text-2xl font-bold">{totalRewards} EDU</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setActiveTab("rewards")}
                disabled={rewards.length === 0}
              >
                Manage
              </Button>
            </div>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="available">Available Tasks</TabsTrigger>
            <TabsTrigger value="created">My Created Tasks</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="review">Awaiting Review</TabsTrigger>
            <TabsTrigger value="rewards" className="relative">
              Rewards
              {rewards.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {rewards.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Available Tasks</h2>
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : availableTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available tasks at the moment.</p>
                  <Button onClick={() => setActiveTab("create")}>
                    Create a Task
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStartTask={handleStartTask}
                      currentAccount={account}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">My Created Tasks</h2>
              {myCreatedTasks.length === 0 ? (
                <p className="text-gray-500">You haven't created any tasks yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myCreatedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <h2 className="text-2xl font-bold">Create New Task</h2>
            <Card className="p-6">
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward (EDU)</Label>
                  <Input
                    id="reward"
                    type="number"
                    value={newTask.reward}
                    onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                    placeholder="Enter reward amount"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Task
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">My Tasks In Progress</h2>
              {myInProgressTasks.length === 0 ? (
                <p className="text-gray-500">You haven't started any tasks yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myInProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitWork}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">Tasks Awaiting Review</h2>
              {tasksAwaitingReview.length === 0 ? (
                <p className="text-gray-500">No tasks awaiting your review.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksAwaitingReview.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMarkComplete={handleMarkComplete}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">Completed Tasks</h2>
              {completedTasks.length === 0 ? (
                <p className="text-gray-500">No completed tasks yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPay={!task.isPaid ? handlePay : undefined}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">My Tasks In Progress</h2>
              {myInProgressTasks.length === 0 ? (
                <p className="text-gray-500">You haven't started any tasks yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myInProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitWork}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">Tasks Awaiting Review</h2>
              {tasksAwaitingReview.length === 0 ? (
                <p className="text-gray-500">No tasks awaiting your review.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksAwaitingReview.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMarkComplete={handleMarkComplete}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">Completed Tasks</h2>
              {completedTasks.length === 0 ? (
                <p className="text-gray-500">No completed tasks yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPay={!task.isPaid ? handlePay : undefined}
                      currentAccount={account}
                      showSubmission
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Rewards</h2>
              {rewards.length > 0 && (
                <Button
                  onClick={() => {
                    // Withdraw all rewards at once
                    rewards.forEach((_, index) => handleWithdrawReward(0));
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Withdraw All ({totalRewards} EDU)
                </Button>
              )}
            </div>
            
            {rewards.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No Rewards Available</h3>
                  <p className="text-gray-400 mb-4">Complete tasks to earn rewards</p>
                  <Button onClick={() => setActiveTab("available")}>
                    Browse Available Tasks
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rewards.map((reward, index) => (
                  <Card key={`${reward.taskId}-${index}`} className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{reward.title}</h3>
                        <p className="text-xl font-bold text-green-600">{reward.amount} EDU</p>
                      </div>
                      <Button 
                        onClick={() => handleWithdrawReward(index)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Withdraw
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
