import React, { useEffect, useState } from 'react';
import '../styles/IntroAnimation.css';

const IntroAnimation = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // The spray animation lasts for about 2.5s, then we trigger fade out
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2800);

    // Completely remove the component after fade out transition (0.8s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`intro-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="perfume-bottle-container">
        {/* Spray mist clusters */}
        <div className="spray-mist delay-0"></div>
        <div className="spray-mist delay-1"></div>
        <div className="spray-mist delay-2"></div>
        
        {/* CSS-drawn Perfume Bottle */}
        <div className="bottle">
          <div className="cap"></div>
          <div className="nozzle"></div>
          <div className="body">
            <div className="label">LUXE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
