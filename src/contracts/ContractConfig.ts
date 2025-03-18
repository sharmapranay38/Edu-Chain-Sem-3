// Open Campus Codex testnet configuration
export const CONTRACT_ADDRESS = "0x5d2ea682734b771cda1315f6e49a3f7c3452cb3c"; // TaskManager contract address on Open Campus Codex testnet

// Open Campus Codex testnet network configuration
export const NETWORK_CONFIG = {
  chainId: 656476, // Open Campus Codex testnet chain ID
  chainName: "Open Campus Codex",
  rpcUrl: "https://rpc.open-campus-codex.gelato.digital",
  blockExplorerUrl: "https://opencampus-codex.blockscout.com",
  nativeCurrency: {
    name: "EDU",
    symbol: "EDU",
    decimals: 18,
  },
};

// ABI of your TaskManager contract
export const TASK_MANAGER_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",

        name: "taskId",

        type: "uint256",
      },
    ],

    name: "completeTask",

    outputs: [],

    stateMutability: "nonpayable",

    type: "function",
  },

  {
    inputs: [
      {
        internalType: "string",

        name: "title",

        type: "string",
      },

      {
        internalType: "string",

        name: "description",

        type: "string",
      },
    ],

    name: "createTask",

    outputs: [],

    stateMutability: "payable",

    type: "function",
  },

  {
    inputs: [],

    stateMutability: "nonpayable",

    type: "constructor",
  },

  {
    anonymous: false,

    inputs: [
      {
        indexed: true,

        internalType: "uint256",

        name: "taskId",

        type: "uint256",
      },

      {
        indexed: true,

        internalType: "address",

        name: "completer",

        type: "address",
      },

      {
        indexed: false,

        internalType: "uint256",

        name: "reward",

        type: "uint256",
      },
    ],

    name: "TaskCompleted",

    type: "event",
  },

  {
    anonymous: false,

    inputs: [
      {
        indexed: true,

        internalType: "uint256",

        name: "taskId",

        type: "uint256",
      },

      {
        indexed: true,

        internalType: "address",

        name: "creator",

        type: "address",
      },

      {
        indexed: false,

        internalType: "uint256",

        name: "reward",

        type: "uint256",
      },
    ],

    name: "TaskCreated",

    type: "event",
  },

  {
    inputs: [],

    name: "taskCounter",

    outputs: [
      {
        internalType: "uint256",

        name: "",

        type: "uint256",
      },
    ],

    stateMutability: "view",

    type: "function",
  },

  {
    inputs: [
      {
        internalType: "uint256",

        name: "",

        type: "uint256",
      },
    ],

    name: "tasks",

    outputs: [
      {
        internalType: "uint256",

        name: "id",

        type: "uint256",
      },

      {
        internalType: "string",

        name: "title",

        type: "string",
      },

      {
        internalType: "string",

        name: "description",

        type: "string",
      },

      {
        internalType: "uint256",

        name: "reward",

        type: "uint256",
      },

      {
        internalType: "address",

        name: "creator",

        type: "address",
      },

      {
        internalType: "address",

        name: "completer",

        type: "address",
      },

      {
        internalType: "bool",

        name: "isCompleted",

        type: "bool",
      },
    ],

    stateMutability: "view",

    type: "function",
  },
];