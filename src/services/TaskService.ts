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
const RPC_URL = "https://rpc.open-campus-codex.gelato.digital"; // Update to match ContractConfig

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

  private async initializeProvider(
    forceDirect: boolean = false
  ): Promise<void> {
    try {
      // If we already have an initialized provider, no need to do it again
      if (this.isInitialized() && !forceDirect) return;

      if (window.ethereum) {
        // Request account access if needed
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Get provider
        this.provider = new ethers.providers.Web3Provider(window.ethereum);

        // Check if we're on the right network
        const network = await this.provider.getNetwork();
        if (network.chainId !== CHAIN_ID) {
          console.log(`Switching to chain ID: ${CHAIN_ID}`);
          try {
            // Try to switch to the right network
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
            });

            // Re-initialize provider after network switch
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
          } catch (switchError: any) {
            console.error("Failed to switch networks:", switchError);

            // If the network isn't added to MetaMask, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: `0x${CHAIN_ID.toString(16)}`,
                      chainName: "Open Campus Codex",
                      rpcUrls: [RPC_URL],
                      blockExplorerUrls: ["https://sepolia.etherscan.io"],
                      nativeCurrency: {
                        name: "Sepolia Ether",
                        symbol: "ETH",
                        decimals: 18,
                      },
                    },
                  ],
                });

                // Re-initialize provider after adding network
                this.provider = new ethers.providers.Web3Provider(
                  window.ethereum
                );
              } catch (addError) {
                console.error("Failed to add network:", addError);
                throw new Error("Failed to add network to wallet");
              }
            } else {
              throw new Error("Failed to switch to the correct network");
            }
          }
        }

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

        console.log("TaskService initialized successfully with wallet");
      } else {
        throw new Error(
          "No Ethereum wallet detected. Please install MetaMask."
        );
      }
    } catch (error) {
      console.error("Error initializing provider:", error);
      this.reset(); // Reset in case of any errors
      throw error;
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

  // Create a new task with direct approach to bypass RPC errors
  public async createTask(
    title: string,
    description: string,
    reward: string
  ): Promise<boolean> {
    try {
      // Force reinitialize with direct RPC connection to avoid MetaMask issues
      await this.initializeProvider(true);

      if (!this.isInitialized()) {
        throw new Error(
          "TaskService not initialized - wallet may not be connected"
        );
      }

      // Print debug information
      const signer = this.provider!.getSigner();
      const userAddress = await signer.getAddress();
      console.log("User address:", userAddress);
      console.log("Contract address:", CONTRACT_ADDRESS);
      console.log("Token address:", EDU_TOKEN_ADDRESS);
      console.log("Using RPC URL:", RPC_URL);

      // Convert reward to Wei
      const rewardInWei = ethers.utils.parseEther(reward);
      console.log("Reward in wei:", rewardInWei.toString());

      // DIRECT APPROACH: Skip approval check and just try to create the task
      // This works if you have already approved tokens for this contract previously
      console.log("Attempting direct task creation (skipping approval)...");

      try {
        // Minimal transaction settings
        const tx = await this.taskManager!.createTask(
          title,
          description,
          rewardInWei,
          {
            gasLimit: 200000,
            gasPrice: ethers.utils.parseUnits("1", "gwei"),
          }
        );
        console.log("Create task transaction sent:", tx.hash);
        await tx.wait();
        console.log("Task created successfully!");
        return true;
      } catch (directError: any) {
        console.error("Direct task creation failed:", directError);

        // Check if we need approval
        if (
          directError.message &&
          (directError.message.includes("allowance") ||
            directError.message.includes("insufficient") ||
            directError.message.includes("ERC20"))
        ) {
          console.log(
            "Approval needed. Attempting approval with minimal settings..."
          );

          try {
            // Try with very minimal gas
            const approveTx = await this.eduToken!.approve(
              CONTRACT_ADDRESS,
              rewardInWei,
              {
                gasLimit: 60000,
                gasPrice: ethers.utils.parseUnits("1", "gwei"),
              }
            );
            console.log("Approval transaction sent:", approveTx.hash);
            await approveTx.wait();
            console.log("Approval successful!");

            // Try task creation again after successful approval
            console.log("Retrying task creation after approval...");
            const tx = await this.taskManager!.createTask(
              title,
              description,
              rewardInWei,
              {
                gasLimit: 200000,
                gasPrice: ethers.utils.parseUnits("1", "gwei"),
              }
            );
            console.log("Create task transaction sent:", tx.hash);
            await tx.wait();
            console.log("Task created successfully after approval!");
            return true;
          } catch (approveError: any) {
            console.error("Approval failed with details:", approveError);

            // Check for JSON-RPC errors
            if (approveError.code === -32603) {
              throw new Error(
                "RPC connection error. This testnet may be experiencing issues. " +
                  "Try switching networks, refreshing the page, or coming back later."
              );
            }

            // If we can't approve, we can't proceed
            throw new Error(
              "Failed to approve tokens: " +
                (approveError.message || "Unknown error")
            );
          }
        } else if (directError.code === -32603) {
          // Handle JSON-RPC errors
          throw new Error(
            "RPC connection error. This testnet may be experiencing issues. " +
              "Try switching networks, refreshing the page, or coming back later."
          );
        } else {
          // Some other error occurred with direct creation
          throw directError;
        }
      }
    } catch (error: any) {
      console.error("Error in createTask:", error);

      // More detailed error categorization
      if (error.message?.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      } else if (error.code === "CALL_EXCEPTION") {
        throw new Error(
          "Contract call failed. This could be due to:\n" +
            "1. The contract address might be incorrect\n" +
            "2. The contract may not be deployed to this network\n" +
            "Check your contract addresses and network settings."
        );
      } else if (error.code === -32603) {
        throw new Error(
          "RPC connection error. This testnet may be experiencing issues. " +
            "Try switching networks, refreshing the page, or coming back later."
        );
      } else {
        // Pass through the original error for debugging
        throw new Error(
          `Task creation failed: ${error.message || "Unknown error"}`
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

  // Reset the service
  private reset() {
    this.provider = null;
    this.taskManager = null;
    this.eduToken = null;
  }
}

// Export singleton instance
export default TaskService.getInstance();
