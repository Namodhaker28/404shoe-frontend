import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/components/Wrapper";
import WishlistItem from "@/components/WishlistItem";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

import {
  addDataFromApi,
  fetchDataFromApi,
  makePaymentRequest,
  updateDataFromApi,
} from "@/utils/api";
import UserContext from "@/context/context";
// import { loadStripe } from "@stripe/stripe-js";
// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// );

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [wishList, setWishList] = useState();
  const contextData = useContext(UserContext);
  const { cartItems } = useSelector((state) => state.cart);

  /**
   * Add product from wishlist to cart
   */
  const addToCart = async (product) => {
    // Check if user is logged in
    const token = Cookies.get("404Token");
    if (!token || !contextData?.user) {
      toast.error("Please login to add items to cart", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    try {
      console.log("Adding to cart", product);

      const body = {
        product: product?._id,
        count: 1,
        color: product?.color?.[0] || "default",
        size: product?.available_sizes?.split("|")[0]?.trim() || "9",
      };

      const res = await addDataFromApi(`cart`, body);
      
      // Update user context
      if (res?.orderBy) {
        contextData.setUser(res.orderBy);
        // Refresh user data
        if (contextData.refreshUser) {
          await contextData.refreshUser();
        }
      }
      
      console.log("Res Cart", res);
      
      // Remove from wishlist after adding to cart
      if (res?.status !== "fail") {
        await removeItem(product?._id);
        toast.success("Added to cart and removed from wishlist!", {
          position: "bottom-right",
          autoClose: 2000,
          theme: "dark",
        });
      } else {
        toast.error(res?.message || "Failed to add to cart", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  const fetchCart = async () => {
    const res = await fetchDataFromApi("wishlist");
    console.log("ress cart", res);
    setWishList(res);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /**
   * Refresh wishlist when user context changes (for real-time updates)
   */
  useEffect(() => {
    if (contextData?.user) {
      fetchCart();
    }
  }, [contextData?.user?.wishlist]);

  /**
   * Remove item from wishlist
   */
  async function removeItem(id) {
    try {
      const body = {
        prodId: id,
      };
      const res = await updateDataFromApi(`wishlist`, body);
      console.log("Res wishlist", res);
      
      // Update user context
      if (res) {
        contextData.setUser(res);
        // Refresh user data for real-time updates
        if (contextData.refreshUser) {
          await contextData.refreshUser();
        }
      }
      
      // Refresh wishlist
      await fetchCart();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  }

  return (
    <div className="w-full md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <ToastContainer />
      <Wrapper>
        {wishList ? (
          <>
            {/* HEADING AND PARAGRAPH START */}
            <div className="text-center max-w-[800px] mx-auto mt-8 md:mt-0">
              <div className="text-[28px] md:text-[34px] mb-5 font-bold leading-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Shopping Wishlist
              </div>
            </div>
            {/* HEADING AND PARAGRAPH END */}

            {/* CART CONTENT START */}
            <div className="flex flex-col lg:flex-row gap-12 py-10">
              {/* CART ITEMS START */}
              <div className="flex-[2]">
                <div className="text-lg font-bold text-white mb-4">Wishlist Items</div>
                {wishList?.map((item) => (
                  <WishlistItem
                    addToCart={addToCart}
                    RemoveFromWishlist={removeItem}
                    key={item.id}
                    data={item}
                  />
                ))}
              </div>
              {/* CART ITEMS END */}

              {/* SUMMARY START */}

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
            <span className="text-xl font-bold text-white mt-4">Your wishlist is empty</span>
            <span className="text-center mt-4 text-gray-300">
              Looks like you have not added anything in your wishlist.
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
