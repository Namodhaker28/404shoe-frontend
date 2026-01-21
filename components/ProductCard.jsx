import { getDiscountedPricePercentage, normalizeProductImages, convertImageObjectToUrl } from "@/utils/helper";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

/**
 * ProductCard component displays a product card with image, title, and price
 * @param {Object} product - Product object with images, title/name, price, etc.
 */
const ProductCard = ({ product }) => {
  const router = useRouter();
  
  // Get product title (support both 'title' and 'name' fields)
  const productTitle = product?.title || product?.name || 'Product';
  
  // Normalize images and get first image URL
  const normalizedImages = normalizeProductImages(product?.images || []);
  const firstImageUrl = normalizedImages.length > 0 
    ? normalizedImages[0].url 
    : (product?.images?.[0] ? convertImageObjectToUrl(product.images[0]) : '/placeholder-image.jpg');

  return (
    <div
      onClick={() => {
        router.push({
          pathname: `/product/${product?.slug || product?._id}`,
          query: { id: product?._id },
        });
      }}
      className="group transform overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 duration-300 hover:scale-105 hover:border-cyan-500/50 cursor-pointer shadow-lg hover:shadow-cyan-500/20 transition-all">
      <div className="relative overflow-hidden">
        <Image
          width={500}
          height={500}
          src={firstImageUrl}
          alt={productTitle}
          className="transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 text-white">
        <h2 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors">{productTitle}</h2>
        {product?.sub_title && (
          <p className="text-sm text-gray-400 mb-2">{product.sub_title}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {product?.priceUSDT || product?.price} {product?.currency || 'USDT'}
            </p>
            {product?.price && product?.priceUSDT && product.price !== product.priceUSDT && (
              <p className="text-sm text-gray-400 line-through">
                {product?.currency === 'USD' ? '$' : '₹'}{product?.price}
              </p>
            )}
          </div>
          <p className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">
            {getDiscountedPricePercentage(
              product?.price + product?.price / Math.floor(Math.random() * 5),
              product?.price
            )}
            % off
          </p>
        </div>
        {product?.avg_rating && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-300">{product.avg_rating}</span>
            {product?.review_count && (
              <span className="text-xs text-gray-500">({product.review_count} reviews)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
