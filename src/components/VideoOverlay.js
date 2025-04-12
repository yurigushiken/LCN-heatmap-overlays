// src/components/VideoOverlay.js

import React, { useRef, useEffect } from " react\;
import \../styles/components/VideoOverlay.css\;

const VideoOverlay = ({ overlay, visible, videoRef }) => {
 const overlayVideoRef = useRef(null);
 
 useEffect(() => {
 const baseVideo = videoRef.current;
 const overlayVideo = overlayVideoRef.current;
 
 if (!baseVideo || !overlayVideo || !overlay?.path) return;
 
 // Set the overlay source
 overlayVideo.src = overlay.path;
 
 // Setup basic synchronization events
 const syncTime = () => {
 if (Math.abs(overlayVideo.currentTime - baseVideo.currentTime) > 0.1) {
 overlayVideo.currentTime = baseVideo.currentTime;
 }
 };
 
 const handlePlay = () => {
 if (overlayVideo.paused) {
 overlayVideo.play().catch(err => console.warn(\Could not play overlay video:\, err));
 }
 };
 
 const handlePause = () => {
 if (!overlayVideo.paused) {
 overlayVideo.pause();
 }
 };
 
 const handleSeek = () => {
 syncTime();
 };
 
 const handleRateChange = () => {
 overlayVideo.playbackRate = baseVideo.playbackRate;
 };
 
 // Add event listeners to the base video
 baseVideo.addEventListener(\play\, handlePlay);
 baseVideo.addEventListener(\pause\, handlePause);
 baseVideo.addEventListener(\seeking\, handleSeek);
 baseVideo.addEventListener(\seeked\, handleSeek);
 baseVideo.addEventListener(\ratechange\, handleRateChange);
 
 // Start continuous sync every second
 const syncInterval = setInterval(syncTime, 1000);
 
 // Initial sync when loaded
 overlayVideo.addEventListener(\loadeddata\, syncTime);
 
 // If base video is already playing, start overlay video
 if (!baseVideo.paused) {
 overlayVideo.play().catch(err => console.warn(\Could not play overlay video on init:\, err));
 }
 
 // Cleanup function
 return () => {
 baseVideo.removeEventListener(\play\, handlePlay);
 baseVideo.removeEventListener(\pause\, handlePause);
 baseVideo.removeEventListener(\seeking\, handleSeek);
 baseVideo.removeEventListener(\seeked\, handleSeek);
 baseVideo.removeEventListener(\ratechange\, handleRateChange);
 overlayVideo.removeEventListener(\loadeddata\, syncTime);
 clearInterval(syncInterval);
 };
 }, [overlay, videoRef]);
 
 if (!visible || !overlay?.path) return null;
 
 return (
 <video
 ref={overlayVideoRef}
 className=\video-overlay\
 style={{ opacity: visible ? overlay.opacity || 0.6 : 0 }}
 muted
 playsInline
 >
 <source src={overlay.path} type=\video/webm\ />
 </video>
 );
};

export default VideoOverlay;
