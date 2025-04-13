// src/components/App.js

import React, { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import OverlaySelector from "./OverlaySelector";
import ControlPanel from "./ControlPanel";
import VideoControls from "./VideoControls";
import "../styles/components/App.css";
import { fetchVideos } from "../utils/dataUtils";
import { preloadVideos } from "../utils/videoCache"; // Re-enabled preloading
import { VideoProvider } from "../utils/VideoContext";

function App() {
  const [videoData, setVideoData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeOverlays, setActiveOverlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load video data
  useEffect(() => {
    async function loadVideoData() {
      try {
        setLoading(true);
        
        const data = await fetchVideos();
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Video data is empty or improperly formatted");
        }
        
        setVideoData(data);
        // Set initial video selection
        setSelectedVideo(data[0]);
        
        // Re-enabled preloading all videos
        preloadVideos(data);
        
      } catch (err) {
        console.error("Error loading video data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadVideoData();
  }, []);

  // Handle video selection
  const handleVideoSelect = (videoId) => {
    const video = videoData.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      // Reset overlays when video changes
      setActiveOverlays([]);
    }
  };

  // Toggle overlay visibility
  const handleToggleOverlay = (overlayId) => {
    setActiveOverlays(current => {
      if (current.includes(overlayId)) {
        return current.filter(id => id !== overlayId);
      } else {
        return [...current, overlayId];
      }
    });
  };

  // Get all overlays for current video
  const getAllOverlays = () => {
    if (!selectedVideo) return [];
    return selectedVideo.overlays || [];
  };

  if (loading) {
    return <div className="app-container"><div className="loading">Loading video data...</div></div>;
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <p>Please check that the video data file exists and is properly formatted.</p>
        </div>
      </div>
    );
  }

  return (
    <VideoProvider>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Infant Event Representations Heatmap Overlay Viewer</h1>
          <p className="app-description">Language and Cognitive Neuroscience Lab</p>
        </header>
        
        <main className="main-content">
          <aside className="sidebar">
            <ControlPanel 
              videos={videoData}
              selectedVideo={selectedVideo}
              onSelectVideo={handleVideoSelect}
            />
            
            <OverlaySelector 
              overlays={getAllOverlays()}
              activeOverlays={activeOverlays}
              onToggleOverlay={handleToggleOverlay}
            />
            
            <VideoControls />
          </aside>
          
          <div className="content">
            <div className="video-container">
              <VideoPlayer 
                videoSrc={selectedVideo?.videoPath}
                activeOverlays={activeOverlays}
                overlayData={getAllOverlays()}
              />
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>Infant Event Representations Heatmap Overlay Viewer - Language and Cognitive Neuroscience Lab</p>
          <p>Made by Mischa Gushiken and Yuexin Li</p>
        </footer>
      </div>
    </VideoProvider>
  );
}

export default App;
