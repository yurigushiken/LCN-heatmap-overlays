// src/utils/dataUtils.js

/**
 * Fetch video data from JSON file
 * @returns {Promise<Array>} Array of video objects with their overlays
 */
export const fetchVideos = async () => {
  try {
    // Add debug logging before fetch
    console.log(`Fetching videos from: ${process.env.PUBLIC_URL}/videos.json`);
    
    const response = await fetch(`${process.env.PUBLIC_URL}/videos.json`);
    
    // Log response status
    console.log(`Fetch response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
    }
    
    const data = await response.json();
    
    // Log successful data load
    console.log(`Successfully loaded video data with ${data.length} videos`);
    
    return data;
  } catch (error) {
    // More detailed error logging
    console.error("Error fetching video data:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
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

/**
 * Fetch presentation manifest data from JSON file
 * @returns {Promise<Object>} Object containing analysis types and their plots
 */
export const fetchPresentationsManifest = async () => {
  try {
    const manifestUrl = `${process.env.PUBLIC_URL}/presentations/presentations_manifest.json`;
    console.log(`Fetching presentation manifest from: ${manifestUrl}`);

    const response = await fetch(manifestUrl);

    console.log(`Fetch presentation manifest response status: ${response.status}`);

    if (!response.ok) {
      throw new Error("HTTP error fetching presentation manifest! status: " + response.status);
    }

    const data = await response.json();

    console.log(`Successfully loaded presentation manifest data`);
    return data;
  } catch (error) {
    console.error("Error fetching presentation manifest data:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    return { analysisTypes: [] }; // Return empty structure on error
  }
};
