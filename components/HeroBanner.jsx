import React from "react";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

import { BiArrowBack } from "react-icons/bi";
import { useRouter } from "next/router";

const HeroBanner = ({ products }) => {
  const router = useRouter();
  return (
    <div
      // onClick={() => {
      //   router.push(`?brand=Nike`);
      // }}
      className="relative text-white text-[20px] w-full  max-w-[1360px] mx-auto">
      <Carousel
        autoPlay={true}
        infiniteLoop={true}
        showThumbs={false}
        showIndicators={false}
        showStatus={false}
        renderArrowPrev={(clickHandler, hasPrev) => (
          <div
            onClick={clickHandler}
            className="absolute right-[31px] md:right-[51px] bottom-0 w-[30px] md:w-[50px] h-[30px] md:h-[50px] bg-gray-800 border border-gray-700 z-10 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors rounded">
            <BiArrowBack className="text-sm md:text-lg text-white" />
          </div>
        )}
        renderArrowNext={(clickHandler, hasNext) => (
          <div
            onClick={clickHandler}
            className="absolute right-0 bottom-0 w-[30px] md:w-[50px] h-[30px] md:h-[50px] bg-gray-800 border border-gray-700 z-10 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors rounded">
            <BiArrowBack className="rotate-180 text-sm md:text-lg text-white" />
          </div>
        )}>
        <div
          onClick={() => {
            router.push(`?brand=Nike`);
          }}>
          <img
            src="/slide-1.png"
            // src={products?.[0]?.images[0]?.url}
            className="aspect-[16/10] md:aspect-auto object-contain "
          />
          <div className="px-[15px] md:px-[40px] py-[10px] md:py-[25px] font-oswald bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 absolute bottom-[25px] md:bottom-[75px] left-0 text-white text-[15px] md:text-[30px] uppercase font-semibold cursor-pointer hover:opacity-90 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all">
            Shop now
          </div>
        </div>

        <div
          onClick={() => {
            router.push(`?brand=Jordan`);
          }}>
          <img
            src="/slide-2.png"
            className="aspect-[16/10] md:aspect-auto object-cover"
          />
          <div className="px-[15px] md:px-[40px] py-[10px] md:py-[25px] font-oswald bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 absolute bottom-[25px] md:bottom-[75px] left-0 text-white text-[15px] md:text-[30px] uppercase font-semibold cursor-pointer hover:opacity-90 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all">
            Shop now
          </div>
        </div>

        <div
          onClick={() => {
            router.push(`?brand=Nike`);
          }}>
          <img
            src="/slide-3.png"
            className="aspect-[16/10] md:aspect-auto object-cover"
          />
          <div className="px-[15px] md:px-[40px] py-[10px] md:py-[25px] font-oswald bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 absolute bottom-[25px] md:bottom-[75px] left-0 text-white text-[15px] md:text-[30px] uppercase font-semibold cursor-pointer hover:opacity-90 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all">
            Shop now
          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default HeroBanner;
