import React from 'react';
import { useNavigate } from 'react-router-dom';



export default function Navigation() {
  const navigate = useNavigate();
  const categories = [
    { id: 1, label: 'Men', image: '/src/assets/product1.jpg' },
    { id: 2, label: 'Women', image: '/src/assets/wmn.jpg'},
    { id: 3, label: 'Unisex', image: '/src/assets/uni.jpg'},
    { id: 4, label: 'More', image: '/src/assets/more.jpg'},
  ];

  const handleCategoryClick = (category) => {
    if (category.label === 'More') {
      navigate('/explore');
    } else {
      console.log('Clicked:', category.label);
    }
  };

  return (
    <nav className="bg-gray-50 border-b border-gray-200 py-3 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start lg:justify-center gap-4 md:gap-8 overflow-x-auto pb-2 min-w-max lg:min-w-full">
          {categories.map((category) => {
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center gap-1 md:gap-2 transition-transform hover:scale-110 focus:outline-none flex-shrink-0"
              >
                {/* Image Container */}
                <div className={`transition-all hover:shadow-lg ${category.id % 2 === 0 ? 'mt-6 md:mt-7' : 'mt-1 md:mt-2'} hover:z-10`}>
                  <img src={category.image} alt={category.label} className="w-16 h-16 md:w-28 md:h-28 object-cover rounded-lg" />
                </div>
                
                {/* Label */}
                <span className="text-xs md:text-sm font-semibold text-gray-800 text-center whitespace-nowrap">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}