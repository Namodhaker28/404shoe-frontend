import { Fragment, useState, useEffect } from "react";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { fetchDataFromApi } from "@/utils/api";

/**
 * Sort options for products
 */
const sortOptions = [
  { name: "Most Popular", value: "-createdAt", current: false },
  { name: "Best Rating", value: "-avg_rating", current: false },
  { name: "Newest", value: "-createdAt", current: true },
  { name: "Price: Low to High", value: "price", current: false },
  { name: "Price: High to Low", value: "-price", current: false },
];

/**
 * Status options
 */
const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

/**
 * Availability options
 */
const availabilityOptions = [
  { value: "InStock", label: "In Stock" },
  { value: "OutOfStock", label: "Out of Stock" },
];

/**
 * Helper function to combine class names
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Helper function to parse array from query string
 */
const parseArrayFromQuery = (queryValue) => {
  if (!queryValue) return [];
  if (Array.isArray(queryValue)) return queryValue;
  return queryValue.split(",").filter(Boolean);
};

/**
 * Helper function to build array query string
 */
const buildArrayQuery = (array) => {
  if (!array || array.length === 0) return null;
  return array.join(",");
};

/**
 * Comprehensive Filters component with all product filters
 */
export default function Filters() {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);
  const [colors, setColors] = useState([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedSort, setSelectedSort] = useState("-createdAt");

  /**
   * Fetch categories from API
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchDataFromApi("product/category/all");
        if (res && Array.isArray(res)) {
          setCategories(res);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  /**
   * Fetch unique values from products (brands, tags, colors)
   */
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetchDataFromApi("product");
        if (res?.allProducts && Array.isArray(res.allProducts)) {
          // Get unique brands
          const uniqueBrands = [...new Set(res.allProducts.map(p => p.brand).filter(Boolean))];
          setBrands(uniqueBrands.sort());

          // Get unique tags
          const allTags = res.allProducts
            .flatMap(p => (Array.isArray(p.tags) ? p.tags : []))
            .filter(Boolean);
          const uniqueTags = [...new Set(allTags)];
          setTags(uniqueTags.sort());

          // Get unique colors
          const allColors = res.allProducts
            .flatMap(p => (Array.isArray(p.color) ? p.color : []))
            .filter(Boolean);
          const uniqueColors = [...new Set(allColors)];
          setColors(uniqueColors.sort());
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchProductData();
  }, []);

  /**
   * Update selected filters from router query
   */
  useEffect(() => {
    setSelectedCategory(router.query.category || "");
    setSelectedBrand(router.query.brand || "");
    setSelectedStatus(router.query.status || "");
    setSelectedAvailability(router.query.availability || "");
    setSelectedTags(parseArrayFromQuery(router.query.tags));
    setSelectedColors(parseArrayFromQuery(router.query.color));
    setPriceMin(router.query.priceMin || "");
    setPriceMax(router.query.priceMax || "");
    setSelectedSort(router.query.sort || "-createdAt");
  }, [router.query]);

  /**
   * Generic filter update handler
   */
  const updateFilter = (key, value) => {
    const newQuery = { ...router.query };
    
    if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
      delete newQuery[key];
    } else if (Array.isArray(value)) {
      const arrayValue = buildArrayQuery(value);
      if (arrayValue) {
        newQuery[key] = arrayValue;
      } else {
        delete newQuery[key];
      }
    } else {
      newQuery[key] = value;
    }
    
    // Reset to first page when filtering
    delete newQuery.page;
    
    router.push({
      pathname: router.pathname,
      query: newQuery,
    }, undefined, { shallow: true });
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (categorySlug) => {
    const newValue = categorySlug === selectedCategory ? "" : categorySlug;
    setSelectedCategory(newValue);
    updateFilter("category", newValue);
  };

  /**
   * Handle brand filter change
   */
  const handleBrandChange = (brand) => {
    const newValue = brand === selectedBrand ? "" : brand;
    setSelectedBrand(newValue);
    updateFilter("brand", newValue);
  };

  /**
   * Handle status filter change
   */
  const handleStatusChange = (status) => {
    const newValue = status === selectedStatus ? "" : status;
    setSelectedStatus(newValue);
    updateFilter("status", newValue);
  };

  /**
   * Handle availability filter change
   */
  const handleAvailabilityChange = (availability) => {
    const newValue = availability === selectedAvailability ? "" : availability;
    setSelectedAvailability(newValue);
    updateFilter("availability", newValue);
  };

  /**
   * Handle tag filter toggle (multiple selection)
   */
  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    updateFilter("tags", newTags);
  };

  /**
   * Handle color filter toggle (multiple selection)
   */
  const handleColorToggle = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    updateFilter("color", newColors);
  };

  /**
   * Handle price range change
   */
  const handlePriceRangeChange = () => {
    const newQuery = { ...router.query };
    
    if (priceMin) {
      newQuery.priceMin = priceMin;
    } else {
      delete newQuery.priceMin;
    }
    
    if (priceMax) {
      newQuery.priceMax = priceMax;
    } else {
      delete newQuery.priceMax;
    }
    
    delete newQuery.page;
    
    router.push({
      pathname: router.pathname,
      query: newQuery,
    }, undefined, { shallow: true });
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (sortValue) => {
    setSelectedSort(sortValue);
    updateFilter("sort", sortValue);
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    router.push({
      pathname: router.pathname,
      query: {},
    }, undefined, { shallow: true });
  };

  /**
   * Get current sort option name
   */
  const getCurrentSortName = () => {
    const currentSort = sortOptions.find(opt => opt.value === selectedSort);
    return currentSort ? currentSort.name : "Sort";
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = selectedCategory || selectedBrand || selectedStatus || 
    selectedAvailability || selectedTags.length > 0 || selectedColors.length > 0 || 
    priceMin || priceMax;

  return (
    <div className="bg-transparent">
      <div>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-700 py-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                {selectedCategory 
                  ? categories.find(cat => cat.slug === selectedCategory)?.title || "Products"
                  : selectedBrand
                  ? `${selectedBrand} Products`
                  : "All Products"}
              </h1>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              {categories.length > 0 && (
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                    {selectedCategory 
                      ? categories.find(cat => cat.slug === selectedCategory)?.title || "Category"
                      : "Category"}
                    <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                  </Menu.Button>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl max-h-96 overflow-y-auto">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button onClick={() => handleCategoryChange(selectedCategory)} className={classNames(!selectedCategory ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                              All Categories
                            </button>
                          )}
                        </Menu.Item>
                        {categories.map((category) => (
                          <Menu.Item key={category._id || category.slug}>
                            {({ active }) => (
                              <button onClick={() => handleCategoryChange(category.slug)} className={classNames(selectedCategory === category.slug ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                                {category.title}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}

              {/* Brand Filter */}
              {brands.length > 0 && (
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                    {selectedBrand || "Brand"}
                    <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                  </Menu.Button>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl max-h-96 overflow-y-auto">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button onClick={() => handleBrandChange(selectedBrand)} className={classNames(!selectedBrand ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                              All Brands
                            </button>
                          )}
                        </Menu.Item>
                        {brands.map((brand) => (
                          <Menu.Item key={brand}>
                            {({ active }) => (
                              <button onClick={() => handleBrandChange(brand)} className={classNames(selectedBrand === brand ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                                {brand}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}

              {/* Status Filter */}
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                  {selectedStatus || "Status"}
                  <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button onClick={() => handleStatusChange(selectedStatus)} className={classNames(!selectedStatus ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                            All Status
                          </button>
                        )}
                      </Menu.Item>
                      {statusOptions.map((option) => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button onClick={() => handleStatusChange(option.value)} className={classNames(selectedStatus === option.value ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                              {option.label}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Availability Filter */}
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                  {selectedAvailability ? availabilityOptions.find(opt => opt.value === selectedAvailability)?.label : "Availability"}
                  <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button onClick={() => handleAvailabilityChange(selectedAvailability)} className={classNames(!selectedAvailability ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                            All Availability
                          </button>
                        )}
                      </Menu.Item>
                      {availabilityOptions.map((option) => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button onClick={() => handleAvailabilityChange(option.value)} className={classNames(selectedAvailability === option.value ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                              {option.label}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Tags Filter (shows count if selected) */}
              {tags.length > 0 && (
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                    Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                    <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                  </Menu.Button>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl max-h-96 overflow-y-auto">
                      <div className="py-1">
                        {tags.map((tag) => (
                          <Menu.Item key={tag}>
                            {({ active }) => (
                              <label className={classNames(active ? "bg-gray-700" : "", "flex items-center px-4 py-2 text-sm cursor-pointer")}>
                                <input
                                  type="checkbox"
                                  checked={selectedTags.includes(tag)}
                                  onChange={() => handleTagToggle(tag)}
                                  className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span className={classNames(selectedTags.includes(tag) ? "font-medium text-white" : "text-gray-300", "ml-3")}>
                                  {tag}
                                </span>
                              </label>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}

              {/* Colors Filter (shows count if selected) */}
              {colors.length > 0 && (
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                    Colors {selectedColors.length > 0 && `(${selectedColors.length})`}
                    <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                  </Menu.Button>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl max-h-96 overflow-y-auto">
                      <div className="py-1">
                        {colors.map((color) => (
                          <Menu.Item key={color}>
                            {({ active }) => (
                              <label className={classNames(active ? "bg-gray-700" : "", "flex items-center px-4 py-2 text-sm cursor-pointer")}>
                                <input
                                  type="checkbox"
                                  checked={selectedColors.includes(color)}
                                  onChange={() => handleColorToggle(color)}
                                  className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span className={classNames(selectedColors.includes(color) ? "font-medium text-white" : "text-gray-300", "ml-3")}>
                                  {color}
                                </span>
                              </label>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}

              {/* Price Range Filter */}
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                  Price {(priceMin || priceMax) && "✓"}
                  <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Min Price</label>
                        <input
                          type="number"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          onBlur={handlePriceRangeChange}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Max Price</label>
                        <input
                          type="number"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          onBlur={handlePriceRangeChange}
                          placeholder="No limit"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setPriceMin("");
                          setPriceMax("");
                          handlePriceRangeChange();
                        }}
                        className="w-full text-sm text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Clear
                      </button>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Sort Dropdown */}
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 px-3 py-2 rounded-lg hover:border-cyan-500 transition-colors">
                  {getCurrentSortName()}
                  <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-2xl">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item key={option.name}>
                          {({ active }) => (
                            <button onClick={() => handleSortChange(option.value)} className={classNames(selectedSort === option.value ? "font-medium text-white bg-gray-700" : "text-gray-300", active ? "bg-gray-700" : "", "block w-full text-left px-4 py-2 text-sm")}>
                              {option.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Mobile Filters Button */}
              <button
                type="button"
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-300 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}>
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          <Transition.Root show={mobileFiltersOpen} as={Fragment}>
            <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
              <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>
              <div className="fixed inset-0 z-40 flex">
                <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                  <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-gray-900 py-4 pb-12 shadow-xl">
                    <div className="flex items-center justify-between px-4">
                      <h2 className="text-lg font-medium text-white">Filters</h2>
                      <button type="button" className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400" onClick={() => setMobileFiltersOpen(false)}>
                        <span className="sr-only">Close menu</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Mobile Category Filters */}
                    {categories.length > 0 && (
                      <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                              <span className="font-medium text-white">Category</span>
                              {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                            </Disclosure.Button>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-4">
                                <div className="flex items-center">
                                  <input id="category-all" name="category" type="radio" checked={!selectedCategory} onChange={() => handleCategoryChange(selectedCategory)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                  <label htmlFor="category-all" className="ml-3 text-sm text-gray-300">All Categories</label>
                                </div>
                                {categories.map((category) => (
                                  <div key={category._id || category.slug} className="flex items-center">
                                    <input id={`category-${category.slug}`} name="category" type="radio" checked={selectedCategory === category.slug} onChange={() => handleCategoryChange(category.slug)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                    <label htmlFor={`category-${category.slug}`} className="ml-3 text-sm text-gray-300">{category.title}</label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )}

                    {/* Mobile Brand Filters */}
                    {brands.length > 0 && (
                      <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                              <span className="font-medium text-white">Brand</span>
                              {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                            </Disclosure.Button>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-4">
                                <div className="flex items-center">
                                  <input id="brand-all" name="brand" type="radio" checked={!selectedBrand} onChange={() => handleBrandChange(selectedBrand)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                  <label htmlFor="brand-all" className="ml-3 text-sm text-gray-300">All Brands</label>
                                </div>
                                {brands.map((brand) => (
                                  <div key={brand} className="flex items-center">
                                    <input id={`brand-${brand}`} name="brand" type="radio" checked={selectedBrand === brand} onChange={() => handleBrandChange(brand)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                    <label htmlFor={`brand-${brand}`} className="ml-3 text-sm text-gray-300">{brand}</label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )}

                    {/* Mobile Status Filter */}
                    <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                            <span className="font-medium text-white">Status</span>
                            {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                          </Disclosure.Button>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <input id="status-all" name="status" type="radio" checked={!selectedStatus} onChange={() => handleStatusChange(selectedStatus)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                <label htmlFor="status-all" className="ml-3 text-sm text-gray-300">All Status</label>
                              </div>
                              {statusOptions.map((option) => (
                                <div key={option.value} className="flex items-center">
                                  <input id={`status-${option.value}`} name="status" type="radio" checked={selectedStatus === option.value} onChange={() => handleStatusChange(option.value)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                  <label htmlFor={`status-${option.value}`} className="ml-3 text-sm text-gray-300">{option.label}</label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>

                    {/* Mobile Availability Filter */}
                    <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                            <span className="font-medium text-white">Availability</span>
                            {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                          </Disclosure.Button>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <input id="availability-all" name="availability" type="radio" checked={!selectedAvailability} onChange={() => handleAvailabilityChange(selectedAvailability)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                <label htmlFor="availability-all" className="ml-3 text-sm text-gray-300">All Availability</label>
                              </div>
                              {availabilityOptions.map((option) => (
                                <div key={option.value} className="flex items-center">
                                  <input id={`availability-${option.value}`} name="availability" type="radio" checked={selectedAvailability === option.value} onChange={() => handleAvailabilityChange(option.value)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                  <label htmlFor={`availability-${option.value}`} className="ml-3 text-sm text-gray-300">{option.label}</label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>

                    {/* Mobile Tags Filter */}
                    {tags.length > 0 && (
                      <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                              <span className="font-medium text-white">Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                              {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                            </Disclosure.Button>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-4">
                                {tags.map((tag) => (
                                  <div key={tag} className="flex items-center">
                                    <input id={`tag-${tag}`} type="checkbox" checked={selectedTags.includes(tag)} onChange={() => handleTagToggle(tag)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                    <label htmlFor={`tag-${tag}`} className={classNames(selectedTags.includes(tag) ? "font-medium text-white" : "text-gray-300", "ml-3 text-sm")}>{tag}</label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )}

                    {/* Mobile Colors Filter */}
                    {colors.length > 0 && (
                      <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                              <span className="font-medium text-white">Colors {selectedColors.length > 0 && `(${selectedColors.length})`}</span>
                              {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                            </Disclosure.Button>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-4">
                                {colors.map((color) => (
                                  <div key={color} className="flex items-center">
                                    <input id={`color-${color}`} type="checkbox" checked={selectedColors.includes(color)} onChange={() => handleColorToggle(color)} className="h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                                    <label htmlFor={`color-${color}`} className={classNames(selectedColors.includes(color) ? "font-medium text-white" : "text-gray-300", "ml-3 text-sm")}>{color}</label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )}

                    {/* Mobile Price Range Filter */}
                    <Disclosure as="div" className="border-t border-gray-700 px-4 py-6">
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex w-full items-center justify-between bg-gray-900 px-2 py-3 text-gray-400 hover:text-gray-300">
                            <span className="font-medium text-white">Price Range</span>
                            {open ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                          </Disclosure.Button>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                                <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} onBlur={handlePriceRangeChange} placeholder="0" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} onBlur={handlePriceRangeChange} placeholder="No limit" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                              </div>
                              <button onClick={() => { setPriceMin(""); setPriceMax(""); handlePriceRangeChange(); }} className="w-full text-sm text-cyan-400 hover:text-cyan-300 underline">Clear</button>
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>
        </main>
      </div>
    </div>
  );
}
