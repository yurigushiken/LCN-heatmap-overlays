import React, { forwardRef, useEffect } from "react";
import "../styles/components/HeatmapOverlay.css";

/**
 * Pure presentational component for heatmap video overlays
 * All synchronization is handled by the parent component via videoSyncUtils.js
 */
const HeatmapOverlay = forwardRef(({ heatmapVideoSrc, visible = true, opacity = 0.8 }, ref) => {
  console.log(`HeatmapOverlay rendering with source: ${heatmapVideoSrc?.split('/').pop()}`);
  
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

  // Handle initial set up of the video
  useEffect(() => {
    // Access ref after it's assigned to set properties not available via attributes
    const video = ref?.current;
    if (video) {
      console.log(`HeatmapOverlay useEffect - Setting up video: ${heatmapVideoSrc?.split('/').pop()}`, {
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error,
        src: video.src
      });
      
      // Ensure video is always muted
      video.muted = true;
      // Disable picture-in-picture to avoid interference
      video.disablePictureInPicture = true;
      // Set playsinline to improve mobile compatibility
      video.playsInline = true;

      // Add loadstart event listener to track when video actually starts loading
      const handleLoadStart = () => {
        console.log(`HeatmapOverlay loadstart event: ${heatmapVideoSrc?.split('/').pop()}`);
      };

      // Add loadeddata event listener to track when video data is loaded
      const handleLoadedData = () => {
        console.log(`HeatmapOverlay loadeddata event: ${heatmapVideoSrc?.split('/').pop()}`, {
          readyState: video.readyState,
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
      };

      // Add error event listener to track loading errors
      const handleError = () => {
        console.error(`HeatmapOverlay error loading: ${heatmapVideoSrc?.split('/').pop()}`, {
          error: video.error?.message || video.error?.code,
          networkState: video.networkState
        });
      };

      // Add play event listener
      const handlePlay = () => {
        console.log(`HeatmapOverlay play event: ${heatmapVideoSrc?.split('/').pop()}`);
      };

      // Add pause event listener
      const handlePause = () => {
        console.log(`HeatmapOverlay pause event: ${heatmapVideoSrc?.split('/').pop()}`);
      };

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        console.log(`HeatmapOverlay cleaning up event listeners: ${heatmapVideoSrc?.split('/').pop()}`);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [ref, heatmapVideoSrc]);

  // Don't render overlay if no source is provided
  if (!heatmapVideoSrc) {
    console.log('HeatmapOverlay not rendering - no source provided');
    return null;
  }

  return (
    <div 
      className="heatmap-overlay" 
      style={{ 
        opacity: visible ? opacity : 0,
        display: visible ? 'block' : 'none'
      }}
    >
      <video
        ref={ref}
        className="heatmap-video"
        muted // Always muted to ensure smoother playback
        playsInline // Required for mobile
        preload="auto" // Fully preload for better sync
        controls={false} // No controls - all controlled by sync utility
        loop // Keep looping with main video
      >
        <source src={heatmapVideoSrc} type={getVideoType(heatmapVideoSrc)} />
        Your browser might not support this video format.
      </video>
    </div>
  );
});

// Set display name for debugging
HeatmapOverlay.displayName = 'HeatmapOverlay';

// Memoize the component with a custom comparison function to prevent unnecessary re-renders
export default React.memo(HeatmapOverlay, (prevProps, nextProps) => {
  // Only re-render if these props change
  return prevProps.heatmapVideoSrc === nextProps.heatmapVideoSrc && 
         prevProps.visible === nextProps.visible &&
         prevProps.opacity === nextProps.opacity;
});
