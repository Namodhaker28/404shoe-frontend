import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getCurrentNetwork } from "@/utils/networkConfig";

/**
 * Wallet connection component with modern web3 styling
 * Displays wallet connection status and provides connect/disconnect functionality
 */
const WalletConnect = ({ onConnect, className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const {
    account,
    isConnected,
    isConnecting,
    error,
    isOnBSC,
    currentNetwork,
    connectWallet,
    disconnectWallet,
    switchToBSC,
    isWalletInstalled,
  } = useWallet();

  // Fix hydration error by only rendering on client
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle wallet connection
   */
  const handleConnect = async () => {
    const connected = await connectWallet();
    if (connected && onConnect) {
      onConnect(account);
    }
  };

  /**
   * Handle network switch
   */
  const handleSwitchNetwork = async () => {
    try {
      await switchToBSC();
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  /**
   * Format wallet address for display
   */
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Prevent hydration mismatch by returning placeholder during SSR
  if (!mounted) {
    return (
      <div className={`${className}`}>
        <div className="px-6 py-2.5 bg-gray-700 rounded-xl animate-pulse">
          <div className="h-5 w-32"></div>
        </div>
      </div>
    );
  }

  if (!isWalletInstalled) {
    return (
      <div className={`${className}`}>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            Install Wallet
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`${className}`}>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 overflow-hidden"
        >
          {isConnecting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="relative z-10">Connecting...</span>
            </>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Connect Wallet
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        {error && (
          <p className="text-red-400 text-xs mt-2 font-medium animate-pulse">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center gap-2`}>
      {!isOnBSC && (
        <button
          onClick={handleSwitchNetwork}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
        >
          Switch to {currentNetwork?.chainName || "BSC"}
        </button>
      )}
      
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg backdrop-blur-sm">
        <div className="relative">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-sm font-mono text-white font-semibold">{formatAddress(account)}</span>
      </div>
      
      <button
        onClick={disconnectWallet}
        className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
      >
        Disconnect
      </button>
      
      {error && (
        <p className="text-red-400 text-xs font-medium">{error}</p>
      )}
    </div>
  );
};

export default WalletConnect;
