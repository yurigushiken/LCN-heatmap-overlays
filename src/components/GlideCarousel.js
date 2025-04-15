import React, { useEffect, useRef } from 'react';
import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';
import '@glidejs/glide/dist/css/glide.theme.min.css';
import '../styles/components/GlideCarousel.css';

const GlideCarousel = ({ images, title, startIndex = 0, onSlideChange, showCaptions = false }) => {
  const glideRef = useRef(null);
  const containerRef = useRef(null);
  const glideInstanceRef = useRef(null);
  const lastKeyTimeRef = useRef(0); // Track last keypress time

  // Improved custom keyboard handler for Glide carousel
  const handleGlideKeyDown = (e) => {
    // Only process keyboard events when this component has focus
    if (document.activeElement === containerRef.current) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent scrolling

        // Get current time for debouncing
        const now = Date.now();
        
        // Allow keypresses if more than 100ms have passed
        // This prevents overwhelming the carousel with rapid keypresses
        if (now - lastKeyTimeRef.current >= 100) {
          if (e.key === 'ArrowLeft') {
            glideInstanceRef.current.go('<'); // Go to previous slide
          } else if (e.key === 'ArrowRight') {
            glideInstanceRef.current.go('>'); // Go to next slide
          }
          
          // Update last keypress time
          lastKeyTimeRef.current = now;
        }
      }
    }
  };

  useEffect(() => {
    // Initialize Glide
    if (glideRef.current && images && images.length > 0) {
      const glide = new Glide(glideRef.current, {
        type: 'carousel',
        startAt: startIndex, // Use the provided startIndex
        perView: 1,
        gap: 0,
        animationDuration: 250, // Increased from 100ms to 250ms for smoother animation
        animationTimingFunc: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)', // More natural easing curve
        peek: 0,
        keyboard: false, // Disable Glide's built-in keyboard handling
        rewind: false // Prevent rewinding which can cause delays
      });
      
      // Add event listener for slide changes if callback provided
      if (typeof onSlideChange === 'function') {
        glide.on('run.after', () => {
          onSlideChange(glide.index);
        });
      }
      
      glide.mount();
      glideInstanceRef.current = glide; // Store instance in ref
      
      // Cleanup
      return () => {
        glide.destroy();
        glideInstanceRef.current = null;
      };
    }
  }, [images, startIndex, onSlideChange]);

  // Focus the carousel container
  const focusCarousel = () => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Reset key timer when clicking navigation buttons
  const handleNavigation = (direction) => {
    focusCarousel();
    lastKeyTimeRef.current = 0; // Reset timer to ensure next keypress works
  };

  if (!images || images.length === 0) {
    return <p className="no-plots-message">No images available for this selection.</p>;
  }

  return (
    <div 
      className="glide-carousel-container"
      tabIndex="0" // Make container focusable
      ref={containerRef}
      onKeyDown={handleGlideKeyDown}
    >
      {title && <h3 className="carousel-title">{title}</h3>}
      
      <div className="glide" ref={glideRef}>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">
            {images.map((image, index) => (
              <li key={index} className="glide__slide">
                <div className="image-frame">
                  <img 
                    src={image.src} 
                    alt={image.alt || `Slide ${index + 1}`} 
                  />
                  {showCaptions && image.caption && (
                    <div className="image-caption">
                      <p>{image.caption}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Navigation arrows */}
        <div className="glide__arrows" data-glide-el="controls">
          <button 
            className="glide__arrow glide__arrow--left" 
            data-glide-dir="<"
            onClick={() => handleNavigation('left')}
          >
            &lt;
          </button>
          <button 
            className="glide__arrow glide__arrow--right" 
            data-glide-dir=">"
            onClick={() => handleNavigation('right')}
          >
            &gt;
          </button>
        </div>
        
        {/* Pagination dots */}
        <div className="glide__bullets" data-glide-el="controls[nav]">
          {images.map((_, index) => (
            <button 
              key={index} 
              className="glide__bullet" 
              data-glide-dir={`=${index}`}
              onClick={focusCarousel}
            ></button>
          ))}
        </div>
      </div>
      
      {/* Add keyboard hint */}
      <div className="carousel-keyboard-hint">
        Use arrow keys to navigate slides
      </div>
    </div>
  );
};

export default GlideCarousel; 