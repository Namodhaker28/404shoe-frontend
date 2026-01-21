import Image from "next/image";
import React, { useContext } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { updateCart, removeFromCart } from "@/store/cartSlice";
import { useDispatch } from "react-redux";
import { updateDataFromApi } from "@/utils/api";
import { useRouter } from "next/router";
import UserContext from "@/context/context";
import Link from "next/link";
import { normalizeProductImages, convertImageObjectToUrl } from "@/utils/helper";

/**
 * WishlistItem component displays a product in the wishlist
 * @param {Object} data - Product data
 * @param {Function} RemoveFromWishlist - Function to remove item from wishlist
 * @param {Function} addToCart - Function to add item to cart
 */
const CartItem = ({ data, RemoveFromWishlist,addToCart }) => {
  // const p = data.attributes;
  const router = useRouter();
  const p = data;
  
  // Get product image URL - handle both old and new formats
  const normalizedImages = normalizeProductImages(p?.images || []);
  const productImageUrl = normalizedImages.length > 0 
      ? normalizedImages[0].url 
      : (p?.images?.[0] ? convertImageObjectToUrl(p.images[0]) : '/placeholder-image.jpg');
  
  // Get product title (support both 'title' and 'name' fields)
  const productTitle = p?.title || p?.name || 'Product';

  // const dispatch = useDispatch();

  // const updateCartItem = (e, key) => {
  //   let payload = {
  //     key,
  //     val: key === "quantity" ? parseInt(e.target.value) : e.target.value,
  //     id: data.id,
  //   };
  //   dispatch(updateCart(payload));
  // };


  return (
    <Link
      href={`/product/${p?._id}`}
      className="flex py-5 gap-3 md:gap-5 border-b border-gray-700 hover:bg-gray-800/50 transition-colors rounded-lg px-2">
      {/* IMAGE START */}
      <div className="shrink-0 aspect-square w-[50px] md:w-[120px]">
        <Image src={productImageUrl} alt={productTitle} width={120} height={120} />
      </div>
      {/* IMAGE END */}

      <div className="w-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between">
          {/* PRODUCT TITLE */}
          <div className="text-lg md:text-2xl font-semibold text-white">
            {productTitle}
          </div>

          {/* PRODUCT SUBTITLE */}
          {p?.sub_title && (
            <div className="text-sm md:text-md font-medium text-gray-400 block md:hidden">
              {p.sub_title}
            </div>
          )}

          {/* PRODUCT PRICE */}
          <div className="text-sm md:text-md font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-2">
            {p?.priceUSDT || p?.price} {p?.currency || 'USDT'}
          </div>
        </div>

        {/* PRODUCT SUBTITLE */}
        {(p?.sub_title || p?.description) && (
          <div className="text-md font-medium text-gray-400 hidden md:block">
            {p?.sub_title || p?.description}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          {/* <div className="flex items-center gap-2 md:gap-10 text-gray-400 text-sm md:text-md">
            <div className="flex items-center gap-1">
              <div className="font-semibold">Size:</div>
              <select
                className="hover:text-white"
                onChange={(e) => updateCartItem(e, "selectedSize")}>
                {p.size.data.map((item, i) => {
                                    return (
                                        <option
                                            key={i}
                                            value={item.size}
                                            disabled={
                                                !item.enabled ? true : false
                                            }
                                            selected={
                                                data.selectedSize === item.size
                                            }
                                        >
                                            {item.size}
                                        </option>
                                    );
                                })}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <div className="font-semibold">Quantity:</div>
              <select
                className="hover:text-white"
                onChange={(e) => updateCartItem(e, "quantity")}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((q, i) => {
                  return (
                    <option key={i} value={q} selected={data.quantity === q}>
                      {q}
                    </option>
                  );
                })}
              </select>
            </div>
          </div> */}
          <RiDeleteBin6Line
            onClick={(e) => {
              e.preventDefault();
              RemoveFromWishlist(p._id);
            }}
            className="cursor-pointer text-gray-400 hover:text-red-400 text-[16px] md:text-[20px] transition-colors"
          />
          <button/>
          <button
           onClick={(e) => {
            e.preventDefault();
            addToCart(p);
          }} className=" bg-green-500 p-2 rounded-lg  text-sm md:text-md font-medium text-white">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CartItem;
