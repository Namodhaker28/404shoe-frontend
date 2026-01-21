import Image from "next/image";
import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { updateCart, removeFromCart } from "@/store/cartSlice";
import { useDispatch } from "react-redux";
import { normalizeProductImages, convertImageObjectToUrl } from "@/utils/helper";

/**
 * CartItem component displays a product in the cart
 * @param {Object} data - Cart item data with product information
 * @param {Function} removeFromCart - Function to remove item from cart
 */
const CartItem = ({ data,removeFromCart }) => {
    // const p = data.attributes;
    const p = data;

    const dispatch = useDispatch();
    
    // Get product image URL - handle both old and new formats
    const normalizedImages = normalizeProductImages(p?.product?.images || []);
    const productImageUrl = normalizedImages.length > 0 
        ? normalizedImages[0].url 
        : (p?.product?.images?.[0] ? convertImageObjectToUrl(p.product.images[0]) : '/placeholder-image.jpg');
    
    // Get product title (support both 'title' and 'name' fields)
    const productTitle = p?.product?.title || p?.product?.name || 'Product';

    // const updateCartItem = (e, key) => {
    //     let payload = {
    //         key,
    //         val: key === "quantity" ? parseInt(e.target.value) : e.target.value,
    //         id: data.id,
    //     };
    //     dispatch(updateCart(payload));
    // };

    return (
        <div className="flex py-5 gap-3 md:gap-5 border-b border-gray-700">
            {/* IMAGE START */}
            <div className="shrink-0 aspect-square w-[50px] md:w-[120px]">
                <Image
                    src={productImageUrl}
                    alt={productTitle}
                    width={120}
                    height={120}
                    className="rounded"
                />
            </div>
            {/* IMAGE END */}

            <div className="w-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between">
                    {/* PRODUCT TITLE */}
                    <div className="text-lg md:text-2xl font-semibold text-white">
                        {productTitle}
                    </div>

                    {/* PRODUCT SUBTITLE */}
                    {p.product?.sub_title && (
                        <div className="text-sm md:text-md font-medium text-gray-400 block md:hidden">
                            {p.product.sub_title}
                        </div>
                    )}

                    {/* PRODUCT PRICE */}
                    <div className="text-sm md:text-md font-bold text-cyan-400 mt-2">
                        {p.product?.priceUSDT || p.product?.price} {p.product?.currency || 'USDT'}
                    </div>
                </div>

                {/* PRODUCT SUBTITLE */}
                {(p.product?.sub_title || p.product?.description) && (
                    <div className="text-md font-medium text-gray-400 hidden md:block">
                        {p.product?.sub_title || p.product?.description}
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
                    <div className="text-gray-300">
                        Selected size: <span className="font-semibold text-white">{p.size}</span>
                    </div>
                    <RiDeleteBin6Line
                        onClick={() =>{
                          removeFromCart(data?.product?._id)}
                        }
                        className="cursor-pointer text-gray-400 hover:text-red-400 text-[16px] md:text-[20px] transition-colors"
                    />
                </div>
            </div>
        </div>
    );
};

export default CartItem;
