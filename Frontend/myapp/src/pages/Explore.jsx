import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, Loader, X } from 'lucide-react';
import { urlGetProducts } from '../../endpoints';
import customAxios from '../components/customAxios';
import { useNavigate, useLocation } from "react-router-dom";

const Explore = () => {
  const [sortBy, setSortBy] = useState('Relevance');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

const queryParams = new URLSearchParams(location.search);
const categoryFromNav = queryParams.get("category");
const searchFromNav = location.state?.search;


  const categories = [
    'Men',
    'Women',
    'Unisex',
    'Premium',
    'Floral',
    'Wood'
  ];

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      debugger;
      try {
        setLoading(true);
        setError(null);
  
        const response = await customAxios.get(urlGetProducts);
  
        if (response.status === 200 && response.data) {
          setProducts(response.data);
          console.log("products", response.data);
        } else {
          console.error("Failed to fetch products");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFromNav) {
      setSelectedCategories([categoryFromNav]);
    } else {
      setSelectedCategories([]); // 👈 More / direct visit
    }
  }, [categoryFromNav]);

  const filteredProducts = products
  .filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(
        (cat) =>
          product.category?.toLowerCase() === cat.toLowerCase()
      );

    const matchesSearch =
      !searchFromNav ||
      product.name?.toLowerCase().includes(searchFromNav.toLowerCase());

    return matchesCategory && matchesSearch;
  })
  .sort((a, b) => {
    if (sortBy === "Price: Low to High") {
      return Number(a.price) - Number(b.price);
    }

    if (sortBy === "Price: High to Low") {
      return Number(b.price) - Number(a.price);
    }

    if (sortBy === "Newest First") {
      return new Date(b.created_at) - new Date(a.created_at);
      // make sure your backend sends created_at
    }

    // Relevance (default)
    return 0;
  });

  

  

  const handleClick = (id) => {
    debugger;
    navigate(`/product/${id}`);
  };
  

  return (
    <div className="flex bg-gray-50 min-h-screen relative pt-14 md:pt-16">
       
      {/* Overlay for mobile menu */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0 fixed lg:sticky top-16 left-0
  w-80 bg-[#eed7b5] backdrop-blur-md
  p-6 shadow-xl lg:shadow-md
  h-screen lg:h-[calc(100vh-4rem)]
  overflow-y-auto z-40
  transition-transform duration-300
  border-r border-gray-100
`}>
  {/* Mobile Close Button */}
  <button
    onClick={() => setIsSidebarOpen(false)}
    className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-700"
  >
    <X size={24} />
  </button>

  <h2 className="text-lg font-semibold text-gray-900 mb-6">
    Filters
  </h2>

  {/* Sort Section */}
<div className="mb-6">
  <label className="block text-sm font-semibold text-gray-800 mb-2">
    Sort By
  </label>

  <div className="relative">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="
        appearance-none w-full
        px-3 py-2.5 pr-9
        rounded-lg
        border border-gray-200
        bg-gray-50
        text-sm font-medium text-gray-700
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
        focus:bg-white
        transition
        cursor-pointer
      "
    >
      <option>Relevance</option>
      <option>Price: Low to High</option>
      <option>Price: High to Low</option>
      <option>Newest First</option>
    </select>

    <ChevronDown
      size={16}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
</div>

  {/* Category Section */}
  <div className="border-b pb-4">
    <button
      onClick={() => setExpandedCategory(!expandedCategory)}
      className="w-full flex items-center justify-between py-3 text-gray-800 font-semibold"
    >
      <span>Category</span>
      <ChevronDown
        size={20}
        className={`transition-transform ${
          expandedCategory ? 'rotate-180' : ''
        }`}
      />
    </button>

    {expandedCategory && (
      <div className="flex flex-wrap gap-2 mt-3">
        {categories.map((category) => {
          const active = selectedCategories.includes(category);

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200
                border
                ${active
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50"}
              `}
            >
              {category}
            </button>
          );
        })}
      </div>
    )}
  </div>
</aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Header with Title and Sort */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Menu size={20} />
              <span className="text-sm">Filters</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products For You</h1>
          </div>
          
          {/* Sort Dropdown */}
          
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            
            {(filteredProducts.length > 0 ? filteredProducts : products).map((product) => (
              <div
                key={product.id}
                onClick={() => handleClick(product.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative bg-gray-100 h-35 sm:h-48 md:h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Details */}
                <div className="p-2 md:p-4">
                  <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 line-clamp-2 hover:text-gray-900">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {typeof product.price === 'number' ? `₹${product.price}` : product.price}
                  </p>

                  {/* Delivery */}
                  <p className="text-xs font-semibold text-green-600 mb-3">
                    {product.delivery || 'Free Delivery'}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {product.rating || 4}★
                    </span>
                    <span className="text-xs text-gray-600">
                      {product.reviews || 'No reviews'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500 font-medium text-lg">No products available</p>
          </div>
        )}
      </div>
     
    </div>
  );
};

export default Explore;
