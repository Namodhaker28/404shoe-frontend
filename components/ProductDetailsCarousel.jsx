import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { normalizeProductImages } from "@/utils/helper";

/**
 * ProductDetailsCarousel component displays product images in a carousel
 * @param {Array} images - Array of image objects (supports both URL objects and character-by-character objects)
 */
const ProductDetailsCarousel = ({ images }) => {
    // Normalize images to handle both old and new formats
    const normalizedImages = normalizeProductImages(images);

    // Handle empty or undefined images
    if (!normalizedImages || normalizedImages.length === 0) {
        return (
            <div className="text-white text-[20px] w-full max-w-[1360px] mx-auto sticky top-[50px]">
                <div className="w-full h-[400px] bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No images available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white text-[20px] w-full max-w-[1360px] mx-auto sticky top-[50px]">
            <Carousel
                infiniteLoop={true}
                showIndicators={false}
                showStatus={false}
                thumbWidth={60}
                className="productCarousel"
            >
                {normalizedImages.map((img) => {
                    return (
                        <img
                            key={img._id}
                            src={img.url}
                            alt={img.alt}
                            style={{ height: "100%", objectFit: "contain" }}
                        />
                    );
                })}
            </Carousel>
        </div>
    );
};

export default ProductDetailsCarousel;
