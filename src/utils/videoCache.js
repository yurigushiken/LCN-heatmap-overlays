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
    videoElement.src = video.videoPath;
    
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
          overlayElement.src = overlay.path;
          
          // Force loading
          overlayElement.load();
        }
      });
    }
  });
}; 