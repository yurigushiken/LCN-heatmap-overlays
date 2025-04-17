import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';
import '@glidejs/glide/dist/css/glide.theme.min.css';
import '../styles/components/GlideCarousel.css';

const GlideCarousel = forwardRef(({ images, title, startIndex = 0, onSlideChange, showCaptions = false, isFullScreen }, ref) => {
  const glideRef = useRef(null);
  const glideInstanceRef = useRef(null);
  const lastKeyTimeRef = useRef(0); // Track last keypress time

  // Log props on render
  console.log('[GlideCarousel] Rendering with images:', images);

  // Expose focus method via ref
  useImperativeHandle(ref, () => ({
    focusCarousel: () => {
      if (glideRef.current) {
        glideRef.current.focus();
        console.log('[GlideCarousel] focusCarousel called and attempted focus.');
      } else {
        console.log('[GlideCarousel] focusCarousel called but glideRef.current is null.');
      }
    }
  }), []);

  // Improved custom keyboard handler for Glide carousel
  const handleGlideKeyDown = (e) => {
    // Handler attached directly to the focused element, no need to check activeElement
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); // Prevent scrolling

      const now = Date.now();
      // Debounce rapid keypresses
      if (now - lastKeyTimeRef.current >= 100) {
        if (e.key === 'ArrowLeft') {
          glideInstanceRef.current?.go('<'); // Optional chaining for safety
        } else if (e.key === 'ArrowRight') {
          glideInstanceRef.current?.go('>'); // Optional chaining for safety
        }
        lastKeyTimeRef.current = now;
      }
    }
  };

  useEffect(() => {
    console.log('[GlideCarousel] Mount useEffect triggered. Images:', images);
    // Initialize Glide
    if (glideRef.current && images && images.length > 0) {
      console.log('[GlideCarousel] Initializing Glide...');
      const glide = new Glide(glideRef.current, {
        type: 'carousel',
        startAt: startIndex,
        perView: 1,
        gap: 0,
        animationDuration: 250,
        animationTimingFunc: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        peek: 0,
        keyboard: false,
        rewind: false,
        // Disable arrows/bullets via options if only one slide
        controls: images.length > 1,
        bullets: images.length > 1,
      });
      
      // Add event listener for slide changes if callback provided
      if (typeof onSlideChange === 'function') {
        glide.on('run.after', () => {
          onSlideChange(glide.index);
        });
      }
      
      try {
        console.log('[GlideCarousel] Mounting Glide instance...');
        glide.mount();
        console.log('[GlideCarousel] Glide mounted successfully.');
        glideInstanceRef.current = glide; // Store instance in ref
      } catch (error) {
        console.error('[GlideCarousel] Error mounting Glide:', error);
      }
      
      // Cleanup
      return () => {
        console.log('[GlideCarousel] Destroying Glide instance...');
        // Check if instance exists and has destroy method before calling
        if (glideInstanceRef.current && typeof glideInstanceRef.current.destroy === 'function') {
          glide.destroy();
          console.log('[GlideCarousel] Glide instance destroyed.');
        } else {
          console.log('[GlideCarousel] No Glide instance to destroy or destroy not a function.');
        }
        glideInstanceRef.current = null;
      };
    } else {
      console.log('[GlideCarousel] Conditions not met for Glide initialization (no ref or no images).');
    }
  }, [images, startIndex, onSlideChange, isFullScreen]);

  // Reset key timer when clicking navigation buttons
  const handleNavigation = (direction) => {
    // Safely call focusCarousel
    if (ref && ref.current && typeof ref.current.focusCarousel === 'function') {
      ref.current.focusCarousel();
    }
    lastKeyTimeRef.current = 0; // Reset timer to ensure next keypress works
  };

  if (!images || images.length === 0) {
    return <p className="no-plots-message">No images available for this selection.</p>;
  }

  return (
    <div className={`glide-carousel-container ${isFullScreen ? 'glide-carousel-container--fullscreen' : ''}`}>
      {title && <h3 className="carousel-title">{title}</h3>}
      
      <div className="glide" ref={glideRef} tabIndex="-1" onKeyDown={handleGlideKeyDown}>
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
        {images.length > 1 && !isFullScreen && (
          <div className="glide__bullets" data-glide-el="controls[nav]">
            {images.map((_, index) => (
              <button
                key={index}
                className="glide__bullet"
                data-glide-dir={`=${index}`}
                // Safely call focusCarousel on click
                onClick={() => {
                  if (ref && ref.current && typeof ref.current.focusCarousel === 'function') {
                    ref.current.focusCarousel();
                  }
                }}
              ></button>
            ))}
          </div>
        )}
      </div>
      
      {/* Add keyboard hint */}
      <div className="carousel-keyboard-hint">
        Use arrow keys to navigate slides
      </div>
    </div>
  );
});

export default GlideCarousel; 