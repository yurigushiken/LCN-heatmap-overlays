/**
 * Cache videos by preloading them
 * @param {Array} videoData - Array of video objects from videos.json
 */
export const preloadVideos = (videoData) => {
  if (!videoData || videoData.length === 0) return;

  // Preload base videos
  videoData.forEach(video => {
    if (!video.videoPath) return;
    
    const videoElement = document.createElement('video');
    videoElement.preload = 'auto';
    // Add PUBLIC_URL to ensure correct path resolution in all environments
    videoElement.src = `${process.env.PUBLIC_URL}${video.videoPath}`;
    
    // Force loading
    videoElement.load();
  });
  
  // Preload overlay videos
  videoData.forEach(video => {
    if (video.overlays && video.overlays.length) {
      video.overlays.forEach(overlay => {
        if (overlay.path) {
          const overlayElement = document.createElement('video');
          overlayElement.preload = 'auto';
          // Add PUBLIC_URL to ensure correct path resolution in all environments
          overlayElement.src = `${process.env.PUBLIC_URL}${overlay.path}`;
          
          // Force loading
          overlayElement.load();
        }
      });
    }
  });
}; 