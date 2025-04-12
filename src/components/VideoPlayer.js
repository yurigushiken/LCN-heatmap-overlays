// src/components/VideoPlayer.js

import React, { useRef, useEffect, useState, useCallback } from "react";
import "../styles/components/VideoPlayer.css";
import HeatmapOverlay from "./HeatmapOverlay";
import { attachSyncListeners } from "../utils/videoSyncUtils";
import { useVideo } from "../utils/VideoContext";

const VideoPlayer = ({ videoSrc, activeOverlays, overlayData }) => {
 const localVideoRef = useRef(null);
 const overlayRefs = useRef({});
 
 // Track which overlays are fully loaded and ready
 const [loadedOverlays, setLoadedOverlays] = useState({});
 
 // Get the shared video ref from context
 const { videoRef, handleTimeUpdate, handleDurationChange, playbackRate, currentFrame } = useVideo();

 // Frame-precise sync of all overlays
 const syncAllOverlaysToFrame = useCallback((frameNumber) => {
   if (!localVideoRef.current) return;
   
   // Calculate precise time for the frame
   const FPS = 30;
   const frameTime = frameNumber / FPS;
   
   console.log(`Force syncing all overlays to frame ${frameNumber} (${frameTime.toFixed(3)}s)`);
   
   // Sync each active overlay to this exact frame time
   Object.entries(overlayRefs.current).forEach(([overlayId, videoElement]) => {
     if (videoElement) {
       videoElement.currentTime = frameTime;
     }
   });
 }, []);

 // Monitor frame changes to ensure overlays stay in sync
 useEffect(() => {
   if (currentFrame > 0) {
     syncAllOverlaysToFrame(currentFrame);
   }
 }, [currentFrame, syncAllOverlaysToFrame]);

 // Debug active overlays when they change
 useEffect(() => {
   console.log("Active overlays:", activeOverlays);
   console.log("Available overlay data:", overlayData);
   console.log("Current playback rate:", playbackRate);
 }, [activeOverlays, overlayData, playbackRate]);

 // Initialize video player on mount
 useEffect(() => {
   const video = localVideoRef.current;
   if (!video) return;

   // Set up video player controls and events
   video.controls = false; // Disable native controls as we have our own now
   video.muted = true; // Start muted by default

   // Connect to our shared ref for controls
   videoRef.current = video;

   // Add event listeners for tracking time and duration
   video.addEventListener("timeupdate", handleTimeUpdate);
   video.addEventListener("durationchange", handleDurationChange);
   
   // Add frame-precise seeking handler
   const handleSeekEvent = () => {
     // Get current frame from video time
     const FPS = 30;
     const currentFrame = Math.round(video.currentTime * FPS);
     // Force sync all overlays to this frame
     syncAllOverlaysToFrame(currentFrame);
   };
   
   // Listen for seeking and seeked events
   video.addEventListener("seeking", handleSeekEvent);
   video.addEventListener("seeked", handleSeekEvent);

   // Optional: Add additional event listeners if needed
   const onLoadedData = () => {
     console.log("Base video data loaded");
   };

   video.addEventListener("loadeddata", onLoadedData);

   return () => {
     video.removeEventListener("loadeddata", onLoadedData);
     video.removeEventListener("timeupdate", handleTimeUpdate);
     video.removeEventListener("durationchange", handleDurationChange);
     video.removeEventListener("seeking", handleSeekEvent);
     video.removeEventListener("seeked", handleSeekEvent);
     
     // Clean up the ref when unmounting
     if (videoRef.current === video) {
       videoRef.current = null;
     }
   };
 }, [videoRef, handleTimeUpdate, handleDurationChange, syncAllOverlaysToFrame]);

 // Update video source when it changes
 useEffect(() => {
   const video = localVideoRef.current;
   if (!video || !videoSrc) return;

   // Update the source
   video.src = videoSrc;
   video.load();
   
   // Autoplay when a new video is selected
   video.play().catch(err => {
     console.warn("Could not autoplay video:", err);
   });
   
   // Reset loaded overlays state when video changes
   setLoadedOverlays({});
 }, [videoSrc]);

 // Set up synchronization between base video and overlay videos
 useEffect(() => {
   const baseVideo = localVideoRef.current;
   if (!baseVideo) return;

   // Create cleanup functions array for all sync listeners
   const cleanupFunctions = [];

   // Set up sync listeners for each active overlay
   activeOverlays.forEach(overlayId => {
     const overlayVideo = overlayRefs.current[overlayId];
     if (overlayVideo) {
       console.log(`Setting up sync for overlay: ${overlayId} at rate ${playbackRate}x`);
       
       // Set playback rate immediately after getting ref (will be reinforced by the sync)
       if (overlayVideo.playbackRate !== playbackRate) {
         console.log(`Initial direct rate set: ${playbackRate}x`);
         overlayVideo.playbackRate = playbackRate;
       }
       
       // Initial frame sync
       const FPS = 30;
       const currentFrame = Math.round(baseVideo.currentTime * FPS);
       const frameTime = currentFrame / FPS;
       overlayVideo.currentTime = frameTime;
       
       const cleanup = attachSyncListeners(baseVideo, overlayVideo);
       cleanupFunctions.push(cleanup);
       
       // Track when this overlay is fully loaded
       const handleLoaded = () => {
         console.log(`Overlay ${overlayId} is fully loaded, ensuring rate: ${playbackRate}x`);
         setLoadedOverlays(prev => ({ ...prev, [overlayId]: true }));
         
         // Double-confirm playback rate after loading
         if (overlayVideo.playbackRate !== baseVideo.playbackRate) {
           overlayVideo.playbackRate = baseVideo.playbackRate;
         }
         
         // Force frame sync after loading
         const frame = Math.round(baseVideo.currentTime * FPS);
         overlayVideo.currentTime = frame / FPS;
       };
       
       overlayVideo.addEventListener('loadeddata', handleLoaded);
       
       // Add cleanup for this event listener
       cleanupFunctions.push(() => {
         overlayVideo.removeEventListener('loadeddata', handleLoaded);
       });
     }
   });

   // Return combined cleanup function
   return () => {
     cleanupFunctions.forEach(cleanup => cleanup());
   };
 }, [activeOverlays, playbackRate]);

 // Helper function to get overlay video source
 const getOverlayVideoSource = (overlay) => {
   if (!overlay) return null;
   // Use the path property from the overlay data
   const path = overlay.path || null;
   if (!path) {
     console.warn(`Missing path for overlay: ${overlay.id}`);
     return null;
   }
   console.log(`Found overlay path: ${path} for ${overlay.id}`);
   return path;
 };

 return (
   <div className="video-player">
     <video
       ref={localVideoRef}
       className="video-element"
       loop
     >
       <source src={videoSrc} type="video/mp4" />
       Your browser does not support the video tag.
     </video>

     {/* Render active overlays */}
     {activeOverlays.map(overlayId => {
       const overlay = overlayData.find(o => o.id === overlayId);
       const overlayVideoSrc = getOverlayVideoSource(overlay);
       
       if (!overlayVideoSrc) {
         console.warn(`No video source found for overlay: ${overlayId}`);
         return null;
       }
       
       return (
         <HeatmapOverlay
           key={overlayId}
           heatmapVideoSrc={overlayVideoSrc}
           opacity={overlay.opacity || 1.0}
           visible={true}
           ref={video => {
             if (video) {
               overlayRefs.current[overlayId] = video;
               console.log(`Overlay ref set for: ${overlayId}`);
               
               // Set playback rate immediately on ref assignment
               if (video.playbackRate !== playbackRate) {
                 video.playbackRate = playbackRate;
                 console.log(`Set immediate rate for new overlay to ${playbackRate}x`);
               }
               
               // Initial frame sync if base video exists
               if (localVideoRef.current) {
                 const FPS = 30;
                 const frame = Math.round(localVideoRef.current.currentTime * FPS);
                 video.currentTime = frame / FPS;
               }
             }
           }}
         />
       );
     })}
   </div>
 );
};

export default VideoPlayer;
