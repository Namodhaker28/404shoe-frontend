/**
 * Network configuration for BSC Mainnet and Testnet
 * Allows switching between networks for testing and production
 */

// ============================================
// 🚀 DEV MODE: Set to true for Testnet, false for Mainnet
// ============================================
const USE_TESTNET = true; // 👈 Set to true for Testnet, false for Mainnet
// ============================================

// Network types
export const NETWORK_TYPES = {
  MAINNET: "mainnet",
  TESTNET: "testnet",
};

// Get network type from environment or default to mainnet
export const getNetworkType = () => {
  // Priority 1: DEV_MODE constant (for easy development switching)
  if (USE_TESTNET) {
    return NETWORK_TYPES.TESTNET;
  }
  
  if (typeof window !== "undefined") {
    // Priority 2: Check localStorage (for runtime switching)
    const savedNetwork = localStorage.getItem("bsc_network");
    if (savedNetwork && (savedNetwork === NETWORK_TYPES.MAINNET || savedNetwork === NETWORK_TYPES.TESTNET)) {
      return savedNetwork;
    }
  }
  // Priority 3: Check environment variable
  return process.env.NEXT_PUBLIC_BSC_NETWORK || NETWORK_TYPES.MAINNET;
};

// Set network type
export const setNetworkType = (networkType) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("bsc_network", networkType);
  }
};

// BSC Mainnet Configuration
export const BSC_MAINNET = {
  chainId: 56,
  chainIdHex: "0x38",
  chainName: "Binance Smart Chain Mainnet",
  rpcUrls: [
    "https://bsc-dataseed1.binance.org/",
    "https://bsc-dataseed2.binance.org/",
    "https://bsc-dataseed3.binance.org/",
  ],
  blockExplorerUrls: ["https://bscscan.com"],
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  // USDT BEP-20 Contract Address on BSC Mainnet
  usdtContractAddress: "0x55d398326f99059fF775485246999027B3197955",
  networkType: NETWORK_TYPES.MAINNET,
};

// BSC Testnet Configuration
export const BSC_TESTNET = {
  chainId: 97,
  chainIdHex: "0x61",
  chainName: "Binance Smart Chain Testnet",
  rpcUrls: [
    "https://data-seed-prebsc-1-s1.binance.org:8545/",
    "https://data-seed-prebsc-2-s1.binance.org:8545/",
    "https://data-seed-prebsc-1-s2.binance.org:8545/",
  ],
  blockExplorerUrls: ["https://testnet.bscscan.com"],
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  // USDT Test Token Contract Address on BSC Testnet
  // Note: This is a test token, not real USDT
  // For testing, you can use BUSD testnet or deploy your own test token
  usdtContractAddress: process.env.NEXT_PUBLIC_TESTNET_USDT_CONTRACT || "0xd0584e6f7101e5FB5C13132C42Fa7dFf9e0c0f91",
  networkType: NETWORK_TYPES.TESTNET,
};

/**
 * Get current network configuration
 * @returns {Object} Network configuration object
 */
export const getCurrentNetwork = () => {
  const networkType = getNetworkType();
  const network = networkType === NETWORK_TYPES.TESTNET ? BSC_TESTNET : BSC_MAINNET;
  
  // Log network in development
  if (process.env.NODE_ENV === "development") {
    console.log(`🌐 Using ${network.chainName} (Chain ID: ${network.chainId})`);
  }
  
  return network;
};

/**
 * Get network configuration by type
 * @param {string} networkType - Network type (mainnet or testnet)
 * @returns {Object} Network configuration object
 */
export const getNetworkByType = (networkType) => {
  return networkType === NETWORK_TYPES.TESTNET ? BSC_TESTNET : BSC_MAINNET;
};

/**
 * Get RPC config for wallet_addEthereumChain
 * @param {string} networkType - Network type (mainnet or testnet)
 * @returns {Object} RPC configuration for MetaMask
 */
export const getRPCConfig = (networkType = null) => {
  const network = networkType ? getNetworkByType(networkType) : getCurrentNetwork();
  return {
    chainId: network.chainIdHex,
    chainName: network.chainName,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: network.rpcUrls,
    blockExplorerUrls: network.blockExplorerUrls,
  };
};
