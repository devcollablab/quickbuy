import React from 'react';

const Grid = () => {
  const products = [
    {
      id: 1,
      name: 'Superior Unique Lipstick...',
      image: '/src/assets/product1.jpg',
      price: '₹138',
      rating: 4.0,
      reviews: '5775 Reviews',
      delivery: 'Free Delivery'
    },
    {
      id: 2,
      name: 'Latest Attractive Women...',
      image: '/src/assets/product1.jpg',
      price: '₹154',
      rating: 4.0,
      reviews: '2013 Reviews',
      delivery: 'Free Delivery'
    },
    {
      id: 3,
      name: 'Trimmers',
      image: '/src/assets/product1.jpg',
      price: '₹187',
      rating: 4.0,
      reviews: 'Supplier',
      delivery: 'Free Delivery'
    },
    {
      id: 4,
      name: 'Bluetooth Headphones...',
      image: '/src/assets/product1.jpg',
      price: '₹298',
      rating: 4.3,
      reviews: '1178 Reviews',
      delivery: 'Free Delivery'
    }
  ];

  return (
    <div className="w-full px-4 md:px-6 py-8 md:py-12 bg-white">
      {/* Header */}
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800">Top Picks for You</h2>
      
      {/* Product Grid - Responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md hover:scale-105 transition-shadow duration-300 overflow-hidden">
            {/* Product Image */}
            <div className="relative bg-gray-100 h-40 sm:h-48 md:h-64 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Details */}
            <div className="p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              {/* Price */}
              <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {product.price}
              </p>
              
              {/* Delivery */}
              <p className="text-xs font-semibold text-green-600 mb-3">
                {product.delivery}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  {product.rating}★
                </span>
                <span className="text-xs text-gray-600">
                  {product.reviews}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
