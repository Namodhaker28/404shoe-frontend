import React, { useContext, useEffect, useState } from "react";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import Wrapper from "@/components/Wrapper";
import ProductDetailsCarousel from "@/components/ProductDetailsCarousel";
import RelatedProducts from "@/components/RelatedProducts";
import LoginPrompt from "@/components/LoginPrompt";
import { addDataFromApi, fetchDataFromApi, updateDataFromApi } from "@/utils/api";
import { getDiscountedPricePercentage, parseAvailableSizes } from "@/utils/helper";
import ReactMarkdown from "react-markdown";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import Image from "next/image";
import UserContext from "@/context/context";
import Cookies from "js-cookie";

/**
 * ProductDetails component displays detailed product information
 */
const ProductDetails = () => {
  const [selectedSize, setSelectedSize] = useState();
  const [showError, setShowError] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [producId, setProductId] = useState();
  const [p, setP] = useState();
  const [addedToWishlist, setAddedToWishlist] = useState();

  const [count, setCount] = useState(1);
  const contextData = useContext(UserContext);

  /**
   * Check if user is logged in
   */
  const isLoggedIn = () => {
    return !!Cookies.get("404Token") && !!contextData?.user;
  };

  // Get sizes from product data - support both sizes array and available_sizes string
  const sizes = p?.sizes?.length > 0 
    ? p.sizes 
    : (p?.available_sizes ? parseAvailableSizes(p.available_sizes) : []);

  useEffect(() => {
    if (router.query.id || router.query.slug) {
      fetchProduct();
    }
  }, [router.query]);

  const fetchProduct = async () => {
    const id = router.query.id || router.query.slug;
    setProductId(id);
    const res = await fetchDataFromApi(`product/${id}`);
    setP(res);
  };

  /**
   * Add or remove product from wishlist
   */
  const addToWishlist = async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      setLoginPromptMessage("Please login to add items to your wishlist");
      setShowLoginPrompt(true);
      return;
    }

    try {
      setIsAddingToWishlist(true);
      const body = {
        prodId: producId,
      };
      const res = await updateDataFromApi(`wishlist`, body);
      
      // Update user context with latest data
      if (res) {
        contextData.setUser(res);
        // Refresh user data to get latest wishlist info
        if (contextData.refreshUser) {
          await contextData.refreshUser();
        }
        // Show success message
        const isInWishlist = res.wishlist?.includes(producId);
        toast.success(
          isInWishlist ? "Added to wishlist!" : "Removed from wishlist!",
          {
            position: "bottom-right",
            autoClose: 2000,
            theme: "dark",
          }
        );
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  /**
   * Add product to cart
   */
  const addToCart = async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      setLoginPromptMessage("Please login to add items to your cart");
      setShowLoginPrompt(true);
      return;
    }

    // Validate size selection
    if (!selectedSize) {
      setShowError(true);
      document.getElementById("sizesGrid")?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      const body = {
        product: producId,
        count: count,
        color: p?.color?.[0] || "default",
        size: selectedSize,
      };

      const res = await addDataFromApi(`cart`, body);
      
      // Update user context with latest data
      if (res?.orderBy) {
        contextData.setUser(res.orderBy);
        // Refresh user data to get latest cart/wishlist info
        if (contextData.refreshUser) {
          await contextData.refreshUser();
        }
      }
      
      // Show success notification
      if (res?.status !== "fail") {
        notify();
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
    } finally {
      setIsAddingToCart(false);
    }
  };

  const notify = () => {
    toast.success("Success. Check your cart!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <div className="w-full md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <ToastContainer />
      <LoginPrompt 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)}
        message={loginPromptMessage}
      />
      <Wrapper>
        <div className="flex flex-col lg:flex-row md:px-10 gap-[50px] lg:gap-[100px]">
          {/* left column start */}
          <div className="w-full md:w-auto flex-[1.5] max-w-[500px] lg:max-w-full mx-auto lg:mx-0">
            <ProductDetailsCarousel images={p?.images} />
          </div>
          {/* left column end */}

          {/* right column start */}
          <div className="flex-[1] py-3">
            {/* PRODUCT TITLE */}
            <div className="text-[34px] font-semibold mb-2 leading-tight text-white">{p?.title || p?.name}</div>

            {/* PRODUCT SUBTITLE */}
            {p?.sub_title && (
              <div className="text-lg font-semibold mb-2 text-gray-300">{p?.sub_title}</div>
            )}
            
            {/* BRAND */}
            {p?.brand && (
              <div className="text-md font-medium mb-2 text-cyan-400">{p?.brand}</div>
            )}

            {/* RATING */}
            {p?.avg_rating && (
              <div className="flex items-center gap-2 mb-5">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-lg font-semibold text-white">{p.avg_rating}</span>
                {p?.review_count && (
                  <span className="text-sm text-gray-400">({p.review_count} reviews)</span>
                )}
              </div>
            )}

            {/* PRODUCT PRICE */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <p className="mr-2 text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Price: {p?.priceUSDT || p?.price || 0} {p?.currency || 'USDT'}
              </p>
              {p?.price && p?.priceUSDT && p.price !== p.priceUSDT && (
                <p className="text-base font-medium text-gray-400">
                  ({p?.currency === 'USD' ? '$' : '₹'}{p?.price})
                </p>
              )}
            </div>
            
            {/* AVAILABILITY */}
            {p?.availability && (
              <div className={`text-sm font-medium mb-2 ${p.availability === 'InStock' ? 'text-green-400' : 'text-red-400'}`}>
                {p.availability === 'InStock' ? '✓ In Stock' : '✗ Out of Stock'}
              </div>
            )}

            <div className="text-md font-medium text-gray-400 mb-2">incl. of taxes</div>
            <div className="text-md font-medium text-gray-400 mb-20">
              (Also includes all applicable duties)
            </div>

            {/* PRODUCT SIZE RANGE START */}
            <div className="mb-10">
              {/* HEADING START */}
              <div className="flex justify-between mb-2">
                <div className="text-md font-semibold text-white">Select Size</div>
                <div className="text-md font-medium text-gray-400 cursor-pointer hover:text-gray-300">
                  Select Guide
                </div>
              </div>
              {/* HEADING END */}

              {/* SIZE START */}
              <div id="sizesGrid" className="grid grid-cols-3 gap-2">
                {sizes?.length > 0 ? (
                  sizes.map((item, i) => {
                    const isAvailable = item.stock > 0;
                    return (
                      <div
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(item.size);
                            setShowError(false);
                          }
                        }}
                        key={`size-${item.size}-${i}`}
                        className={`border rounded-md text-center py-3 font-medium transition-all ${
                          isAvailable
                            ? "hover:border-cyan-500 cursor-pointer border-gray-600 text-white"
                            : "cursor-not-allowed bg-gray-800 opacity-50 border-gray-700 text-gray-500"
                        } ${selectedSize === item.size ? "border-cyan-500 bg-cyan-500/10" : ""}`}
                        title={isAvailable ? `${item.stock} in stock` : "Out of stock"}
                      >
                        <div>{item.size}</div>
                        {isAvailable && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.stock} left
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500">No sizes available</div>
                )}
              </div>
              {/* SIZE END */}

              {/* SHOW ERROR START */}
              {showError && <div className="text-red-400 mt-1 font-medium">Size selection is required</div>}
              {/* SHOW ERROR END */}
            </div>
            {/* PRODUCT SIZE RANGE END */}

            {/* ADD TO CART BUTTON START */}
            <button
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 mb-3 hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={addToCart}
              disabled={isAddingToCart}>
              {isAddingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Adding...
                </span>
              ) : (
                "Add to Cart"
              )}
            </button>
            {/* ADD TO CART BUTTON END */}

            {/* WHISHLIST BUTTON START */}
            <button
              onClick={addToWishlist}
              disabled={isAddingToWishlist}
              className="w-full py-4 rounded-xl border border-gray-600 text-white text-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover:border-cyan-500 hover:bg-gray-800 mb-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {isAddingToWishlist ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : (
                <>
                  Wishlist
                  {contextData?.user?.wishlist?.includes(producId) ? (
                    <IoMdHeart size={20} className="text-red-500" />
                  ) : (
                    <IoMdHeartEmpty size={20} />
                  )}
                </>
              )}
            </button>
            {/* WHISHLIST BUTTON END */}

            {/* PRODUCT DESCRIPTION */}
            {(p?.description || p?.raw_description) && (
              <div>
                <div className="text-lg font-bold mb-5 text-white">Product Details</div>
                {p?.raw_description ? (
                  <div 
                    className="text-md mb-5 text-gray-300 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: p.raw_description }}
                  />
                ) : (
                  <div className="markdown text-md mb-5 text-gray-300">
                    <ReactMarkdown>{p?.description}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
            
            {/* COLOR OPTIONS */}
            {p?.color && Array.isArray(p.color) && p.color.length > 0 && (
              <div className="mt-5">
                <div className="text-md font-semibold mb-2 text-white">Available Colors</div>
                <div className="flex flex-wrap gap-2">
                  {p.color.map((color, index) => (
                    <span 
                      key={`color-${index}`}
                      className="px-3 py-1 bg-gray-700 rounded-md text-sm text-gray-300"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* MODEL NUMBER */}
            {p?.model && (
              <div className="mt-5 text-sm text-gray-400">
                Model: {p.model}
              </div>
            )}
          </div>
          {/* right column end */}
        </div>

        {/* <RelatedProducts products={products} /> */}
      </Wrapper>
    </div>
  );
};

// export async function getServerSideProps(context) {
//   // Fetch data based on the slug parameter in the URL
//   // const { slug } = context.query;
//   console.log("context",context)

//   // Perform a data fetch using slug to retrieve the product details
//   // Replace this with your actual data fetching logic
//   const product ={}
//   // const product = await fetchDataBySlug(slug);

//   return {
//     props: {
//       context,
//     },
//   };
// }

export default ProductDetails;
