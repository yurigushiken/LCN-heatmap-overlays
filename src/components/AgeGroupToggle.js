// src/components/AgeGroupToggle.js

import React from "react";
import "../styles/components/AgeGroupToggle.css";

const AgeGroupToggle = ({ ageGroup, setAgeGroup, videos }) => {
  // Map age group values to human-readable labels
  const ageGroupLabels = {
    seven: "7 Months",
    eight: "8 Months",
    nine: "9 Months",
    ten: "10 Months",
    eleven: "11 Months",
    twelve: "12 Months",
    adult: "Adult"
  };

  // Handle case where no age group data is available
  if (!videos || videos.length === 0) {
    return null;
  }

  // Get all unique age groups from all videos' overlays
  const allAgeGroups = [...new Set(
    videos.flatMap(video => 
      video.overlays.map(overlay => overlay.ageGroup)
    )
  )];

  // Sort age groups logically (7, 8, 9, 10, 11, 12, adult)
  const sortedAgeGroups = allAgeGroups.sort((a, b) => {
    if (a === "adult") return 1;
    if (b === "adult") return -1;
    
    const ageValues = {
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12
    };
    
    return ageValues[a] - ageValues[b];
  });

  return (
    <div className="age-group-toggle">
      <h2>Age Group</h2>
      <div className="age-buttons">
        {sortedAgeGroups.map((group) => (
          <button
            key={group}
            className={`age-button ${ageGroup === group ? "active" : ""}`}
            onClick={() => setAgeGroup(group)}
          >
            {ageGroupLabels[group] || group}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgeGroupToggle;
