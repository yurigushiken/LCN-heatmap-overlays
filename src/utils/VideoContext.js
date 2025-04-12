// src/utils/VideoContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  
  // Assuming 30fps standard
  const FPS = 30;
  
  // Update current frame based on time
  useEffect(() => {
    setCurrentFrame(Math.round(currentTime * FPS));
  }, [currentTime]);
  
  // Methods for controlling video
  const play = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Error playing video:", err);
      });
    }
  };
  
  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  // Frame navigation with precise frame calculation
  const stepFrame = (frames = 1) => {
    if (videoRef.current) {
      // Pause the video first
      videoRef.current.pause();
      setIsPlaying(false);
      
      // Calculate current frame position
      const currentFrame = Math.round(videoRef.current.currentTime * FPS);
      
      // Calculate new frame (ensure we're working with whole frames)
      const targetFrame = currentFrame + frames;
      
      // Convert back to time with frame precision
      const newTime = targetFrame / FPS;
      
      // Seek to exact frame time
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Update UI with frame number
      setCurrentFrame(targetFrame);
      
      // This will trigger a 'seeked' event which will sync the overlays
      console.log(`Stepped to frame: ${targetFrame} (time: ${newTime.toFixed(3)}s)`);
    }
  };
  
  // Playback rate control
  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  // Seek to specific time
  const seekTo = (time) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, time));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Seek to specific frame
  const seekToFrame = (frame) => {
    if (videoRef.current) {
      const frameTime = frame / FPS;
      seekTo(frameTime);
    }
  };
  
  // Time update event handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Duration change handler
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Format time for display (MM:SS:Frames)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const frames = Math.floor((timeInSeconds % 1) * FPS);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  
  return (
    <VideoContext.Provider value={{
      videoRef,
      isPlaying,
      currentTime,
      duration,
      currentFrame,
      totalFrames: Math.round(duration * FPS),
      playbackRate,
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