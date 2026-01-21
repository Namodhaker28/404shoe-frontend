import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  getCurrentNetwork,
  getNetworkByType,
  getRPCConfig,
  getNetworkType,
  setNetworkType,
  NETWORK_TYPES,
} from "@/utils/networkConfig";

/**
 * Custom hook for wallet connection and USDT payments
 * Handles MetaMask/Trust Wallet connection, network switching, and USDT transfers
 * Supports both BSC Mainnet and Testnet
 */

// USDT ABI (minimal for transfer)
const USDT_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// USDT has 18 decimals
const USDT_DECIMALS = 18;

/**
 * Custom hook for wallet management
 * @returns {Object} Wallet state and functions
 */
export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  
  // Get current network configuration (always uses USE_TESTNET constant)
  const currentNetwork = getCurrentNetwork();
  // Always get fresh network type from USE_TESTNET constant
  const currentNetworkType = getNetworkType();

  /**
   * Check if wallet is installed (client-side only)
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsWalletInstalled(!!window.ethereum);
    }
  }, []);

  /**
   * Check if wallet is installed (for backward compatibility)
   */
  const checkWalletInstalled = useCallback(() => {
    return typeof window !== "undefined" && window.ethereum;
  }, []);

  /**
   * Get provider instance
   */
  const getProvider = useCallback(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, []);

  /**
   * Check current network
   */
  const checkNetwork = useCallback(async () => {
    if (!checkWalletInstalled()) {
      return false;
    }

    try {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(chainId, 16);

      // Check if connected to the expected network (mainnet or testnet)
      return currentChainId === currentNetwork.chainId;
    } catch (err) {
      console.error("Error checking network:", err);
      return false;
    }
  }, [checkWalletInstalled, currentNetwork]);

  /**
   * Switch to BSC network (Mainnet or Testnet based on USE_TESTNET constant)
   */
  const switchToBSC = useCallback(async (networkType = null) => {
    if (!checkWalletInstalled()) {
      throw new Error("Wallet not installed");
    }

    // Use provided network type or get from USE_TESTNET constant
    const targetNetworkType = networkType || getNetworkType();
    const targetNetwork = getNetworkByType(targetNetworkType);
    const rpcConfig = getRPCConfig(targetNetworkType);

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetNetwork.chainIdHex }],
      });
      return true;
    } catch (switchError) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [rpcConfig],
          });
          return true;
        } catch (addError) {
          throw new Error(`Failed to add ${targetNetwork.chainName}`);
        }
      }
      throw switchError;
    }
  }, [checkWalletInstalled]);

  /**
   * Switch network type (Mainnet <-> Testnet)
   * Note: USE_TESTNET constant takes priority. This updates localStorage for runtime switching.
   * To change network, modify USE_TESTNET in networkConfig.js
   */
  const switchNetworkType = useCallback(async (networkType) => {
    if (networkType !== NETWORK_TYPES.MAINNET && networkType !== NETWORK_TYPES.TESTNET) {
      throw new Error("Invalid network type");
    }

    // Update network type preference in localStorage (for runtime switching)
    setNetworkType(networkType);

    // If wallet is connected, switch to the new network
    if (isConnected && checkWalletInstalled()) {
      try {
        await switchToBSC(networkType);
      } catch (error) {
        console.error("Failed to switch wallet network:", error);
        // Network type is still updated, user can manually switch wallet
      }
    }
  }, [isConnected, checkWalletInstalled, switchToBSC]);

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    if (!checkWalletInstalled()) {
      setError("Please install MetaMask or Trust Wallet");
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const provider = getProvider();
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();

      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);

      // Check if on correct BSC network (mainnet or testnet)
      const isOnBSC = Number(network.chainId) === currentNetwork.chainId;
      if (!isOnBSC) {
        setError(`Please switch to ${currentNetwork.chainName}`);
      }

      return true;
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isWalletInstalled, getProvider]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setError(null);
  }, []);

  /**
   * Get USDT balance
   */
  const getUSDTBalance = useCallback(async (address = null) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    const targetAddress = address || account;
    if (!targetAddress) {
      throw new Error("No address provided");
    }

    try {
      const currentNetwork = getCurrentNetwork();
      const usdtContract = new ethers.Contract(
        currentNetwork.usdtContractAddress,
        USDT_ABI,
        provider
      );
      const balance = await usdtContract.balanceOf(targetAddress);
      return ethers.formatUnits(balance, USDT_DECIMALS);
    } catch (err) {
      console.error("Error getting USDT balance:", err);
      throw err;
    }
  }, [provider, account]);

  /**
   * Transfer USDT
   * @param {string} to - Recipient address
   * @param {string} amount - Amount in USDT (human-readable, e.g., "100.5")
   * @returns {Promise<Object>} Transaction result
   */
  const transferUSDT = useCallback(
    async (to, amount) => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }

      if (!to || !amount) {
        throw new Error("Recipient address and amount are required");
      }

      // Check network
      const isOnBSC = await checkNetwork();
      if (!isOnBSC) {
        const switched = await switchToBSC();
        if (!switched) {
          throw new Error("Please switch to BSC Mainnet");
        }
      }

      try {
        const currentNetwork = getCurrentNetwork();
        const usdtContract = new ethers.Contract(
          currentNetwork.usdtContractAddress,
          USDT_ABI,
          signer
        );

        // Convert amount to BigNumber (with 18 decimals)
        const amountBN = ethers.parseUnits(amount.toString(), USDT_DECIMALS);

        // Estimate gas
        const gasEstimate = await usdtContract.transfer.estimateGas(to, amountBN);

        // Execute transfer
        const tx = await usdtContract.transfer(to, amountBN, {
          gasLimit: gasEstimate,
        });

        // Wait for transaction
        const receipt = await tx.wait();

        return {
          success: true,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          from: receipt.from,
          to: receipt.to,
        };
      } catch (err) {
        console.error("Error transferring USDT:", err);
        throw err;
      }
    },
    [signer, checkNetwork, switchToBSC]
  );

  /**
   * Listen for account changes
   */
  useEffect(() => {
    if (!isWalletInstalled || typeof window === "undefined" || !window.ethereum) {
      return;
    }

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        // Reconnect to update provider/signer
        connectWallet();
      }
    };

    const handleChainChanged = (chainId) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      const currentNetwork = getCurrentNetwork();
      if (newChainId !== currentNetwork.chainId) {
        setError(`Please switch to ${currentNetwork.chainName}`);
      } else {
        setError(null);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isWalletInstalled, connectWallet, disconnectWallet]);

  /**
   * Auto-connect on mount if previously connected
   */
  useEffect(() => {
    const checkConnection = async () => {
      if (isWalletInstalled && typeof window !== "undefined" && window.ethereum?.selectedAddress) {
        await connectWallet();
      }
    };

    if (isWalletInstalled) {
      checkConnection();
    }
  }, [isWalletInstalled, connectWallet]);

  return {
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    provider,
    signer,
    isWalletInstalled,
    isOnBSC: chainId === currentNetwork.chainId,
    currentNetworkType: currentNetwork.networkType,
    currentNetwork,
    connectWallet,
    disconnectWallet,
    switchToBSC,
    switchNetworkType,
    getUSDTBalance,
    transferUSDT,
    USDT_CONTRACT_ADDRESS: currentNetwork.usdtContractAddress,
    BSC_CHAIN_ID: currentNetwork.chainId,
  };
};
