// src/components/AgeGroupToggle.js

import React from "react";
import "../styles/components/AgeGroupToggle.css";

const AgeGroupToggle = ({ ageGroups, selectedAgeGroup, onSelectAgeGroup }) => {
 // Map of age group values to human-readable labels
 const ageGroupLabels = {
 "seven": "7 Months",
 "eight": "8 Months",
 "nine": "9 Months",
 "ten": "10 Months",
 "eleven": "11 Months",
 "twelve": "12 Months",
 "adult": "Adult"
 };

 if (!ageGroups || ageGroups.length === 0) {
 return (
 <div className="age-group-toggle">
 <h2>Age Groups</h2>
 <p className="no-data-message">No age group data available.</p>
 </div>
 );
 }

 // Sort age groups in a logical order (adult first, then by month)
 const sortedAgeGroups = [...ageGroups].sort((a, b) => {
 if (a === "adult") return -1;
 if (b === "adult") return 1;
 
 // Extract numeric values for comparison
 const monthMap = {
 "seven": 7,
 "eight": 8,
 "nine": 9,
 "ten": 10,
 "eleven": 11,
 "twelve": 12
 };
 
 return monthMap[a] - monthMap[b];
 });

 return (
 <div className="age-group-toggle">
 <h2>Age Groups</h2>
 <div className="age-group-buttons">
 {sortedAgeGroups.map(ageGroup => (
 <button
 key={ageGroup}
 className={`age-group-button ${selectedAgeGroup === ageGroup ? 'active' : ''}`}
 onClick={() => onSelectAgeGroup(ageGroup)}
 >
 {ageGroupLabels[ageGroup] || ageGroup}
 </button>
 ))}
 </div>
 </div>
 );
};

export default AgeGroupToggle;
