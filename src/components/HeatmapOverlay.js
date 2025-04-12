import React, { forwardRef, useEffect } from "react";
import "../styles/components/HeatmapOverlay.css";

const HeatmapOverlay = forwardRef(({ heatmapVideoSrc, visible = true, opacity = 1.0 }, ref) => {
  // Determine video type based on file extension
  const getVideoType = (src) => {
    if (!src) return "";
    const ext = src.toLowerCase().split('.').pop();
    switch (ext) {
      case 'webm': return 'video/webm';
      case 'mp4': return 'video/mp4';
      default: return 'video/webm'; // Default to WebM
    }
  };

  // Add debugging - log when overlay is loaded
  useEffect(() => {
    if (heatmapVideoSrc) {
      console.log(`Loading overlay: ${heatmapVideoSrc}`);
    }
  }, [heatmapVideoSrc]);

  return (
    <div 
      className="heatmap-overlay" 
      style={{ 
        opacity: visible ? opacity : 0,
        display: visible ? 'block' : 'none'
      }}
    >
      {heatmapVideoSrc && (
        <video
          ref={ref}
          className="heatmap-video"
          muted
          autoPlay={false}
          playsInline
          loop={true}
          controls={false}
        >
          <source src={heatmapVideoSrc} type={getVideoType(heatmapVideoSrc)} />
          Your browser might not support this video format.
        </video>
      )}
    </div>
  );
});

// Set display name for debugging
HeatmapOverlay.displayName = 'HeatmapOverlay';

export default HeatmapOverlay;
