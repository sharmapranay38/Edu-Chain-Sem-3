import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Award, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useWeb3 } from "@/contexts/Web3Context";
import taskService from "@/services/TaskService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormData {
  title: string;
  description: string;
  reward: string;
}

const TaskCreation: React.FC = () => {
  const { account, isCorrectNetwork, switchNetwork, eduBalance, refreshBalance, connectWallet } = useWeb3();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    reward: "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactionStep, setTransactionStep] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const navigate = useNavigate();

  // Redirect to DApp page if not connected
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your task",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a description for your task",
        variant: "destructive",
      });
      return false;
    }

    const reward = parseFloat(formData.reward);
    if (isNaN(reward) || reward <= 0) {
      toast({
        title: "Invalid reward",
        description: "Please enter a valid reward amount greater than 0",
        variant: "destructive",
      });
      return false;
    }

    // Check if user has enough balance
    if (eduBalance && parseFloat(eduBalance) < reward) {
      toast({
        title: "Insufficient balance",
        description: `You need at least ${reward} EDU tokens to create this task. Your balance: ${eduBalance} EDU`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const getStepMessage = (step: number) => {
    switch (step) {
      case 1:
        return "Step 1/2: Please confirm task creation fee in MetaMask...";
      case 2:
        return "Step 2/2: Please confirm reward deposit in MetaMask...";
      default:
        return "Preparing transaction...";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a task",
        variant: "destructive",
      });
      
      // Explicitly try to connect wallet
      try {
        await connectWallet();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
      
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setTransactionStep(1);
    setTransactionStatus(getStepMessage(1));

    try {
      // Reset the TaskService provider to ensure fresh connection
      console.log("Resetting provider before task creation");
      const initialized = await taskService.resetProvider();
      console.log("Provider reset successful:", initialized);
      
      // Create the task - this will trigger two MetaMask popups
      console.log("Starting task creation process");
      const result = await taskService.createTask(
        formData.title,
        formData.description,
        formData.reward
      );
      console.log("Task creation result:", result);

      setTransactionStep(2);
      setTransactionStatus(getStepMessage(2));

      // Refresh the balance after task creation
      await refreshBalance();

      toast({
        title: "Task created successfully!",
        description: "Your task has been created and the reward has been deposited.",
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating task:", error);
      
      let errorMessage = "Failed to create task. Please try again.";
      
      if (error.message?.includes("rejected")) {
        errorMessage = "Transaction was rejected in MetaMask.";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient EDU tokens for the transaction.";
      } else if (error.message?.includes("MetaMask not detected")) {
        errorMessage = "MetaMask not detected. Please install MetaMask to use this application.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setTransactionStep(0);
      setTransactionStatus("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="fixed top-0 w-full z-50 py-2 glass">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-bold">EduBounty</h1>
            </div>
            </a>

            {account && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-yellow-500" />
                  {isLoadingBalance ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{eduBalance || "0"} EDU</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <span className="hidden md:inline">Connected:</span>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a New Task</h1>
          <p className="text-gray-600">
            Create a new educational task and set a reward in EDU tokens for its completion.
          </p>
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

        <Card className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a clear and concise title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the task in detail, including requirements and expectations"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">
                Reward (EDU Tokens)
                {eduBalance && (
                  <span className="text-sm text-gray-500 ml-2">
                    Your balance: {eduBalance} EDU
                  </span>
                )}
              </Label>
              <Input
                id="reward"
                name="reward"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter reward amount"
                value={formData.reward}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-gray-500">
                This amount will be deducted from your account when creating the task.
              </p>
            </div>

            {isSubmitting && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Transaction in Progress - Step {transactionStep}/2</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="space-y-2">
                    <p>{transactionStatus}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${(transactionStep / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Step {transactionStep}/2...</span>
                  </div>
                ) : (
                  "Create Task"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default TaskCreation;
