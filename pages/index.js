"use-client";

import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import Wrapper from "@/components/Wrapper";
import { fetchDataFromApi } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState();
  const router = useRouter();


  const getProducts = async () => {
    let url = "product";
    if (router.query.brand) {
      url += `?brand=${router.query.brand}`;
    }
    const res = await fetchDataFromApi(url);
    setProducts(res?.allProducts);
  };

  useEffect(() => {
    getProducts();
  }, [router.query]);

  return (
    <main>
      {!router.query.brand && <HeroBanner products={products} />}


      <Wrapper>
        {/* heading and paragaph start */}
        <div className="text-center w-full  mx-auto my-[50px] md:my-[80px]">
          <div className="text-[28px] md:text-[34px] mb-5 font-semibold leading-tight">
          Miles of Comfort <br/> Step with Cushioning
          </div>
          <div className="text-md md:text-ellipsis w-2/3">
            Elevate your style and performance with our curated collection of
            top sports and formal shoe brands. Discover the perfect blend of
            comfort and fashion, crafted by industry leaders. Step into
            greatness with iconic sports brands or make a lasting impression at
            any occasion with our formal selections. Explore the ultimate shoe
            destination today!"
          </div>
        </div>
        {/* heading and paragaph end */}

        {/* products grid start */}
        <div id="#producs" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-14 px-5 md:px-0">
          {products?.map((product) => (
            <ProductCard key={product?.id} product={product} />
          ))}
        </div>
      </Wrapper>
    </main>
  );
}

// const products = await fetchDataFromApi("products");
