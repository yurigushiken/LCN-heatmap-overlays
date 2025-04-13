/**
 * Simplified Video Sync Utility
 * Uses minimal sync for 1x speed, RAF for precise sync at other speeds.
 * Prioritizes robust playback initiation and error logging.
 */

const debug = true; // Set true for detailed console logs during debugging

export const syncOverlayVideos = (baseVideo, overlayVideos) => {
  console.log('syncOverlayVideos called with:', 
    {baseReady: baseVideo?.readyState, overlayCount: overlayVideos?.length});
  
  if (!baseVideo || !overlayVideos || overlayVideos.length === 0) {
    console.log('No valid overlays or base video, returning empty cleanup');
    return () => {}; // Return no-op cleanup
  }

  const validOverlays = overlayVideos.filter(Boolean);
  if (validOverlays.length === 0) {
    console.log('No valid overlays after filtering, returning empty cleanup');
    return () => {};
  }
  
  console.log('Valid overlays:', validOverlays.map(v => v.src?.split('/').pop()));

  let rafId = null;
  let isRAFRunning = false;
  const timeThreshold = 0.1; // Threshold (seconds) for time sync correction at non-1x speeds

  // --- RAF Sync Loop (ONLY for non-1x speed time adjustments) ---
  const syncFrameNon1x = () => {
    if (baseVideo.paused || !isRAFRunning || baseVideo.playbackRate === 1.0) {
      isRAFRunning = false; // Stop if paused or rate is 1x
      if (debug) console.log('RAF loop stopped:', 
        {paused: baseVideo.paused, rate: baseVideo.playbackRate});
      return;
    }

    const baseTime = baseVideo.currentTime;
    validOverlays.forEach(overlay => {
      if (!overlay) return;
      // Correct significant drift ONLY when not at 1x speed
      if (Math.abs(overlay.currentTime - baseTime) > timeThreshold) {
        try {
          if (debug) console.log(`SYNC (Non-1x): Correcting drift on ${overlay.src.split('/').pop()} to ${baseTime.toFixed(3)}`);
          overlay.currentTime = baseTime;
        } catch (e) { 
          console.error(`Error adjusting time for ${overlay.src.split('/').pop()}:`, e);
        }
      }
    });

    rafId = requestAnimationFrame(syncFrameNon1x); // Continue loop
  };

  // --- Playback Initiation Helper ---
  const tryPlayOverlay = (overlay) => {
    if (overlay && overlay.paused) {
      console.log(`Attempting to play overlay: ${overlay.src.split('/').pop()}, readyState: ${overlay.readyState}`);
      
      overlay.muted = true; // Ensure muted before playing
      const playPromise = overlay.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`Successfully started playback for ${overlay.src.split('/').pop()}`);
        }).catch(error => {
          // CRITICAL: Log errors if play fails
          console.error(`Overlay ${overlay.src.split('/').pop()} failed to play:`, error);
        });
      } else {
        console.log(`Play promise undefined for ${overlay.src.split('/').pop()}`);
      }
    } else if (overlay) {
      console.log(`Overlay already playing: ${overlay.src.split('/').pop()}`);
    }
  };

  // --- Event Handlers (Attached to Base Video) ---
  const handlePlay = () => {
    console.log("Sync: handlePlay triggered. Base video:", 
      {time: baseVideo.currentTime, rate: baseVideo.playbackRate});
    
    const rate = baseVideo.playbackRate;
    validOverlays.forEach(overlay => {
      if (overlay) {
        if (overlay.playbackRate !== rate) {
          console.log(`Setting overlay ${overlay.src.split('/').pop()} rate to ${rate}`);
          overlay.playbackRate = rate; // Sync rate first
        }
        tryPlayOverlay(overlay); // Attempt to play
      }
    });
    // Start RAF *only if* needed (not 1x)
    if (rate !== 1.0) {
      console.log(`Starting RAF for non-1x playback (${rate}x)`);
      isRAFRunning = true;
      rafId = requestAnimationFrame(syncFrameNon1x);
    }
  };

  const handlePause = () => {
    console.log("Sync: handlePause triggered. Base video:", 
      {time: baseVideo.currentTime, wasPaused: baseVideo.paused});
    
    isRAFRunning = false; // Stop RAF loop regardless of rate
    if (rafId) {
      console.log('Cancelling RAF loop');
      cancelAnimationFrame(rafId);
    }
    rafId = null;
    
    validOverlays.forEach(overlay => {
      if (overlay && !overlay.paused) {
        console.log(`Pausing overlay: ${overlay.src.split('/').pop()}`);
        overlay.pause();
      } else if (overlay) {
        console.log(`Overlay already paused: ${overlay.src.split('/').pop()}`);
      }
    });
  };

  const handleSeeked = () => {
    console.log("Sync: handleSeeked triggered. Base video:", 
      {time: baseVideo.currentTime, paused: baseVideo.paused});
    
    const seekTime = baseVideo.currentTime;
    validOverlays.forEach(overlay => {
      if (overlay) {
        try {
          console.log(`Seeking overlay ${overlay.src.split('/').pop()} to ${seekTime}`);
          overlay.currentTime = seekTime; // Force time sync after seek
        } catch (e) { 
          console.error(`Error seeking overlay ${overlay.src.split('/').pop()}:`, e);
        }
      }
    });
    // If playing after seek, restart RAF only if needed
    if (!baseVideo.paused && baseVideo.playbackRate !== 1.0) {
      console.log('Restarting RAF after seek');
      isRAFRunning = true;
      rafId = requestAnimationFrame(syncFrameNon1x);
    }
  };

  const handleRateChange = () => {
    console.log(`Sync: handleRateChange triggered. New rate: ${baseVideo.playbackRate}x`);
    
    const newRate = baseVideo.playbackRate;
    const baseTime = baseVideo.currentTime; // Get current time *before* changing rate
    validOverlays.forEach(overlay => {
      if (overlay) {
        console.log(`Updating overlay ${overlay.src.split('/').pop()} rate to ${newRate} and time to ${baseTime}`);
        overlay.playbackRate = newRate; // Sync rate
        try {
          overlay.currentTime = baseTime; // Force time sync
        } catch(e) { 
          console.error(`Error updating time for ${overlay.src.split('/').pop()}:`, e);
        }
      }
    });

    // Start or stop RAF based on new rate
    if (newRate !== 1.0 && !baseVideo.paused) {
      console.log(`Starting RAF for non-1x playback (${newRate}x)`);
      isRAFRunning = true;
      rafId = requestAnimationFrame(syncFrameNon1x);
    } else {
      console.log('Stopping RAF for 1x playback');
      isRAFRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  // --- Initialization ---
  console.log('Sync: Initializing overlays...');
  validOverlays.forEach(overlay => {
    if (overlay) {
      console.log(`Initializing overlay: ${overlay.src.split('/').pop()}, readyState: ${overlay.readyState}`);
      overlay.muted = true;
      overlay.currentTime = baseVideo.currentTime;
      overlay.playbackRate = baseVideo.playbackRate;
      if (!baseVideo.paused) {
        console.log(`Base video is playing, attempting to play overlay: ${overlay.src.split('/').pop()}`);
        tryPlayOverlay(overlay); // Attempt initial play if base is playing
      } else {
        console.log(`Base video is paused, not playing overlay: ${overlay.src.split('/').pop()}`);
      }
    }
  });

  // Attach listeners
  console.log('Attaching event listeners to base video');
  baseVideo.addEventListener('play', handlePlay);
  baseVideo.addEventListener('pause', handlePause);
  // Use only 'seeked' - 'seeking' pausing caused issues before
  baseVideo.addEventListener('seeked', handleSeeked);
  baseVideo.addEventListener('ratechange', handleRateChange);
  // Handle 'ended' for looping? Base video has loop attribute.
  // If overlays need to loop too, they need the attribute or explicit handling.

  // Start RAF loop *only if* initially playing and not at 1x speed
  if (!baseVideo.paused && baseVideo.playbackRate !== 1.0) {
    console.log(`Starting initial RAF for non-1x playback (${baseVideo.playbackRate}x)`);
    isRAFRunning = true;
    rafId = requestAnimationFrame(syncFrameNon1x);
  }

  // --- Cleanup Function ---
  return () => {
    console.log("Sync: Cleaning up listeners");
    isRAFRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    baseVideo.removeEventListener('play', handlePlay);
    baseVideo.removeEventListener('pause', handlePause);
    baseVideo.removeEventListener('seeked', handleSeeked);
    baseVideo.removeEventListener('ratechange', handleRateChange);
  };
};
