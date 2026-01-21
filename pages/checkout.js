import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/components/Wrapper";
import WalletConnect from "@/components/WalletConnect";
import AddressForm from "@/components/AddressForm";
import NetworkSelector from "@/components/NetworkSelector";
import { useWallet } from "@/hooks/useWallet";
import { fetchDataFromApi, addDataFromApi, updateDataFromApi, deleteDataFromApi } from "@/utils/api";
import UserContext from "@/context/context";
import { toast } from "react-toastify";
import { normalizeProductImages, convertImageObjectToUrl } from "@/utils/helper";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

/**
 * Checkout page with USDT payment
 * Handles order creation and USDT payment processing
 */
const Checkout = () => {
  const router = useRouter();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [merchantWallet, setMerchantWallet] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const contextData = useContext(UserContext);
  const {
    account,
    isConnected,
    isOnBSC,
    currentNetwork,
    currentNetworkType,
    transferUSDT,
    getUSDTBalance,
    connectWallet,
    switchToBSC,
  } = useWallet();

  /**
   * Fetch cart data
   */
  const fetchCart = async () => {
    try {
      const res = await fetchDataFromApi("cart");
      setCartData(res);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    }
  };

  /**
   * Fetch merchant wallet address from backend
   */
  const fetchMerchantWallet = async () => {
    try {
      // This should be fetched from backend config
      // For now, using environment variable or default
      const wallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET || "0x839CB6B93e55F5263e7F2Ca13ee828f7E2762f3e";
      setMerchantWallet(wallet);
    } catch (error) {
      console.error("Error fetching merchant wallet:", error);
    }
  };

  /**
   * Fetch user's saved addresses
   */
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await fetchDataFromApi("addresses");
      if (res?.success && res.addresses) {
        setAddresses(res.addresses);
        // Set default address as selected if available
        const defaultAddress = res.addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (res.addresses.length > 0) {
          setSelectedAddressId(res.addresses[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  /**
   * Save new or updated address
   */
  const handleSaveAddress = async (addressData) => {
    try {
      if (editingAddress) {
        // Update existing address
        const res = await updateDataFromApi(`addresses/${editingAddress._id}`, addressData);
        if (res?.success) {
          toast.success("Address updated successfully");
          await fetchAddresses();
          setShowAddressForm(false);
          setEditingAddress(null);
        }
      } else {
        // Create new address
        const res = await addDataFromApi("addresses", addressData);
        if (res?.success) {
          toast.success("Address added successfully");
          await fetchAddresses();
          setShowAddressForm(false);
          // Select the newly added address if it's set as default
          if (addressData.isDefault && res.address) {
            setSelectedAddressId(res.address._id);
          }
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address");
      throw error;
    }
  };

  /**
   * Delete an address
   */
  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const res = await deleteDataFromApi(`addresses/${addressId}`);
      if (res?.success) {
        toast.success("Address deleted successfully");
        // If deleted address was selected, clear selection
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
        }
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  /**
   * Set address as default
   */
  const handleSetDefault = async (addressId) => {
    try {
      const res = await updateDataFromApi(`addresses/${addressId}/set-default`, {});
      if (res?.success) {
        toast.success("Default address updated");
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    }
  };

  /**
   * Open address form for editing
   */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  /**
   * Open address form for new address
   */
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  /**
   * Get selected address object
   */
  const getSelectedAddress = () => {
    return addresses.find((addr) => addr._id === selectedAddressId);
  };

  /**
   * Format address for display
   */
  const formatAddress = (address) => {
    if (!address) return "";
    const parts = [
      address.streetAddress,
      address.streetAddress2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  /**
   * Create order on backend
   */
  const createOrder = async () => {
    if (!cartData || !cartData.products || cartData.products.length === 0) {
      toast.error("Cart is empty");
      return null;
    }

    if (!account) {
      toast.error("Please connect your wallet");
      return null;
    }

    try {
      const orderItems = cartData.products.map((item) => ({
        productId: item.product._id || item.product,
        count: item.count,
        size: item.size || 9, // Default size if not specified
        color: item.color || "",
      }));

      // Get selected address or use manual address
      let finalShippingAddress = "";
      let finalAddressId = null;

      if (useManualAddress && manualAddress.trim()) {
        // Use manual address
        finalShippingAddress = manualAddress.trim();
      } else if (selectedAddressId) {
        // Use selected saved address
        const selectedAddress = getSelectedAddress();
        if (selectedAddress) {
          finalShippingAddress = formatAddress(selectedAddress);
          finalAddressId = selectedAddressId;
        }
      }

      // Validate that we have an address
      if (!finalShippingAddress) {
        toast.error("Please select or enter a shipping address");
        return null;
      }

      const orderData = {
        walletAddress: account,
        products: orderItems,
        shippingAddress: finalShippingAddress,
        addressId: finalAddressId, // Store address ID for reference
      };

      const response = await addDataFromApi("orders", orderData);

      if (response.success && response.order) {
        setOrderId(response.order._id);
        return response.order;
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
      return null;
    }
  };

  /**
   * Process USDT payment
   */
  const handlePayment = async () => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) {
        toast.error("Please connect your wallet");
        return;
      }
    }

    if (!isOnBSC) {
      try {
        await switchToBSC();
        toast.info(`Please switch to ${currentNetwork?.chainName || "BSC"}`);
        return;
      } catch (error) {
        toast.error("Failed to switch network");
        return;
      }
    }

    if (!cartData || !cartData.cartTotal) {
      toast.error("Invalid cart data");
      return;
    }

    // Validate shipping address
    const selectedAddress = getSelectedAddress();
    const hasAddress = 
      (useManualAddress && manualAddress.trim()) || 
      (selectedAddressId && selectedAddress);
    
    if (!hasAddress) {
      toast.error("Please select or enter a shipping address");
      return;
    }

    setProcessingPayment(true);

    try {
      // Check USDT balance
      const balance = await getUSDTBalance();
      const requiredAmount = cartData.cartTotal.toString();

      if (parseFloat(balance) < parseFloat(requiredAmount)) {
        toast.error(
          `Insufficient USDT balance. Required: ${requiredAmount} USDT, Available: ${balance} USDT`
        );
        setProcessingPayment(false);
        return;
      }

      // Create order first
      const order = await createOrder();
      if (!order) {
        setProcessingPayment(false);
        return;
      }

      // Get merchant wallet (should be from backend or env)
      const merchantAddress =
        merchantWallet || process.env.NEXT_PUBLIC_MERCHANT_WALLET;

      if (!merchantAddress) {
        toast.error("Merchant wallet address not configured");
        setProcessingPayment(false);
        return;
      }

      // Transfer USDT
      toast.info("Processing payment... Please confirm in your wallet");
      const txResult = await transferUSDT(merchantAddress, requiredAmount);

      if (txResult.success) {
        // Verify payment on backend
        const verifyResponse = await addDataFromApi("orders/verify-payment", {
          txHash: txResult.txHash,
          orderId: order._id,
        });

        if (verifyResponse.success) {
          toast.success("Payment successful! Order confirmed.");
          // Redirect to order confirmation page
          router.push(`/orders/${order._id}`);
        } else {
          toast.warning(
            "Payment sent but verification pending. Your order will be processed shortly."
          );
          router.push(`/orders/${order._id}`);
        }
      } else {
        throw new Error("Payment transaction failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchMerchantWallet();
    fetchAddresses();
  }, []);

  if (!cartData) {
    return (
      <Wrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </Wrapper>
    );
  }

  if (!cartData.products || cartData.products.length === 0) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Image
            src="/empty-cart.jpg"
            width={300}
            height={300}
            className="w-[300px] md:w-[400px]"
          />
          <span className="text-xl font-bold mt-4">Your cart is empty</span>
          <Link
            href="/"
            className="py-4 px-8 rounded-full bg-black text-white text-lg font-medium transition-transform active:scale-95 mb-3 hover:opacity-75 mt-8"
          >
            Continue Shopping
          </Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {showAddressForm && (
        <AddressForm
          address={editingAddress}
          onSave={handleSaveAddress}
          onCancel={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
        />
      )}
      <div className="w-full md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="text-center max-w-[800px] mx-auto mt-8 md:mt-0 mb-8">
          <div className="text-[28px] md:text-[34px] mb-5 font-bold leading-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Checkout
          </div>
          <p className="text-gray-400 text-sm">Complete your purchase with USDT on BSC</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 py-10">
          {/* Order Summary */}
          <div className="flex-[2]">
            <div className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Summary
            </div>
            <div className="space-y-4">
              {cartData.products.map((item, index) => {
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
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-cyan-500/50 transition-all duration-300 shadow-lg"
                >
                  {productImageUrl && (
                    <Image
                      src={productImageUrl}
                      alt={productTitle}
                      width={80}
                      height={80}
                      className="rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {productTitle}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Size: {item.size || "N/A"} | Qty: {item.count}
                    </p>
                    <p className="text-sm font-bold text-cyan-400">
                      {item.product?.priceUSDT || item.price || 0} {item.product?.currency || 'USDT'}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Shipping Address Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-bold text-white">
                  Shipping Address
                </label>
                <button
                  onClick={handleAddAddress}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add New
                </button>
              </div>

              {/* Saved Addresses */}
              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedAddressId === address._id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedAddressId(address._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded">
                                Default
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded capitalize">
                              {address.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-1">
                            {address.fullName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatAddress(address)}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Phone: {address.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                            title="Edit address"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete address"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {!address.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address._id);
                          }}
                          className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-800/50 border border-gray-600 rounded-lg text-center">
                  <p className="text-gray-400 mb-4">No saved addresses</p>
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}

              {/* Manual Address Input Option */}
              <div className="mt-4">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useManualAddress}
                    onChange={(e) => {
                      setUseManualAddress(e.target.checked);
                      if (e.target.checked) {
                        setSelectedAddressId(null);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Enter address manually
                  </span>
                </label>
                {useManualAddress && (
                  <textarea
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all duration-300"
                    rows="4"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="flex-[1]">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl sticky top-20 border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Details
              </div>

              {/* Wallet Connection */}
              <div className="mb-6">
                <WalletConnect
                  onConnect={(address) => {
                    console.log("Wallet connected:", address);
                  }}
                />
              </div>

              {/* Total */}
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-700">
                <div className="uppercase text-md md:text-lg font-medium text-gray-300">
                  Total
                </div>
                <div className="text-md md:text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {cartData.cartTotal} USDT
                </div>
              </div>

              {/* Merchant Wallet Info */}
              {merchantWallet && (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-xs">
                  <div className="font-semibold mb-1 text-gray-400">Merchant Wallet:</div>
                  <div className="font-mono break-all text-cyan-400">{merchantWallet}</div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!isConnected || processingPayment || !isOnBSC}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 mb-3 hover:shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                {processingPayment ? (
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
                    Processing Payment...
                  </>
                ) : !isConnected ? (
                  "Connect Wallet to Pay"
                ) : !isOnBSC ? (
                  "Switch to BSC Network"
                ) : (
                  "Pay with USDT"
                )}
              </button>

              <div className="text-xs text-gray-400 mt-4 space-y-1">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Payment processed on BSC Mainnet
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.613 1.242.988 2.016 1.241.744.238 1.532.327 2.347.327s1.603-.089 2.347-.327c.774-.253 1.454-.628 2.016-1.241a1 1 0 10-1.51-1.31c-.163.187-.452.377-.843.504v-1.941a4.535 4.535 0 001.676-.662C13.398 9.765 14 8.99 14 8c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 5.092V4.151z" clipRule="evenodd" />
                  </svg>
                  BNB required for gas fees
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified on-chain transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Checkout;
