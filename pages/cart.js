import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/components/Wrapper";
import CartItem from "@/components/CartItem";
import { useSelector } from "react-redux";

import { fetchDataFromApi, updateDataFromApi } from "@/utils/api";
import { loadStripe } from "@stripe/stripe-js";
import UserContext from "@/context/context";
// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// );

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState([]);
  const { cartItems } = useSelector((state) => state.cart);
  const contextData = useContext(UserContext)


  // const handlePayment = async () => {
  //   try {
  //     setLoading(true);
  //     const stripe = await stripePromise;
  //     const res = await makePaymentRequest("/api/orders", {
  //       products: cartItems,
  //     });
  //     await stripe.redirectToCheckout({
  //       sessionId: res.stripeSession.id,
  //     });
  //   } catch (error) {
  //     setLoading(false);
  //     console.log(error);
  //   }
  // };

  const fetchCart = async () => {
    const res = await fetchDataFromApi("cart");
    console.log("ress cart", res);
    setCartData(res);
  };

  /**
   * Remove item from cart and refresh data
   */
  const updateCart = async (id) => {
    try {
      const res = await updateDataFromApi(`cart/${id}`);
      console.log("ress cart update", res);
      setCartData(res?.newCart);
      
      // Update user context
      if (res?.updatedUser) {
        contextData.setUser(res.updatedUser);
      }
      
      // Refresh user data for real-time updates
      if (contextData.refreshUser) {
        await contextData.refreshUser();
      }
      
      // Refresh cart data
      await fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  /**
   * Refresh cart when user context changes (for real-time updates)
   */
  useEffect(() => {
    if (contextData?.user) {
      fetchCart();
    }
  }, [contextData?.user?.cart]);

  return (
    <div className="w-full md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <Wrapper>
        {cartData ? (
          <>
            {/* HEADING AND PARAGRAPH START */}
            <div className="text-center max-w-[800px] mx-auto mt-8 md:mt-0">
              <div className="text-[28px] md:text-[34px] mb-5 font-bold leading-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Shopping Cart
              </div>
            </div>
            {/* HEADING AND PARAGRAPH END */}

            {/* CART CONTENT START */}
            <div className="flex flex-col lg:flex-row gap-12 py-10">
              {/* CART ITEMS START */}
              <div className="flex-[2]">
                <div className="text-lg font-bold text-white mb-4">Cart Items</div>
                {cartData?.products?.map((item) => (
                  <CartItem removeFromCart={updateCart} key={item.id} data={item} />
                ))}
              </div>
              {/* CART ITEMS END */}

              {/* SUMMARY START */}
              <div className="flex-[1]">
                <div className="text-lg font-bold text-white mb-4">Summary</div>

                <div className="p-6 my-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
                  <div className="flex justify-between">
                    <div className="uppercase text-md md:text-lg font-medium text-gray-300">
                      Subtotal
                    </div>
                    <div className="text-md md:text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {cartData?.cartTotal} USDT
                    </div>
                  </div>
                  <div className="text-sm md:text-md py-5 border-t border-gray-700 mt-5 text-gray-400">
                    The subtotal reflects the total price of your order,
                    including duties and taxes, before any applicable discounts.
                    It does not include delivery costs and international
                    transaction fees.
                  </div>
                </div>

                {/* BUTTON START */}
                <Link href="/checkout">
                  <button
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 mb-3 hover:shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2 justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Checkout with USDT
                    {loading && <img src="/spinner.svg" />}
                  </button>
                </Link>
                {/* BUTTON END */}
              </div>
              {/* SUMMARY END */}
            </div>
            {/* CART CONTENT END */}
          </>
        ) : (
          <div className="flex-[2] flex flex-col items-center pb-[50px] md:-mt-14">
            <Image
              src="/empty-cart.jpg"
              width={300}
              height={300}
              className="w-[300px] md:w-[400px] rounded-lg opacity-80"
            />
            <span className="text-xl font-bold text-white mt-4">Your cart is empty</span>
            <span className="text-center mt-4 text-gray-300">
              Looks like you have not added anything in your cart.
              <br />
              Go ahead and explore top categories.
            </span>
            <Link
              href="/"
              className="py-4 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 mb-3 hover:shadow-lg hover:shadow-cyan-500/50 mt-8">
              Continue Shopping
            </Link>
          </div>
        )}

        {/* This is empty screen */}
      </Wrapper>
    </div>
  );
};

export default Cart;
