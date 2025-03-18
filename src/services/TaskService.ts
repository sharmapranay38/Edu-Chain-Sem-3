// src/services/TaskService.ts
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, TASK_MANAGER_ABI } from "@/contracts/ContractConfig";
import { useWeb3 } from "@/contexts/Web3Context";

// Open Campus Codex testnet details
const CHAIN_ID = 656476;
const RPC_URL = "https://rpc.open-campus-codex.gelato.digital";

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  creator: string;
  completer: string | null;
  isCompleted: boolean;
  createdAt: number;
}

class TaskService {
  private static instance: TaskService;
  private provider: ethers.providers.Web3Provider | null = null;
  private taskManager: ethers.Contract | null = null;
  private web3Context: any = null;

  private constructor() {
    this.initializeProvider();
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private isInitialized(): boolean {
    return this.provider !== null && this.taskManager !== null;
  }

  public async initializeProvider(): Promise<void> {
    try {
      if (window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, {
          name: "Open Campus Codex",
          chainId: CHAIN_ID,
        });

        // Get the signer
        const signer = this.provider.getSigner();

        // Initialize the contract
        this.taskManager = new ethers.Contract(
          CONTRACT_ADDRESS,
          TASK_MANAGER_ABI,
          signer
        );

        console.log("TaskService initialized successfully");
      } else {
        console.error("Ethereum provider not available");
      }
    } catch (error) {
      console.error("Failed to initialize provider:", error);
    }
  }

  public setWeb3Context(context: any): void {
    this.web3Context = context;
    console.log("Web3Context set in TaskService");
  }

  public async resetProvider() {
    this.provider = null;
    this.taskManager = null;
    await this.initializeProvider();
    return this.isInitialized();
  }

  // Create a new task
  public async createTask(
    title: string,
    description: string,
    reward: string
  ): Promise<any> {
    try {
      if (!this.isInitialized()) {
        await this.initializeProvider();
        if (!this.isInitialized()) {
          throw new Error("Failed to initialize wallet connection");
        }
      }

      if (!this.taskManager) {
        throw new Error("Task manager contract not initialized");
      }

      console.log("Creating task...");
      console.log("Reward amount:", reward, "EDU");

      // Check balance directly since web3Context might not be available
      if (this.web3Context) {
        // Use web3Context if available
        const hasSufficientBalance = await this.web3Context.checkSufficientBalance(
          reward
        );
        if (!hasSufficientBalance) {
          throw new Error(
            "Insufficient EDU tokens. Please make sure you have enough tokens for the reward amount plus gas fees (approximately 10% extra for gas)"
          );
        }
      } else {
        // Fallback to direct balance check
        const signer = this.provider!.getSigner();
        const address = await signer.getAddress();
        const balance = await this.provider!.getBalance(address);
        const rewardAmount = ethers.utils.parseEther(reward);
        const requiredWithGas = rewardAmount.mul(110).div(100);

        console.log("User balance:", ethers.utils.formatEther(balance), "EDU");
        console.log("Required with gas:", ethers.utils.formatEther(requiredWithGas), "EDU");

        if (balance.lt(requiredWithGas)) {
          throw new Error(
            "Insufficient EDU tokens. Please make sure you have enough tokens for the reward amount plus gas fees"
          );
        }
      }

      const rewardInWei = ethers.utils.parseEther(reward);
      console.log("Reward in wei:", rewardInWei.toString());

      const tx = await this.taskManager!.createTask(title, description, {
        value: rewardInWei,
        gasLimit: 300000,
      });

      console.log("Create task transaction sent:", tx.hash);
      await tx.wait();
      console.log("Task created successfully");
      return tx;
    } catch (error: any) {
      console.error("Task creation error details:", error);

      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient EDU tokens for task reward and gas fees");
      } else if (error.code === -32603) {
        throw new Error("Transaction failed. Please check your EDU balance and try again");
      } else {
        throw new Error(
          error.message || "Failed to create task. Please try again"
        );
      }
    }
  }

  // Complete a task
  public async completeTask(taskId: number): Promise<boolean> {
    if (!this.isInitialized()) {
      await this.initializeProvider();
      if (!this.isInitialized()) {
        throw new Error("TaskService not initialized");
      }
    }

    try {
      const tx = await this.taskManager!.completeTask(taskId, {
        gasLimit: 300000,
      });
      await tx.wait();
      return true;
    } catch (error: any) {
      console.error("Error completing task:", error);
      throw error;
    }
  }

  // Get all tasks
  public async getAllTasks(): Promise<Task[]> {
    if (!this.isInitialized()) {
      await this.initializeProvider();
      if (!this.isInitialized()) {
        throw new Error("TaskService not initialized");
      }
    }

    try {
      const taskCount = await this.taskManager!.taskCounter();
      const tasks: Task[] = [];

      for (let i = 1; i <= taskCount; i++) {
        const task = await this.taskManager!.tasks(i);
        tasks.push({
          id: task.id.toNumber(),
          title: task.title,
          description: task.description,
          reward: ethers.utils.formatEther(task.reward),
          creator: task.creator,
          completer: task.completer,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt.toNumber(),
        });
      }

      return tasks;
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  // Get a specific task
  public async getTask(taskId: number): Promise<Task> {
    if (!this.isInitialized()) {
      await this.initializeProvider();
      if (!this.isInitialized()) {
        throw new Error("TaskService not initialized");
      }
    }

    try {
      const task = await this.taskManager!.tasks(taskId);
      return {
        id: task.id.toNumber(),
        title: task.title,
        description: task.description,
        reward: ethers.utils.formatEther(task.reward),
        creator: task.creator,
        completer: task.completer,
        isCompleted: task.isCompleted,
        createdAt: task.createdAt.toNumber(),
      };
    } catch (error: any) {
      console.error("Error fetching task:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default TaskService.getInstance();
