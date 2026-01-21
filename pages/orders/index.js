import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Wrapper from "@/components/Wrapper";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { fetchDataFromApi } from "@/utils/api";
import { toast } from "react-toastify";

/**
 * Orders list page
 * Shows all orders for the connected wallet
 */
const Orders = () => {
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch orders for connected wallet
   */
  const fetchOrders = async () => {
    if (!account) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetchDataFromApi(`orders/${account}`);
      if (response.success && response.orders) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [account, isConnected]);

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      Paid: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      Processing: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      Shipped: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
      Delivered: "bg-green-500/20 text-green-400 border border-green-500/30",
      Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";
  };

  if (loading) {
    return (
      <Wrapper>
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="w-full md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-[28px] md:text-[34px] font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              My Orders
            </h1>
            <WalletConnect />
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">
                Please connect your wallet to view your orders
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">No orders found</p>
              <Link
                href="/"
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-white">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">
                        {order.products.length} item(s)
                      </p>
                    </div>
                    <p className="font-semibold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {order.totalUSDT ? `${order.totalUSDT} USDT` : "N/A"}
                    </p>
                  </div>
                  {order.txHash && (
                    <div className="mt-2 text-xs text-gray-500 font-mono">
                      TX: {order.txHash.slice(0, 20)}...
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default Orders;
