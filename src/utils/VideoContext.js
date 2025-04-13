// src/utils/VideoContext.js
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Create context
const VideoContext = createContext();

// Provider component
export const VideoProvider = ({ children }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0); // Default to normal speed
  const [isLoading, setIsLoading] = useState(true);
  
  // Assuming 30fps standard
  const FPS = 30;
  
  console.log("VideoContext render", {isPlaying, currentTime, playbackRate});
  
  // Update current frame based on time - for UI purposes only
  useEffect(() => {
    setCurrentFrame(Math.round(currentTime * FPS));
  }, [currentTime, FPS]);
  
  // Methods for controlling video - using useCallback to prevent unnecessary rerenders
  const play = useCallback(() => {
    console.log("VideoContext: play() called");
    if (videoRef.current) {
      console.log("VideoContext: Attempting to play base video", {
        src: videoRef.current.src?.split('/').pop(),
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        fullSrc: videoRef.current.src, // Log full source for debugging
        networkState: videoRef.current.networkState, // Add network state info
        error: videoRef.current.error // Log any existing error
      });
      
      videoRef.current.play().then(() => {
        console.log("VideoContext: Base video play successful");
        setIsPlaying(true);
      }).catch((error) => {
        console.error("VideoContext: Error playing base video:", error);
        console.error("VideoContext: Error details:", {
          type: error.name,
          message: error.message,
          code: videoRef.current.error?.code,
          fullSrc: videoRef.current.src,
          readyState: videoRef.current.readyState,
          networkState: videoRef.current.networkState
        });
        // Silent catch - video playback failed
      });
    } else {
      console.warn("VideoContext: No video ref available for play");
    }
  }, []);
  
  const pause = useCallback(() => {
    console.log("VideoContext: pause() called");
    if (videoRef.current) {
      console.log("VideoContext: Pausing base video", {
        src: videoRef.current.src?.split('/').pop(),
        time: videoRef.current.currentTime,
        wasPaused: videoRef.current.paused
      });
      
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      console.warn("VideoContext: No video ref available for pause");
    }
  }, []);
  
  const togglePlayPause = useCallback(() => {
    console.log("VideoContext: togglePlayPause() called", {isPlaying});
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
  
  // Frame navigation with precise frame calculation
  const stepFrame = useCallback((frames = 1) => {
    console.log(`VideoContext: stepFrame(${frames}) called`);
    if (videoRef.current) {
      // Pause the video first
      videoRef.current.pause();
      setIsPlaying(false);
      
      // Calculate current frame position
      const currentFrame = Math.round(videoRef.current.currentTime * FPS);
      
      // Calculate new frame (ensure we're working with whole frames)
      const targetFrame = currentFrame + frames;
      
      // Ensure target frame is within valid range
      const clampedTargetFrame = Math.max(0, Math.min(Math.round(duration * FPS), targetFrame));
      
      // Convert back to time with frame precision
      const newTime = clampedTargetFrame / FPS;
      
      console.log("VideoContext: Stepping frames", {
        from: currentFrame,
        to: clampedTargetFrame,
        newTime
      });
      
      // Seek to exact frame time
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Update UI with frame number
      setCurrentFrame(clampedTargetFrame);
    } else {
      console.warn("VideoContext: No video ref available for stepFrame");
    }
  }, [FPS, duration]);
  
  // Playback rate control
  const changePlaybackRate = useCallback((rate) => {
    console.log(`VideoContext: changePlaybackRate(${rate}) called`);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    } else {
      console.warn("VideoContext: No video ref available for changePlaybackRate");
    }
  }, []);
  
  // Seek to specific time
  const seekTo = useCallback((time) => {
    console.log(`VideoContext: seekTo(${time}) called`);
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, time));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.warn("VideoContext: No video ref available for seekTo");
    }
  }, [duration]);
  
  // Seek to specific frame
  const seekToFrame = useCallback((frame) => {
    console.log(`VideoContext: seekToFrame(${frame}) called`);
    if (videoRef.current) {
      const frameTime = frame / FPS;
      seekTo(frameTime);
    } else {
      console.warn("VideoContext: No video ref available for seekToFrame");
    }
  }, [FPS, seekTo]);
  
  // Time update event handler
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Update playing state based on actual video state
      if (isPlaying !== !videoRef.current.paused) {
        console.log("VideoContext: Updating isPlaying state from timeUpdate", {
          wasPlaying: isPlaying,
          isPaused: videoRef.current.paused
        });
        setIsPlaying(!videoRef.current.paused);
      }
    }
  }, [isPlaying]);
  
  // Duration change handler
  const handleDurationChange = useCallback(() => {
    if (videoRef.current) {
      console.log(`VideoContext: Duration changed to ${videoRef.current.duration}`);
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);
  
  // Loading state handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log("VideoContext: Setting up video event listeners");
    
    const handleLoadStart = () => {
      console.log("VideoContext: loadstart event");
      setIsLoading(true);
    };
    
    const handleLoadedData = () => {
      console.log("VideoContext: loadeddata event", {
        readyState: video.readyState,
        duration: video.duration
      });
      setIsLoading(false);
    };
    
    const handleError = () => {
      const video = videoRef.current;
      const errorDetails = {
        code: video.error?.code,
        message: video.error?.message,
        src: video.src,
        currentSrc: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState
      };
      
      console.error("VideoContext: error event", errorDetails);
      
      // Map error codes to messages
      let errorMessage = "Unknown video error";
      if (video.error) {
        switch(video.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = "Video playback aborted";
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = "Network error occurred while loading the video";
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMessage = "Error decoding the video";
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = "Video format not supported or video file not found";
            break;
          default:
            errorMessage = "Unknown video error";
        }
      }
      
      console.error("VideoContext: Error message:", errorMessage);
      setIsLoading(false);
    };
    
    const handlePlay = () => {
      console.log("VideoContext: play event");
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log("VideoContext: pause event");
      setIsPlaying(false);
    };
    
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      console.log("VideoContext: Cleaning up video event listeners");
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);
  
  // Format time for display (MM:SS:Frames)
  const formatTime = useCallback((timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const frames = Math.floor((timeInSeconds % 1) * FPS);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  }, [FPS]);
  
  return (
    <VideoContext.Provider value={{
      videoRef,
      isPlaying,
      currentTime,
      duration,
      currentFrame,
      totalFrames: Math.round(duration * FPS),
      playbackRate,
      isLoading,
      play,
      pause,
      togglePlayPause,
      stepFrame,
      seekTo,
      seekToFrame,
      changePlaybackRate,
      handleTimeUpdate,
      handleDurationChange,
      formatTime,
      FPS
    }}>
      {children}
    </VideoContext.Provider>
  );
};

// Custom hook for using the context
export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export default VideoContext; 