import React, { useState, useEffect } from 'react';

const images = [
  '/signup-bg.png',
  '/luxury_estate.png',
  '/surveying_land.png',
  '/smart_city.png',
  '/gwealth-logo3.0.png'
];

const AuthCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:block relative h-full bg-[#1a1a2e] overflow-hidden">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="GWealth Property Showcase"
          className={`absolute inset-0 w-full h-full ${src.includes('logo') ? 'object-contain p-12' : 'object-cover'} transition-all duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{ transitionProperty: 'opacity, transform', transitionDuration: '1.5s' }}
        />
      ))}
      
      {/* Overlay gradient for professional look */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

      <div className="absolute bottom-8 right-8 w-32 h-32 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center overflow-hidden z-10 hover:scale-105 transition-transform duration-300">
        <img alt="GWealth Nation Logo" className="w-full h-full object-contain" src="/gwealth-logo3.0.png" />
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {images.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthCarousel;
