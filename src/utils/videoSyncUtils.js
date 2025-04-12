/**
 * Utility functions for synchronizing multiple video elements
 */

/**
 * Synchronizes a secondary video to a primary video
 * @param {HTMLVideoElement} primaryVideo - The main video element
 * @param {HTMLVideoElement} secondaryVideo - The video to synchronize
 * @param {number} threshold - Time difference threshold in seconds (default: 0.1)
 */
export const synchronizeVideos = (primaryVideo, secondaryVideo, threshold = 0.1) => {
  if (!primaryVideo || !secondaryVideo) return;
  
  // Update time if out of sync
  if (Math.abs(secondaryVideo.currentTime - primaryVideo.currentTime) > threshold) {
    secondaryVideo.currentTime = primaryVideo.currentTime;
  }
  
  // Match play/pause state
  if (primaryVideo.paused) {
    secondaryVideo.pause();
  } else {
    secondaryVideo.play().catch(e => console.error(" Failed to play synchronized video:\, e"));
  }
};

/**
 * Attaches synchronization listeners between the base video and an overlay video
 * @param {HTMLVideoElement} baseVideo - The main video element
 * @param {HTMLVideoElement} overlayVideo - The overlay video to sync with the base
 * @returns {Function} Cleanup function to remove all listeners
 */
export const attachSyncListeners = (baseVideo, overlayVideo) => {
  if (!baseVideo || !overlayVideo) {
    return () => {}; // No-op cleanup function
  }

  // Sync time function
  const syncTime = () => {
    if (Math.abs(overlayVideo.currentTime - baseVideo.currentTime) > 0.1) {
      overlayVideo.currentTime = baseVideo.currentTime;
    }
  };

  // Play event handler
  const handlePlay = () => {
    if (overlayVideo.paused) {
      overlayVideo.play().catch(err => console.warn("Could not play overlay video:", err));
    }
  };

  // Pause event handler
  const handlePause = () => {
    if (!overlayVideo.paused) {
      overlayVideo.pause();
    }
  };

  // Seek event handler
  const handleSeek = () => {
    syncTime();
  };

  // Playback rate change handler
  const handleRateChange = () => {
    overlayVideo.playbackRate = baseVideo.playbackRate;
  };

  // Add event listeners to base video
  baseVideo.addEventListener("play", handlePlay);
  baseVideo.addEventListener("pause", handlePause);
  baseVideo.addEventListener("seeking", handleSeek);
  baseVideo.addEventListener("seeked", handleSeek);
  baseVideo.addEventListener("ratechange", handleRateChange);

  // Sync interval for continuous synchronization
  const syncInterval = setInterval(syncTime, 1000);

  // Initial sync when overlay is loaded
  overlayVideo.addEventListener("loadeddata", syncTime);

  // Start playing overlay if base video is already playing
  if (!baseVideo.paused) {
    overlayVideo.play().catch(err => console.warn("Could not play overlay on init:", err));
  }

  // Return cleanup function
  return () => {
    baseVideo.removeEventListener("play", handlePlay);
    baseVideo.removeEventListener("pause", handlePause);
    baseVideo.removeEventListener("seeking", handleSeek);
    baseVideo.removeEventListener("seeked", handleSeek);
    baseVideo.removeEventListener("ratechange", handleRateChange);
    overlayVideo.removeEventListener("loadeddata", syncTime);
    clearInterval(syncInterval);
  };
};

/**
 * Synchronizes overlay videos with a base video
 * @param {HTMLVideoElement} baseVideo - The primary video element
 * @param {Array<HTMLVideoElement>} overlayVideos - Array of overlay video elements
 * @returns {Function} - Cleanup function to remove event listeners
 */
export const syncOverlayVideos = (baseVideo, overlayVideos) => {
  if (!baseVideo || !overlayVideos || overlayVideos.length === 0) {
    return () => {};
  }

  const synchronizeVideos = () => {
    overlayVideos.forEach(overlay => {
      if (!overlay) return;
      
      // Sync time if difference is significant
      if (Math.abs(overlay.currentTime - baseVideo.currentTime) > 0.1) {
        overlay.currentTime = baseVideo.currentTime;
      }
      
      // Match play/pause state
      if (baseVideo.paused) {
        if (!overlay.paused) overlay.pause();
      } else {
        overlay.play().catch(e => console.error("Failed to play overlay video:", e));
      }
    });
  };

  // Add event listeners to base video
  baseVideo.addEventListener("play", synchronizeVideos);
  baseVideo.addEventListener("pause", synchronizeVideos);
  baseVideo.addEventListener("seeked", synchronizeVideos);
  baseVideo.addEventListener("timeupdate", synchronizeVideos);

  // Initial synchronization
  synchronizeVideos();

  // Return cleanup function
  return () => {
    baseVideo.removeEventListener("play", synchronizeVideos);
    baseVideo.removeEventListener("pause", synchronizeVideos);
    baseVideo.removeEventListener("seeked", synchronizeVideos);
    baseVideo.removeEventListener("timeupdate", synchronizeVideos);
  };
};
