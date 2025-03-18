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
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log("Ethereum provider found, initializing...");
        
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        this.provider = new ethers.providers.Web3Provider(window.ethereum, {
          name: "Open Campus Codex",
          chainId: CHAIN_ID,
        });

        // Get the signer
        const signer = this.provider.getSigner();
        console.log("Signer obtained");

        // Initialize the contract
        this.taskManager = new ethers.Contract(
          CONTRACT_ADDRESS,
          TASK_MANAGER_ABI,
          signer
        );

        console.log("TaskService initialized successfully");
      } else {
        console.error("Ethereum provider not available. Please install MetaMask.");
        throw new Error("MetaMask not detected. Please install MetaMask to use this application.");
      }
    } catch (error) {
      console.error("Failed to initialize provider:", error);
      throw error;
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
      // Force provider initialization
      await this.initializeProvider();
      
      if (!this.provider) {
        console.error("Provider is still null after initialization");
        throw new Error("Failed to initialize Ethereum provider. Please make sure MetaMask is installed and unlocked.");
      }

      console.log("Provider initialized:", this.provider);

      // First MetaMask interaction - Task Creation Fee
      const signer = this.provider.getSigner();
      console.log("Got signer:", signer);
      console.log("Requesting task creation fee approval...");
      
      // Directly request accounts to ensure MetaMask opens
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Simulate a small fee transaction
      const creationFee = ethers.utils.parseEther("0.01");
      console.log("Sending creation fee transaction...");
      const tx1 = await signer.sendTransaction({
        to: await signer.getAddress(), // Send to self (dummy transaction)
        value: creationFee,
        gasLimit: 21000
      });

      console.log("Creation fee transaction submitted:", tx1.hash);
      await tx1.wait();

      // Second MetaMask interaction - Task Reward Deposit
      console.log("Requesting reward deposit approval...");
      const rewardAmount = ethers.utils.parseEther(reward);
      
      // Directly request accounts again to ensure MetaMask opens for second transaction
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const tx2 = await signer.sendTransaction({
        to: await signer.getAddress(), // Send to self (dummy transaction)
        value: rewardAmount,
        gasLimit: 21000
      });

      console.log("Reward deposit transaction submitted:", tx2.hash);
      await tx2.wait();

      // Simulate task creation in memory
      const taskId = Math.floor(Math.random() * 1000000);
      const timestamp = Math.floor(Date.now() / 1000);

      // Return a dummy task object
      return {
        id: taskId,
        title,
        description,
        reward,
        creator: await signer.getAddress(),
        completer: null,
        isCompleted: false,
        createdAt: timestamp,
        hash1: tx1.hash,
        hash2: tx2.hash
      };
    } catch (error: any) {
      console.error("Task creation error:", error);
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected in MetaMask");
      }
      throw error;
    }
  }

  // Complete a task
  public async completeTask(taskId: number): Promise<boolean> {
    try {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }

      const signer = this.provider.getSigner();
      console.log("Simulating task completion...");

      // Simulate a completion transaction
      const tx = await signer.sendTransaction({
        to: await signer.getAddress(), // Send to self (dummy transaction)
        value: ethers.utils.parseEther("0.001"), // Small amount for simulation
        gasLimit: 21000
      });

      console.log("Completion transaction submitted:", tx.hash);
      await tx.wait();

      return true;
    } catch (error: any) {
      console.error("Task completion error:", error);
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected in MetaMask");
      }
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