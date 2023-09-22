import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/components/Wrapper";
import WishlistItem from "@/components/WishlistItem";
import { useSelector } from "react-redux";

import { fetchDataFromApi, makePaymentRequest, updateDataFromApi } from "@/utils/api";
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

  const addToCart = async () => {
    const body = {
      product: id,
      count: count,
      color: "red",
    };

    const res = await addDataFromApi(`cart`, body);
    console.log("Res Cart", res);
    notify();
  };

  const fetchCart = async () => {
    const res = await fetchDataFromApi("wishlist");
    console.log("ress cart", res);
    setWishList(res);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  async function removeItem(id) {
    // console.log('first',e)
    // e.preventDefault();
    const body = {
      prodId: id,
    };
    const res = await updateDataFromApi(`wishlist`, body);
    console.log("Res wishlist", res);
    fetchCart();
    contextData.setUser(res);
    // router.reload();
  }

  return (
    <div className="w-full md:py-20">
      <Wrapper>
        {wishList ? (
          <>
            {/* HEADING AND PARAGRAPH START */}
            <div className="text-center max-w-[800px] mx-auto mt-8 md:mt-0">
              <div className="text-[28px] md:text-[34px] mb-5 font-semibold leading-tight">
                Your Shopping wishlist
              </div>
            </div>
            {/* HEADING AND PARAGRAPH END */}

            {/* CART CONTENT START */}
            <div className="flex flex-col lg:flex-row gap-12 py-10">
              {/* CART ITEMS START */}
              <div className="flex-[2]">
                <div className="text-lg font-bold">wishlist Items</div>
                {wishList?.map((item) => (

                  <WishlistItem RemoveFromWishlist={removeItem}  key={item.id} data={item} />
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
              className="w-[300px] md:w-[400px]"
            />
            <span className="text-xl font-bold">Your cart is empty</span>
            <span className="text-center mt-4">
              Looks like you have not added anything in your cart.
              <br />
              Go ahead and explore top categories.
            </span>
            <Link
              href="/"
              className="py-4 px-8 rounded-full bg-black text-white text-lg font-medium transition-transform active:scale-95 mb-3 hover:opacity-75 mt-8">
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
