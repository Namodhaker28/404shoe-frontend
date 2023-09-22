import { getDiscountedPricePercentage } from "@/utils/helper";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
const ProductCard = ({ product }) => {
  const router = useRouter()
  return (
    <div
      onClick={() => {
        router.push({
          pathname: `/product/${product?.slug}`,
          query: { id: product?._id },
        });
      }}
      className="transform overflow-hidden bg-white duration-200 hover:scale-105 cursor-pointer">
      <Image
        width={500}
        height={500}
        src={product?.images[0]?.url}
        alt={product?.title}
      />
      <div className="p-4 text-black/[0.9]">
        <h2 className="text-lg font-medium">{product?.title}</h2>
        <div className="flex items-center text-black/[0.5]">
          <p className="mr-2 text-lg font-semibold">&#8377;{product?.price}</p>

          {/* {product.original_price && ( */}
          <>
            <p className="text-base  font-medium line-through">
              &#8377;{product?.price + product?.price / 2}
            </p>
            <p className="ml-auto text-base font-medium text-green-500">
              {getDiscountedPricePercentage(
                product?.price + product?.price / Math.floor(Math.random() * 5),
                product?.price
              )}
              % off
            </p>
          </>
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
