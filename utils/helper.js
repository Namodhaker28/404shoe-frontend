export const getDiscountedPricePercentage = (
  originalPrice,
  discountedPrice
) => {
  const discount = originalPrice - discountedPrice;

  const discountPercentage = (discount / originalPrice) * 100;

  return discountPercentage.toFixed(2);
};

/**
 * Converts character-by-character image object to URL string
 * @param {Object} imageObj - Image object with numeric keys representing characters
 * @returns {string} - The reconstructed URL string
 */
export const convertImageObjectToUrl = (imageObj) => {
  if (!imageObj || typeof imageObj !== 'object') {
    return '';
  }

  // If it's already a string or has a url property, return it
  if (typeof imageObj === 'string') {
    return imageObj;
  }
  if (imageObj.url) {
    return imageObj.url;
  }

  // Convert character-by-character object to string
  const keys = Object.keys(imageObj)
    .filter(key => key !== '_id' && !isNaN(Number(key)))
    .map(key => Number(key))
    .sort((a, b) => a - b);

  if (keys.length === 0) {
    return '';
  }

  return keys.map(key => imageObj[key]).join('');
};

/**
 * Parses available_sizes string into an array of size objects
 * @param {string} availableSizes - Pipe-separated size string (e.g., "8 | 8.5 | 9")
 * @returns {Array} - Array of size objects with size and stock properties
 */
export const parseAvailableSizes = (availableSizes) => {
  if (!availableSizes || typeof availableSizes !== 'string') {
    return [];
  }

  return availableSizes
    .split('|')
    .map(size => size.trim())
    .filter(size => size.length > 0)
    .map(size => ({
      size,
      stock: 1, // Default stock, can be updated from backend
    }));
};

/**
 * Normalizes product images to array of URL strings
 * Handles both old format (array of {url: string}) and new format (character-by-character objects)
 * Also handles cases where a single image object contains multiple URLs separated by " | "
 * @param {Array} images - Array of image objects or character-by-character objects
 * @returns {Array} - Array of normalized image objects with url property
 */
export const normalizeProductImages = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }

  const normalizedImages = [];

  images.forEach((img, index) => {
    const urlString = convertImageObjectToUrl(img);
    if (!urlString) {
      return;
    }

    // Split by " | " to handle multiple URLs in a single image object
    const urls = urlString.split(' | ').map(url => url.trim()).filter(url => url.length > 0);

    urls.forEach((url, urlIndex) => {
      normalizedImages.push({
        url,
        _id: img?._id ? `${img._id}-${urlIndex}` : `img-${index}-${urlIndex}`,
        alt: img?.alt || `Product image ${normalizedImages.length + 1}`,
      });
    });
  });

  return normalizedImages;
};
