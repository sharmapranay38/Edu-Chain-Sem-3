import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, ArrowRight, Wallet } from "lucide-react";

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
    <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
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
            <span className="font-medium">{task.reward} ETH</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <span>{task.estimatedTime}</span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-4 flex items-center justify-center"
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
  const navigate = useNavigate();

  // Check if user is connected before showing dashboard
  useEffect(() => {
    const storedAccount = localStorage.getItem("connectedAccount");
    if (!storedAccount) {
      navigate("/dapp");
    } else {
      setAccount(storedAccount);
    }
  }, [navigate]);

  const handleStartTask = (taskId: number) => {
    console.log(`Starting task ${taskId}`);
    // Here you would navigate to the task details page or start the task
    // For demo purposes, we'll just log it
    alert(
      `You've started task #${taskId}. In a real app, you would be redirected to the task page.`
    );
  };

  const disconnectWallet = () => {
    localStorage.removeItem("connectedAccount");
    setAccount(null);
    navigate("/dapp");
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

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Task Dashboard</h1>
          <p className="text-gray-600">
            Welcome to EduBounty! Here are available tasks you can work on to
            earn rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStartTask={handleStartTask} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
