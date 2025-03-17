import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  TASK_MANAGER_ABI,
  EDU_TOKEN_ADDRESS,
  ERC20_ABI,
} from "../contracts/ContractConfig";

interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  taskManager: ethers.Contract | null;
  eduToken: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  eduTokenBalance: string | null;
  refreshBalance: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [taskManager, setTaskManager] = useState<ethers.Contract | null>(null);
  const [eduToken, setEduToken] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [eduTokenBalance, setEduTokenBalance] = useState<string | null>(null);

  // Open Campus Codex testnet details
  const targetChainId = 656476; // Open Campus Codex testnet
  const isCorrectNetwork = chainId === targetChainId;

  // Initialize provider and contracts
  const initializeProvider = async () => {
    if (window.ethereum) {
      try {
        // Create a Web3Provider with Open Campus Codex network config
        const web3Provider = new ethers.providers.Web3Provider(
          window.ethereum,
          {
            name: "Open Campus Codex",
            chainId: targetChainId,
          }
        );

        setProvider(web3Provider);

        // Get the network
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);

        // Initialize contracts
        const signer = web3Provider.getSigner();
        const taskManagerContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TASK_MANAGER_ABI,
          signer
        );
        const eduTokenContract = new ethers.Contract(
          EDU_TOKEN_ADDRESS,
          ERC20_ABI,
          signer
        );

        setTaskManager(taskManagerContract);
        setEduToken(eduTokenContract);

        // Check if already connected
        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Failed to initialize provider:", error);
      }
    } else {
      console.error("Ethereum provider not detected");
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

      // Ensure provider is initialized
      if (!provider) {
        await initializeProvider();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setEduTokenBalance(null);
  };

  // Switch network
  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          // Add the Open Campus Codex network
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ethers.utils.hexValue(targetChainId),
                chainName: "Open Campus Codex",
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                blockExplorerUrls: ["https://opencampus-codex.blockscout.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      } else {
        console.error("Failed to switch network:", error);
      }
    }
  };

  // Fetch EDU token balance
  const fetchEduTokenBalance = async () => {
    if (!account || !eduToken || !isCorrectNetwork) {
      setEduTokenBalance(null);
      return;
    }

    try {
      // Use a simpler approach to get the balance
      const contract = eduToken.attach(EDU_TOKEN_ADDRESS);
      const balance = await contract.balanceOf(account);
      setEduTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Failed to fetch EDU token balance:", error);
      setEduTokenBalance(null);
    }
  };

  // Public method to refresh balance
  const refreshBalance = async () => {
    await fetchEduTokenBalance();
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else {
          // User switched accounts
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        // Parse the hexadecimal chain ID
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);

        // Reload the page to ensure all state is updated correctly
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Initialize on mount
      initializeProvider();

      // Cleanup event listeners on unmount
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Fetch token balance when account or network changes
  useEffect(() => {
    fetchEduTokenBalance();
  }, [account, chainId, eduToken]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        taskManager,
        eduToken,
        connectWallet,
        disconnectWallet,
        isConnecting,
        chainId,
        isCorrectNetwork,
        switchNetwork,
        eduTokenBalance,
        refreshBalance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
