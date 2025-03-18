import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, TASK_MANAGER_ABI } from "@/contracts/ContractConfig";

interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  taskManager: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  eduBalance: string | null;
  refreshBalance: () => Promise<void>;
  checkSufficientBalance: (amount: string) => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [taskManager, setTaskManager] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [eduBalance, setEduBalance] = useState<string | null>(null);

  const targetChainId = 656476; // Open Campus Codex testnet
  const isCorrectNetwork = chainId === targetChainId;

  // Initialize provider and contracts
  const initializeProvider = async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(
          window.ethereum,
          {
            name: "Open Campus Codex",
            chainId: targetChainId,
          }
        );

        setProvider(web3Provider);

        // Get network information
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);

        // Initialize contract
        const signer = web3Provider.getSigner();
        const taskManagerContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TASK_MANAGER_ABI,
          signer
        );

        setTaskManager(taskManagerContract);
      } catch (error) {
        console.error("Failed to initialize provider:", error);
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature!");
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      // Initialize provider if not already done
      if (!provider) {
        await initializeProvider();
      }

      // Store the connected account
      localStorage.setItem("connectedAccount", accounts[0]);

      // Refresh balance
      await refreshBalance();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setEduBalance(null);
    localStorage.removeItem("connectedAccount");
    window.location.href = "/";
  };

  // Switch network
  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: "Open Campus Codex",
                nativeCurrency: {
                  name: "EDU",
                  symbol: "EDU",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
      console.error("Failed to switch network:", error);
    }
  };

  // Refresh EDU balance
  const refreshBalance = async () => {
    if (!provider || !account) return;

    try {
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.utils.formatEther(balance);
      console.log("Current EDU balance:", formattedBalance);
      setEduBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching EDU balance:", error);
      setEduBalance(null);
    }
  };

  // Check if user has sufficient EDU balance
  const checkSufficientBalance = async (amount: string): Promise<boolean> => {
    if (!provider || !account) return false;

    try {
      const balance = await provider.getBalance(account);
      const requiredAmount = ethers.utils.parseEther(amount);
      // Add 10% buffer for gas fees
      const requiredWithGas = requiredAmount.mul(110).div(100);
      return balance.gte(requiredWithGas);
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  };

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          localStorage.setItem("connectedAccount", accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Initialize provider
      initializeProvider();

      // Check for stored account
      const storedAccount = localStorage.getItem("connectedAccount");
      if (storedAccount) {
        setAccount(storedAccount);
      }

      // Cleanup
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Update balance when account or network changes
  useEffect(() => {
    refreshBalance();
  }, [account, chainId]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        taskManager,
        connectWallet,
        disconnectWallet,
        isConnecting,
        chainId,
        isCorrectNetwork,
        switchNetwork,
        eduBalance,
        refreshBalance,
        checkSufficientBalance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
