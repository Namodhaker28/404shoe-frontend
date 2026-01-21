"use-client";

import Filters from "@/components/Filters";
import FiltersSidepanel from "@/components/Filters";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import Wrapper from "@/components/Wrapper";
import { fetchDataFromApi } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Home page component with product listing and filtering
 */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch products with filters from query params
   * Supports: category, brand, status, availability, tags, color, priceMin, priceMax, sort
   */
  const getProducts = async () => {
    try {
      setLoading(true);
      let url = "product";
      const queryParams = [];

      // Add category filter
      if (router.query.category) {
        queryParams.push(`category=${encodeURIComponent(router.query.category)}`);
      }

      // Add brand filter
      if (router.query.brand) {
        queryParams.push(`brand=${encodeURIComponent(router.query.brand)}`);
      }

      // Add status filter
      if (router.query.status) {
        queryParams.push(`status=${encodeURIComponent(router.query.status)}`);
      }

      // Add availability filter
      if (router.query.availability) {
        queryParams.push(`availability=${encodeURIComponent(router.query.availability)}`);
      }

      // Add tags filter (array - send multiple query params with same name)
      if (router.query.tags) {
        const tagsArray = Array.isArray(router.query.tags) 
          ? router.query.tags 
          : router.query.tags.split(",");
        tagsArray.forEach(tag => {
          if (tag) {
            queryParams.push(`tags=${encodeURIComponent(tag)}`);
          }
        });
      }

      // Add color filter (array - send multiple query params with same name)
      if (router.query.color) {
        const colorsArray = Array.isArray(router.query.color)
          ? router.query.color
          : router.query.color.split(",");
        colorsArray.forEach(color => {
          if (color) {
            queryParams.push(`color=${encodeURIComponent(color)}`);
          }
        });
      }

      // Add price range filters
      if (router.query.priceMin) {
        queryParams.push(`price[gte]=${encodeURIComponent(router.query.priceMin)}`);
      }
      if (router.query.priceMax) {
        queryParams.push(`price[lte]=${encodeURIComponent(router.query.priceMax)}`);
      }

      // Add sort
      if (router.query.sort) {
        queryParams.push(`sort=${encodeURIComponent(router.query.sort)}`);
      }

      // Build URL with query params
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const res = await fetchDataFromApi(url);
      setProducts(res?.allProducts || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [router.query]);

  return (
    <main className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">


      <Wrapper>
        {/* heading and paragaph start */}
        {!router.query.brand && <div className="text-center w-full mx-auto my-[50px] md:my-[80px]">
          <div className="text-[28px] md:text-[34px] mb-5 font-bold leading-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Miles of Comfort <br/> Step with Cushioning
          </div>
          <div className="text-md md:text-ellipsis w-2/3 mx-auto text-gray-300">
            Elevate your style and performance with our curated collection of
            top sports and formal shoe brands. Discover the perfect blend of
            comfort and fashion, crafted by industry leaders. Step into
            greatness with iconic sports brands or make a lasting impression at
            any occasion with our formal selections. Explore the ultimate shoe
            destination today!
          </div>
        </div>}
        {/* heading and paragaph end */}

        {/* products grid start */}
        <Filters/>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            {products && products.length > 0 ? (
              <div id="#producs" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-14 px-5 md:px-0">
                {products.map((product) => (
                  <ProductCard key={product?._id || product?.id || Math.random()} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400 mb-4">No products found</p>
                <p className="text-sm text-gray-500">
                  {router.query.category || router.query.brand 
                    ? "Try adjusting your filters"
                    : "Check back later for new products"}
                </p>
              </div>
            )}
          </>
        )}
      </Wrapper>
    </main>
  );
}

// const products = await fetchDataFromApi("products");
