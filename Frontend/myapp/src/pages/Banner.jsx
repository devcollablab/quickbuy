import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Sample banner images - replace with your actual image URLs
  const slides = [
    {
      id: 1,
      image: '/src/assets/Bnr1.jpg',
      title: 'Premium Fragrances',
      description: 'Discover our exclusive collection'
    },
    {
      id: 2,
      image: '/src/assets/Bnr2.jpg',
      title: 'Summer Collection',
      description: 'Fresh scents for warm days'
    },
    {
      id: 3,
      image: '/src/assets/Bnr3.jpg',
      title: 'Luxury Edition',
      description: 'Experience pure elegance'
    },
    {
      id: 4,
      image: '/src/assets/Bnr1.jpg',
      title: 'Special Offer',
      description: 'Up to 50% off this week'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, slides.length]);

  // const goToPrevious = () => {
  //   setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  //   setAutoPlay(false);
  // };

  // const goToNext = () => {
  //   setCurrentSlide((prev) => (prev + 1) % slides.length);
  //   setAutoPlay(false);
  // };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  return (
    <div className="relative w-full h-48 md:h-96 overflow-hidden bg-gray-900">
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay and Text */}
            <div className="absolute inset-0 flex flex-col justify-center items-center px-4">
              <h2 className="text-xl md:text-4xl font-bold text-white mb-1 md:mb-2 text-center">{slide.title}</h2>
              <p className="text-sm md:text-lg text-gray-100 text-center">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 md:p-2 transition-all"
      >
        <ChevronLeft size={20} className="md:w-8 md:h-8 w-5 h-5 text-gray-900" />
      </button>

      {/* Right Arrow */}
      {/* <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 md:p-2 transition-all"
      >
        <ChevronRight size={32} className="text-gray-900" />
      </button>  */}

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
