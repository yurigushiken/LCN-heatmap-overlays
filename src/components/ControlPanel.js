// src/components/ControlPanel.js

import React from "react";
import "../styles/components/ControlPanel.css";

const ControlPanel = ({ videos, selectedVideo, onSelectVideo }) => {
 if (!videos || videos.length === 0) {
 return (
 <div className="control-panel">
 <p className="no-videos-message">No videos available. Please check data files.</p>
 </div>
 );
 }

 return (
 <div className="control-panel">
 <div className="video-selector">
 <label htmlFor="video-select">Select Event Video:</label>
 <select
 id="video-select"
 value={selectedVideo?.id || ""}
 onChange={(e) => onSelectVideo(e.target.value)}
 >
 {videos.map(video => (
 <option key={video.id} value={video.id}>
 {video.title}
 </option>
 ))}
 </select>
 </div>
 </div>
 );
};

export default ControlPanel;
