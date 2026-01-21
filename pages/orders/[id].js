import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/components/Wrapper";
import { fetchDataFromApi } from "@/utils/api";
import { toast } from "react-toastify";
import { normalizeProductImages, convertImageObjectToUrl } from "@/utils/helper";

/**
 * Order tracking page
 * Displays order details and status
 */
const OrderDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch order details
   */
  const fetchOrder = async () => {
    if (!id) return;

    try {
      const response = await fetchDataFromApi(`orders/id/${id}`);
      if (response.success && response.order) {
        setOrder(response.order);
      } else {
        toast.error("Order not found");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

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

  /**
   * Get payment status color
   */
  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      paid: "bg-green-500/20 text-green-400 border border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border border-red-500/30",
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

  if (!order) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <h1 className="text-2xl font-bold mb-4 text-white">Order Not Found</h1>
          <Link
            href="/"
            className="py-4 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 mb-3 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            Continue Shopping
          </Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="w-full md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] md:text-[34px] font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Order Details
            </h1>
            <p className="text-gray-400">Order ID: {order._id}</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Order Status</div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Payment Status</div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Transaction Hash */}
          {order.txHash && (
            <div className="mb-8 p-4 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/30">
              <div className="text-sm text-gray-300 mb-2 font-semibold">Transaction Hash</div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-mono break-all text-cyan-400">
                  {order.txHash}
                </code>
                <a
                  href={`https://bscscan.com/tx/${order.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-cyan-400 underline text-sm transition-colors"
                >
                  View on BSCScan
                </a>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Order Items</h2>
            <div className="space-y-4">
              {order.products.map((item, index) => {
                // Get product image URL - handle both old and new formats
                const normalizedImages = normalizeProductImages(item.product?.images || []);
                const productImageUrl = normalizedImages.length > 0 
                    ? normalizedImages[0].url 
                    : (item.product?.images?.[0] ? convertImageObjectToUrl(item.product.images[0]) : null);
                
                // Get product title (support both 'title' and 'name' fields)
                const productTitle = item.product?.title || item.product?.name || "Product";
                
                return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
                >
                  {productImageUrl && (
                    <Image
                      src={productImageUrl}
                      alt={productTitle}
                      width={100}
                      height={100}
                      className="rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">
                      {productTitle}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Size: {item.size || "N/A"} | Quantity: {item.count}
                    </p>
                    <p className="text-sm font-bold mt-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {item.priceUSDT || item.product?.priceUSDT || 0} {item.product?.currency || 'USDT'}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-white">{order.totalUSDT} USDT</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{order.totalUSDT} USDT</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mb-8 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <h3 className="font-semibold mb-2 text-white">Shipping Address</h3>
              <p className="text-gray-300">{order.shippingAddress}</p>
            </div>
          )}

          {/* Order Date */}
          <div className="text-sm text-gray-400 mb-8">
            <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
            {order.verifiedAt && (
              <p>Payment Verified: {new Date(order.verifiedAt).toLocaleString()}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
            >
              Continue Shopping
            </Link>
            {order.txHash && (
              <a
                href={`https://bscscan.com/tx/${order.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
              >
                View Transaction
              </a>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default OrderDetails;
