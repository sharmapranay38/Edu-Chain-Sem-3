// src/services/TaskService.ts
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  TASK_MANAGER_ABI,
  EDU_TOKEN_ADDRESS,
  ERC20_ABI,
} from "../contracts/ContractConfig";

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  creator: string;
  completer: string;
  isCompleted: boolean;
}

// Open Campus Codex testnet details
const CHAIN_ID = 656476;
const RPC_URL = "https://rpc.open-campus-codex.gelato.digital";

class TaskService {
  private static instance: TaskService;
  private provider: ethers.providers.Web3Provider | null = null;
  private taskManager: ethers.Contract | null = null;
  private eduToken: ethers.Contract | null = null;

  private constructor() {
    this.initializeProvider();
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private async initializeProvider() {
    if (window.ethereum) {
      try {
        // Create a simple provider without custom configurations
        this.provider = new ethers.providers.Web3Provider(window.ethereum, {
          name: "Open Campus Codex",
          chainId: CHAIN_ID,
        });

        // Get the network to ensure we're on the right one
        const network = await this.provider.getNetwork();

        // Initialize contracts
        const signer = this.provider.getSigner();
        this.taskManager = new ethers.Contract(
          CONTRACT_ADDRESS,
          TASK_MANAGER_ABI,
          signer
        );
        this.eduToken = new ethers.Contract(
          EDU_TOKEN_ADDRESS,
          ERC20_ABI,
          signer
        );

        console.log(
          "TaskService initialized successfully on network:",
          network.chainId
        );
      } catch (error) {
        console.error("Failed to initialize TaskService provider:", error);
        this.provider = null;
        this.taskManager = null;
        this.eduToken = null;
      }
    } else {
      console.error("Ethereum provider not detected");
    }
  }

  // Reset provider to ensure fresh connection
  public async resetProvider() {
    this.provider = null;
    this.taskManager = null;
    this.eduToken = null;
    await this.initializeProvider();
    return this.isInitialized();
  }

  // Check if service is properly initialized
  public isInitialized(): boolean {
    return !!this.provider && !!this.taskManager && !!this.eduToken;
  }

  // Create a new task
  public async createTask(
    title: string,
    description: string,
    reward: string
  ): Promise<boolean> {
    try {
      // Always try to initialize/reinitialize provider first
      await this.initializeProvider();

      if (!this.isInitialized()) {
        throw new Error("Failed to initialize wallet connection");
      }

      const signer = this.provider!.getSigner();
      const address = await signer.getAddress();

      // Convert reward to Wei
      const rewardInWei = ethers.utils.parseEther(reward);

      // Skip balance check temporarily due to contract issues
      // Instead, we'll rely on the transaction to fail if insufficient funds

      // First try to create the task directly without checking balance
      console.log("Creating task...");
      try {
        const tx = await this.taskManager!.createTask(
          title,
          description,
          rewardInWei,
          { gasLimit: 300000 }
        );
        console.log("Create task transaction sent:", tx.hash);
        await tx.wait();
        console.log("Task created successfully");
        return true;
      } catch (taskError: any) {
        // If the error is about allowance, try to approve first
        if (
          taskError.message &&
          (taskError.message.includes("allowance") ||
            taskError.message.includes("insufficient"))
        ) {
          console.log("Approving tokens...");
          try {
            // Try approval with higher gas limit
            const approveTx = await this.eduToken!.approve(
              CONTRACT_ADDRESS,
              rewardInWei,
              { gasLimit: 300000 }
            );
            console.log("Approval transaction sent:", approveTx.hash);
            await approveTx.wait();
            console.log("Token approval confirmed");

            // Now try to create the task again
            const tx = await this.taskManager!.createTask(
              title,
              description,
              rewardInWei,
              { gasLimit: 300000 }
            );
            console.log("Create task transaction sent:", tx.hash);
            await tx.wait();
            console.log("Task created successfully");
            return true;
          } catch (approveError: any) {
            console.error("Approval error:", approveError);
            throw new Error(
              "Failed to approve token transfer: " +
                (approveError.message || "Unknown error")
            );
          }
        } else {
          // Re-throw the original error
          throw taskError;
        }
      }
    } catch (error: any) {
      console.error("Error in createTask:", error);

      // Handle specific error cases
      if (error.message?.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      } else if (error.code === "CALL_EXCEPTION") {
        throw new Error(
          "Contract call failed. The token contract may be incorrect or not responding."
        );
      } else if (error.code === -32603) {
        throw new Error(
          "Transaction failed. Please ensure you have enough EDU tokens for gas fees"
        );
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
        gasLimit: 500000,
      });
      await tx.wait();
      console.log("Task completed successfully");
      return true;
    } catch (error) {
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

      for (let i = 1; i <= taskCount.toNumber(); i++) {
        try {
          const task = await this.taskManager!.tasks(i);

          tasks.push({
            id: task.id.toNumber(),
            title: task.title,
            description: task.description,
            reward: ethers.utils.formatEther(task.reward),
            creator: task.creator,
            completer: task.completer,
            isCompleted: task.isCompleted,
          });
        } catch (error) {
          console.error(`Error fetching task ${i}:`, error);
          // Continue with other tasks even if one fails
        }
      }

      return tasks;
    } catch (error) {
      console.error("Error getting all tasks:", error);
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
      };
    } catch (error) {
      console.error(`Error getting task ${taskId}:`, error);
      throw error;
    }
  }

  // Get EDU token balance
  public async getEduTokenBalance(address: string): Promise<string> {
    if (!this.isInitialized()) {
      await this.initializeProvider();
      if (!this.isInitialized()) {
        throw new Error("TaskService not initialized");
      }
    }

    try {
      // Use a simpler approach to get the balance
      const balance = await this.eduToken!.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error("Error getting EDU token balance:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default TaskService.getInstance();
