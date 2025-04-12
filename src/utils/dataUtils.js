// src/utils/dataUtils.js

/**
 * Fetch video data from JSON file
 * @returns {Promise<Array>} Array of video objects with their overlays
 */
export const fetchVideos = async () => {
  try {
    const response = await fetch("/videos.json");
    if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching video data:", error);
    return [];
  }
};

/**
 * Extract unique age groups from all videos
 * @param {Array} videos - Array of video objects
 * @returns {Array} Array of unique age group strings
 */
export const extractAgeGroups = (videos) => {
  if (!videos || !videos.length) return [];
  
  const ageGroups = new Set();
  
  videos.forEach(video => {
    if (video.overlays && video.overlays.length) {
      video.overlays.forEach(overlay => {
        if (overlay.ageGroup) {
          ageGroups.add(overlay.ageGroup);
        }
      });
    }
  });
  
  return [...ageGroups];
};

/**
 * Filter overlays by selected age group
 * @param {Object} video - Current video object
 * @param {string} selectedAgeGroup - Currently selected age group
 * @returns {Array} Filtered array of overlay objects
 */
export const filterOverlaysByAgeGroup = (video, selectedAgeGroup) => {
  if (!video || !video.overlays) return [];
  
  return video.overlays.filter(overlay => 
    overlay.ageGroup === selectedAgeGroup
  );
};
