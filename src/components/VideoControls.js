import React, { useRef } from 'react';
import { useVideo } from '../utils/VideoContext';
import '../styles/components/VideoControls.css';

const VideoControls = () => {
  const { 
    isPlaying, 
    togglePlayPause, 
    stepFrame, 
    currentTime, 
    duration, 
    seekTo,
    currentFrame,
    totalFrames,
    formatTime,
    playbackRate,
    changePlaybackRate
  } = useVideo();
  
  const controlsRef = useRef(null);

  // Focus the controls container programmatically
  const focusControls = () => {
    if (controlsRef.current) {
      controlsRef.current.focus();
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Only process keyboard events when this component has focus
    if (document.activeElement === controlsRef.current) {
      // Prevent default actions for these keys
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          stepFrame(-1); // Step backward one frame
          break;
        case 'ArrowRight':
          stepFrame(1); // Step forward one frame
          break;
        case ' ': // Spacebar
          togglePlayPause(); // Toggle play/pause
          break;
        default:
          break;
      }
    }
  };

  // Handle scrubbing bar change
  const handleScrubChange = (e) => {
    const value = parseFloat(e.target.value);
    seekTo(value);
    // Focus controls after scrubbing
    focusControls();
  };
  
  return (
    <div 
      className="video-controls"
      tabIndex="0" // Make focusable
      onKeyDown={handleKeyDown}
      ref={controlsRef}
    >
      <h3 className="controls-title">Playback Controls</h3>
      
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span className="frame-count">Frame: {currentFrame}/{totalFrames}</span>
      </div>
      
      {/* Scrubbing bar */}
      <div className="scrub-container">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime || 0}
          onChange={handleScrubChange}
          className="scrub-bar"
          step="0.001"
        />
      </div>
      
      {/* Play/Pause button */}
      <div className="controls-row">
        <button 
          className="control-button play-pause-button" 
          onClick={() => {
            togglePlayPause();
            focusControls();
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>
      
      {/* Frame navigation buttons */}
      <div className="controls-row frame-controls">
        <button 
          className="control-button" 
          onClick={() => {
            stepFrame(-5);
            focusControls();
          }}
          aria-label="Back 5 frames"
        >
          ⏪
        </button>
        <button 
          className="control-button" 
          onClick={() => {
            stepFrame(-1);
            focusControls();
          }}
          aria-label="Back 1 frame"
        >
          ◀
        </button>
        <button 
          className="control-button" 
          onClick={() => {
            stepFrame(1);
            focusControls();
          }}
          aria-label="Forward 1 frame"
        >
          ▶
        </button>
        <button 
          className="control-button" 
          onClick={() => {
            stepFrame(5);
            focusControls();
          }}
          aria-label="Forward 5 frames"
        >
          ⏩
        </button>
      </div>
      
      {/* Playback speed controls */}
      <div className="controls-row playback-speed">
        <h4 className="speed-title">Playback Speed</h4>
        <div className="speed-buttons">
          <button 
            className={`speed-button ${playbackRate === 0.25 ? 'active' : ''}`} 
            onClick={() => {
              changePlaybackRate(0.25);
              focusControls();
            }}
            aria-label="Quarter speed"
          >
            1/4x
          </button>
          <button 
            className={`speed-button ${playbackRate === 0.5 ? 'active' : ''}`} 
            onClick={() => {
              changePlaybackRate(0.5);
              focusControls();
            }}
            aria-label="Half speed"
          >
            1/2x
          </button>
          <button 
            className={`speed-button ${playbackRate === 1 ? 'active' : ''}`} 
            onClick={() => {
              changePlaybackRate(1);
              focusControls();
            }}
            aria-label="Normal speed"
          >
            1x
          </button>
        </div>
      </div>
      
      {/* Add keyboard shortcut hints */}
      <div className="keyboard-hints">
        <div className="keyboard-hint">
          <span className="key">◀</span> Previous frame
        </div>
        <div className="keyboard-hint">
          <span className="key">▶</span> Next frame
        </div>
        <div className="keyboard-hint">
          <span className="key">Space</span> Play/Pause
        </div>
      </div>
      <div className="keyboard-hints-note">
        Click here first, then use keyboard shortcuts
      </div>
    </div>
  );
};

export default VideoControls; 