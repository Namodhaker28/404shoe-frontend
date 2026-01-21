import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getNetworkType, setNetworkType, NETWORK_TYPES, getCurrentNetwork } from "@/utils/networkConfig";
import { toast } from "react-toastify";

/**
 * NetworkSelector component - Allows switching between BSC Mainnet and Testnet
 */
const NetworkSelector = ({ className = "" }) => {
  const { currentNetworkType, switchNetworkType, isConnected } = useWallet();
  const [selectedNetwork, setSelectedNetwork] = useState(currentNetworkType);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setSelectedNetwork(currentNetworkType);
  }, [currentNetworkType]);

  /**
   * Handle network type change
   */
  const handleNetworkChange = async (networkType) => {
    if (networkType === selectedNetwork) {
      return;
    }

    setSwitching(true);
    try {
      await switchNetworkType(networkType);
      setSelectedNetwork(networkType);
      toast.success(`Switched to ${networkType === NETWORK_TYPES.MAINNET ? "Mainnet" : "Testnet"}`, {
        position: "bottom-right",
        autoClose: 2000,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error switching network:", error);
      toast.error(`Failed to switch network: ${error.message}`, {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setSwitching(false);
    }
  };

  const currentNetwork = getCurrentNetwork();
  const isMainnet = selectedNetwork === NETWORK_TYPES.MAINNET;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Network Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
        <div
          className={`h-2 w-2 rounded-full ${
            isMainnet ? "bg-green-400" : "bg-yellow-400"
          }`}
        />
        <span className="text-xs font-medium text-gray-300">
          {isMainnet ? "Mainnet" : "Testnet"}
        </span>
      </div>

      {/* Network Toggle */}
      <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
        <button
          onClick={() => handleNetworkChange(NETWORK_TYPES.MAINNET)}
          disabled={switching || selectedNetwork === NETWORK_TYPES.MAINNET}
          className={`px-3 py-1 text-xs font-medium rounded transition-all ${
            selectedNetwork === NETWORK_TYPES.MAINNET
              ? "bg-cyan-500 text-white"
              : "text-gray-400 hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Mainnet
        </button>
        <button
          onClick={() => handleNetworkChange(NETWORK_TYPES.TESTNET)}
          disabled={switching || selectedNetwork === NETWORK_TYPES.TESTNET}
          className={`px-3 py-1 text-xs font-medium rounded transition-all ${
            selectedNetwork === NETWORK_TYPES.TESTNET
              ? "bg-yellow-500 text-white"
              : "text-gray-400 hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Testnet
        </button>
      </div>

      {/* Network Info Tooltip */}
      {isMainnet ? (
        <div className="hidden md:block text-xs text-gray-500">
          Production Network
        </div>
      ) : (
        <div className="hidden md:block text-xs text-yellow-400">
          Testing Network
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
