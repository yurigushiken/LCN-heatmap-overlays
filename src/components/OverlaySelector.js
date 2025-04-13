// src/components/OverlaySelector.js

import React from "react";
import "../styles/components/OverlaySelector.css";

const OverlaySelector = ({ overlays, activeOverlays, onToggleOverlay }) => {
 if (!overlays || overlays.length === 0) {
 return (
 <div className="overlay-selector">
 <h2>Overlays</h2>
 <p className="no-overlays-message">
 No overlays available for the selected video and age group.
 </p>
 </div>
 );
 }

 // Sort overlays with Adult first, then by age (7, 8, 9, etc.)
 const sortedOverlays = [...overlays].sort((a, b) => {
 if (a.ageGroup === "adult") return -1;
 if (b.ageGroup === "adult") return 1;
 
 // Extract numeric values from ageGroup
 const getMonthValue = (month) => {
  if (month === "adult") return 0;
  if (month === "seven") return 7;
  if (month === "eight") return 8;
  if (month === "nine") return 9;
  if (month === "ten") return 10;
  if (month === "eleven") return 11;
  if (month === "twelve") return 12;
  return 0; // Default
 };
 
 return getMonthValue(a.ageGroup) - getMonthValue(b.ageGroup);
 });

 return (
 <div className="overlay-selector">
 <h2>Overlays</h2>
 <div className="overlay-options">
 {sortedOverlays.map(overlay => (
 <div key={overlay.id} className="overlay-option">
 <label className="checkbox-container">
 <input
 type="checkbox"
 checked={activeOverlays.includes(overlay.id)}
 onChange={() => onToggleOverlay(overlay.id)}
 />
 <span className="checkbox-label">{overlay.title}</span>
 </label>
 </div>
 ))}
 </div>
 </div>
 );
};

export default OverlaySelector;
