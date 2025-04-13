// src/components/VideoPlayer.js

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import "../styles/components/VideoPlayer.css";
import HeatmapOverlay from "./HeatmapOverlay";
import { syncOverlayVideos } from "../utils/videoSyncUtils";
import { useVideo } from "../utils/VideoContext";

/**
 * Video player component that handles all synchronization between the main video
 * and overlay videos using videoSyncUtils.js
 */
const VideoPlayer = ({ videoSrc, activeOverlays, overlayData }) => {
  console.log("VideoPlayer rendering with active overlays:", activeOverlays);
  
  // Use only the context videoRef - no local ref needed
  const overlayRefs = useRef({});
  
  // Track which overlays are fully loaded
  const [loadedOverlays, setLoadedOverlays] = useState({});
  
  // Get the shared video ref from context
  const { videoRef, handleTimeUpdate, handleDurationChange } = useVideo();

  // Stable callback for assigning refs to prevent ref assignment from causing re-renders
  const getOverlayRef = useCallback((id) => (video) => {
    if (video) {
      console.log(`Ref assigned for overlay ${id}`, {
        readyState: video.readyState
      });
      // Store ref for later synchronization
      overlayRefs.current[id] = video;
    } else {
      console.log(`Ref removed for overlay ${id}`);
      // Clean up ref when component unmounts
      delete overlayRefs.current[id];
    }
  }, []); // Empty dependency array ensures this callback doesn't change

  // Debug - log current overlay refs
  useEffect(() => {
    console.log("Current overlayRefs:", 
      Object.keys(overlayRefs.current).map(id => ({
        id,
        readyState: overlayRefs.current[id]?.readyState
      }))
    );
  }, [activeOverlays]);

  // Initialize video player on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log("Initializing base video player");
    
    // Set up video player
    video.controls = false;
    video.muted = true;

    // Add event listeners for tracking time and duration
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);

    return () => {
      console.log("Cleaning up base video event listeners");
      // Clean up event listeners
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
    };
  }, [videoRef, handleTimeUpdate, handleDurationChange]);

  // Update video source when it changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    console.log(`Updating base video source: ${videoSrc}`);
    
    // Update source
    video.src = videoSrc;
    video.load();
    
    console.log("Reset overlay state and refs due to video source change");
    
    // Reset overlay state when video source changes
    setLoadedOverlays({});
    
    // Clear overlay refs to prevent stale references
    overlayRefs.current = {};
    
    // Remove autoplay - let user explicitly press play
    // This avoids potential autoplay blocking issues and follows the consultant's recommendation
  }, [videoSrc, videoRef]);

  // Helper function to get overlay video source - memoized for stability
  const getOverlayVideoSource = useCallback((overlay) => {
    if (!overlay) return null;
    const path = overlay.path || null;
    if (!path || path.trim() === '') {
      return null;
    }
    return path;
  }, []);

  // Set up synchronization between base video and overlay videos with a slight delay
  // to ensure refs are stable before attempting to sync
  useEffect(() => {
    console.log("Overlay sync effect triggered");
    
    // Use a timeout to ensure component has stabilized before attempting sync
    const syncTimer = setTimeout(() => {
      console.log("Executing delayed overlay sync...");
      
      const baseVideo = videoRef.current;
      if (!baseVideo) {
        console.log("No base video ref available");
        return;
      }
  
      // Create array of active overlay video elements
      const activeOverlayElements = [];
      activeOverlays.forEach(overlayId => {
        const overlayVideo = overlayRefs.current[overlayId];
        if (overlayVideo) {
          activeOverlayElements.push(overlayVideo);
        } else {
          console.log(`WARNING: No ref found for overlay ${overlayId}`);
        }
      });
      
      console.log(`Sync Effect: Active overlay elements: ${activeOverlayElements.length}`, 
        activeOverlayElements.map(el => ({
          src: el.src?.split('/').pop(),
          readyState: el.readyState,
          paused: el.paused
        }))
      );
      
      // No active overlays to sync
      if (activeOverlayElements.length === 0) {
        console.log("No active overlay elements to sync");
        return;
      }
      
      console.log("Calling syncOverlayVideos with base video and overlay elements");
      
      // Use the sync utility with the new function signature (no threshold parameter)
      const cleanup = syncOverlayVideos(baseVideo, activeOverlayElements);
      
      // Track loaded state for overlays
      const cleanupFunctions = [];
      
      activeOverlays.forEach(overlayId => {
        const overlayVideo = overlayRefs.current[overlayId];
        if (overlayVideo) {
          console.log(`Setting up loadeddata listener for overlay ${overlayId}`);
          
          const handleLoaded = () => {
            console.log(`Overlay ${overlayId} loaded: readyState=${overlayVideo.readyState}`);
            setLoadedOverlays(prev => ({ ...prev, [overlayId]: true }));
          };
          
          overlayVideo.addEventListener('loadeddata', handleLoaded);
          
          // Also check if already loaded
          if (overlayVideo.readyState >= 2) {
            console.log(`Overlay ${overlayId} already loaded: readyState=${overlayVideo.readyState}`);
            handleLoaded();
          }
          
          // Store cleanup function
          cleanupFunctions.push(() => {
            console.log(`Removing loadeddata listener for overlay ${overlayId}`);
            overlayVideo.removeEventListener('loadeddata', handleLoaded);
          });
        }
      });
  
      return () => {
        console.log("Cleaning up sync effect");
        // First clean up sync
        cleanup();
        
        // Then clean up load listeners
        cleanupFunctions.forEach(fn => fn());
      };
    }, 100); // Short delay to ensure component has stabilized
    
    return () => {
      clearTimeout(syncTimer);
    };
  }, [activeOverlays, videoRef]);

  // Memoize overlay elements to prevent re-rendering
  const overlayElements = useMemo(() => {
    return activeOverlays.map(overlayId => {
      const overlay = overlayData.find(o => o.id === overlayId);
      const overlayVideoSrc = getOverlayVideoSource(overlay);
      
      if (!overlayVideoSrc) {
        console.log(`No valid source for overlay ${overlayId}`);
        return null;
      }
      
      console.log(`Creating overlay element for ${overlayId} with source ${overlayVideoSrc}`);
      
      return (
        <HeatmapOverlay
          key={overlayId}
          heatmapVideoSrc={overlayVideoSrc}
          opacity={overlay?.opacity || 0.8}
          visible={true}
          ref={getOverlayRef(overlayId)}
        />
      );
    }).filter(Boolean); // Filter out null values
  }, [activeOverlays, overlayData, getOverlayVideoSource, getOverlayRef]);

  // Debug - log when this component re-renders
  console.log("VideoPlayer render completed", {
    baseVideoReady: videoRef.current?.readyState,
    activeOverlays,
    loadedOverlaysState: Object.keys(loadedOverlays)
  });

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        className="video-element"
        loop
        preload="auto"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Render memoized overlay elements */}
      {overlayElements}
    </div>
  );
};

// Memoize the VideoPlayer component to prevent unnecessary re-renders
export default React.memo(VideoPlayer);
