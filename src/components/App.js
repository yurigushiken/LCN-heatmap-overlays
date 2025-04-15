// src/components/App.js

import React, { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import OverlaySelector from "./OverlaySelector";
import ControlPanel from "./ControlPanel";
import VideoControls from "./VideoControls";
import PresentationSection from "./PresentationSection";
import "../styles/components/App.css";
import { fetchVideos, fetchPresentationsManifest } from "../utils/dataUtils";
import { preloadVideos } from "../utils/videoCache"; // Re-enabled preloading
import { VideoProvider } from "../utils/VideoContext";

function App() {
  const [videoData, setVideoData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeOverlays, setActiveOverlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Presentation data states
  const [presentationsData, setPresentationsData] = useState({ analysisTypes: [] });
  const [presentationsLoading, setPresentationsLoading] = useState(true);
  const [presentationsError, setPresentationsError] = useState(null);

  // Password validation constant - not secure, but meets the requirement
  const CORRECT_PASSWORD = "2025";
  
  // Check for saved authentication when component mounts
  useEffect(() => {
    const checkSavedAuth = () => {
      console.log("Checking saved authentication");
      
      try {
        const savedAuth = localStorage.getItem('lcnHeatmapAuth');
        
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          console.log("Found saved auth:", authData);
          
          // Check if the auth is still valid (not expired)
          if (authData.expiry && new Date(authData.expiry) > new Date()) {
            console.log("Auth is still valid, expiry:", authData.expiry);
            setIsAuthenticated(true);
          } else {
            console.log("Auth has expired, clearing");
            // Clear expired auth
            localStorage.removeItem('lcnHeatmapAuth');
          }
        } else {
          console.log("No saved auth found");
        }
      } catch (err) {
        console.error("Error checking saved authentication:", err);
        // If there's an error, clear the stored auth
        localStorage.removeItem('lcnHeatmapAuth');
      }
    };
    
    checkSavedAuth();
  }, []);

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
        // Set initial video selection to "Give with Toy" (gw)
        const initialVideo = data.find(v => v.id === 'gw') || data[0];
        setSelectedVideo(initialVideo);
        
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

  // Add useEffect for presentation data
  useEffect(() => {
    async function loadPresentationsData() {
      try {
        setPresentationsLoading(true);
        const data = await fetchPresentationsManifest();
        if (!data || !Array.isArray(data.analysisTypes)) {
          throw new Error("Presentation manifest data is missing or improperly formatted");
        }
        setPresentationsData(data);
        setPresentationsError(null); // Clear previous errors
      } catch (err) {
        console.error("Error loading presentation data:", err);
        setPresentationsError(err.message);
      } finally {
        setPresentationsLoading(false);
      }
    }
    if (isAuthenticated) { // Only load if authenticated
      loadPresentationsData();
    }
  }, [isAuthenticated]); // Re-run if authentication status changes

  // Handle video selection
  const handleVideoSelect = (videoId) => {
    const video = videoData.find(v => v.id === videoId);
    if (video) {
      // Store the current active overlays before changing the video
      const currentActiveOverlays = activeOverlays;
      
      // Get age groups from current active overlays
      const currentAgeGroups = currentActiveOverlays.map(overlayId => {
        const [videoId, ageGroup] = overlayId.split('-');
        return ageGroup;
      });
      
      // Set the new video
      setSelectedVideo(video);
      
      // Find overlays in the new video that match the active age groups
      // and activate them
      if (currentAgeGroups.length > 0) {
        const newActiveOverlays = video.overlays
          .filter(overlay => {
            // Extract the age group from the overlay ID
            const [_, ageGroup] = overlay.id.split('-');
            // Check if this age group was active in the previous video
            return currentAgeGroups.includes(ageGroup) && overlay.path;
          })
          .map(overlay => overlay.id);
        
        // Set the new active overlays
        setActiveOverlays(newActiveOverlays);
      } else {
        // If no overlays were active, reset to empty array
        setActiveOverlays([]);
      }
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

  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordAttempt === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
      
      // Save authentication to localStorage with expiry (30 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      const authData = {
        authenticated: true,
        expiry: expiryDate.toISOString()
      };
      
      console.log("Saving auth data with expiry:", authData.expiry);
      localStorage.setItem('lcnHeatmapAuth', JSON.stringify(authData));
    } else {
      setLoginError("Incorrect password");
      setPasswordAttempt("");
    }
  };

  // Password prompt component
  const PasswordPrompt = () => {
    return (
      <div className="app-container">
        <div className="password-prompt">
          <h2>Enter Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <input
                type="password"
                value={passwordAttempt}
                onChange={(e) => setPasswordAttempt(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="password-input"
              />
            </div>
            {loginError && <p className="error-message">{loginError}</p>}
            <button type="submit" className="password-submit">Submit</button>
          </form>
        </div>
      </div>
    );
  };

  // Update loading/error checks to include presentations
  if (loading || presentationsLoading) {
    return <div className="app-container"><div className="loading">Loading data...</div></div>;
  }

  if (error || presentationsError) {
    return (
      <div className="app-container">
        <div className="error">
          <h2>Error Loading Data</h2>
          {error && <p>Video Data Error: {error}</p>}
          {presentationsError && <p>Presentation Data Error: {presentationsError}</p>}
          <p>Please check data files and configuration.</p>
        </div>
      </div>
    );
  }

  // Check authentication before showing content
  if (!isAuthenticated) {
    return <PasswordPrompt />;
  }

  // Filter out "Floating Toy" (id: 'f') from dropdown options
  const dropdownVideos = videoData.filter(video => video.id !== 'f');

  return (
    <VideoProvider>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="header-main">
              <h1 className="app-title">Infant Event Representations Heatmap Overlay Viewer</h1>
              <p className="app-description">Language and Cognitive Neuroscience Lab</p>
            </div>
            <div className="header-links">
              <a href="https://github.com/yurigushiken/LCN-heatmap-overlays">GitHub Repository</a>
              <span className="link-separator">|</span>
              <a href="https://yurigushiken.github.io/">Return to Website</a>
            </div>
          </div>
        </header>
        
        <main className="main-content">
          <aside className="sidebar">
            <ControlPanel 
              videos={dropdownVideos}
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

        {/* --- NEW PRESENTATION SECTION --- */}
        {presentationsData && presentationsData.analysisTypes.length > 0 && (
          <section className="presentation-section-container">
            <PresentationSection presentationsData={presentationsData} />
          </section>
        )}
        {/* --- END NEW PRESENTATION SECTION --- */}

        <footer className="app-footer">
          <p>Infant Event Representations Heatmap Overlay Viewer - Language and Cognitive Neuroscience Lab</p>
          <p>Made by Mischa Gushiken and Yuexin Li</p>
        </footer>
      </div>
    </VideoProvider>
  );
}

export default App;
