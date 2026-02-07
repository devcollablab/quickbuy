import { CircleDollarSign, ShoppingCart } from "lucide-react";
import {Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import customAxios from "../components/customAxios";
import { urlGetProductById } from "../../endpoints";

const Productview = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
        debugger;
      try {
        const response = await customAxios.get(urlGetProductById(id));
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Loading
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // ✅ Error
  if (error) {
    return (
      <div className="text-center text-red-600 py-20">
        {error}
      </div>
    );
  }

  // ✅ Safety check
  if (!product) {
    return (
      <div className="text-center py-20">
        Product not found
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Image */}
        <div className="md:border-r md:border-gray-200 md:pr-6">
          <img
            src="/src/assets/product1.jpg"
            alt="Wild Stone Edge Perfume"
            className="w-full max-w-sm object-contain"
          />

          {/* Title */}
          <h1 className="text-xl font-semibold text-gray-800">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mt-2">
            <span className="bg-green-600 text-white text-sm font-medium px-2 py-0.5 rounded">
              4.3 ★
            </span>
            <span className="ml-2 text-sm text-gray-600">
              1,88,282 Ratings & 14,367 Reviews
            </span>
          </div>

          {/* Price Section */}
          <div className="mt-4">
            <p className="text-green-600 text-sm font-medium">Special price</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-gray-500 line-through">₹425</span>
              <span className="text-green-600 font-semibold">55% off</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div>
          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded shadow">
              <ShoppingCart className="mr-2 inline-block" /> GO TO CART
            </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded shadow">
             <CircleDollarSign className="mr-2 inline-block" />BUY NOW </button>
          </div>
          {/* Offers */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Specifications
            </h2>

            {/* In The Box */}
            <div className="border-b pb-6 mb-6">
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                In The Box
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <p className="text-gray-500">Sales Package</p>
                <p className="text-gray-800">1 perfume</p>

                <p className="text-gray-500">Pack of</p>
                <p className="text-gray-800">1</p>
              </div>
            </div>

            {/* General */}
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                General
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <p className="text-gray-500">Brand</p>
                <p className="text-gray-800">Wild Stone</p>

                <p className="text-gray-500">Model Name</p>
                <p className="text-gray-800">Edge Perfume Eau de Parfum</p>

                <p className="text-gray-500">Ideal For</p>
                <p className="text-gray-800">Men</p>

                <p className="text-gray-500">Quantity</p>
                <p className="text-gray-800">50 ml</p>

                <p className="text-gray-500">Fragrance Type</p>
                <p className="text-gray-800">Woody</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productview;


// import {Loader } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import customAxios from "../components/customAxios";
// import { urlGetProductById } from "../../endpoints";

// const Productview = () => {
//   const { id } = useParams();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//         debugger;
//       try {
//         const response = await customAxios.get(urlGetProductById(id));
//         setProduct(response.data);
//       } catch (err) {
//         console.error("Error fetching product", err);
//         setError("Failed to load product details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   // ✅ Loading
//   if (loading) {
//     return (
//       <div className="flex justify-center py-20">
//         <Loader className="animate-spin text-blue-600" size={32} />
//       </div>
//     );
//   }

//   // ✅ Error
//   if (error) {
//     return (
//       <div className="text-center text-red-600 py-20">
//         {error}
//       </div>
//     );
//   }

//   // ✅ Safety check
//   if (!product) {
//     return (
//       <div className="text-center py-20">
//         Product not found
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4 bg-white">
//       <h1 className="text-xl font-semibold">{product.name}</h1>
//       <p className="text-3xl font-bold">₹{product.price}</p>
      
//     </div>
//   );
// };

// export default Productview;
