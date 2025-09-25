export interface ABIEvent {
  anonymous: boolean;
  inputs: ABIInput[];
  name: string;
  type: "event";
}

export interface ABIInput {
  indexed: boolean;
  internalType: string;
  name: string;
  type: string;
}

export interface ABIItem {
  anonymous?: boolean;
  inputs?: ABIInput[];
  name?: string;
  type: string;
}

export type ABI = ABIItem[];

export interface NetworkConfig {
  [contractName: string]: {
    address: string;
    startBlock: number;
  };
}

export interface NetworksConfig {
  [networkName: string]: NetworkConfig;
}

export interface PackageJson {
  name: string;
  license: string;
  scripts: {
    [key: string]: string;
  };
  dependencies: {
    [key: string]: string;
  };
  devDependencies: {
    [key: string]: string;
  };
}

export interface TSConfig {
  extends: string;
  include: string[];
}

export interface SubgraphConfig {
  appName: string;
  networkName: string;
  contractAddress: string;
  rpcUrl: string;
  explorerApiUrl?: string;
  startBlock?: number;
  deployNodeUrl?: string;
  ipfsUrl?: string;
}

export interface BlockExplorerResponse {
  status: string;
  result: string;
}

export interface RpcResponse {
  jsonrpc: string;
  id: number;
  result?: string;
  error?: {
    message: string;
  };
}

export interface Logger {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warning: (msg: string) => void;
  error: (msg: string) => void;
  title: (msg: string) => void;
}

export const BLOCK_EXPLORER_EXAMPLES = {
  "Etherscan (Mainnet)": "https://api.etherscan.io/api",
  "Etherscan (Sepolia)": "https://api-sepolia.etherscan.io/api",
  "BSCScan (Mainnet)": "https://api.bscscan.com/api",
  "BSCScan (Testnet)": "https://api-testnet.bscscan.com/api",
  PolygonScan: "https://api.polygonscan.com/api",
  Arbiscan: "https://api.arbiscan.io/api",
  BaseScan: "https://api.basescan.org/api",
  "Snowtrace (Avalanche)": "https://api.snowtrace.io/api",
  "Neura-Testnet": "https://testnet-blockscout.infra.neuraprotocol.io/api"
} as const;

// Default RPC URL
export const DEFAULT_RPC_URL = "https://testnet.rpc.neuraprotocol.io";

// Default block explorer API URL
export const DEFAULT_BLOCK_EXPLORER_API = "https://testnet-blockscout.infra.neuraprotocol.io/api";

// Default deploy endpoints
export const DEFAULT_DEPLOY_NODE_URL = "https://deploy-testnet-graph-neura.infra.neuraprotocol.io/";
export const DEFAULT_IPFS_URL = "https://ipfs-testnet-graph-neura.infra.neuraprotocol.io";
