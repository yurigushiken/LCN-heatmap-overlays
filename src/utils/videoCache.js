/**
 * Cache videos by preloading them
 * @param {Array} videoData - Array of video objects from videos.json
 */
export const preloadVideos = (videoData) => {
  if (!videoData || videoData.length === 0) return;

  console.log(`Starting to preload ${videoData.length} videos and their overlays...`);

  // Preload base videos
  videoData.forEach(video => {
    if (!video.videoPath) return;
    
    const videoElement = document.createElement('video');
    videoElement.preload = 'auto';
    // Add PUBLIC_URL to ensure correct path resolution in all environments
    videoElement.src = `${process.env.PUBLIC_URL}${video.videoPath}`;
    
    console.log(`Preloading base video: ${videoElement.src}`);
    
    // Force loading
    videoElement.load();
    
    // Add hidden to DOM to ensure loading even if browser is conservative
    videoElement.style.width = '1px';
    videoElement.style.height = '1px';
    videoElement.style.position = 'absolute';
    videoElement.style.opacity = '0.01';
    videoElement.style.pointerEvents = 'none';
    videoElement.muted = true;
    document.body.appendChild(videoElement);
    
    // Remove after it's loaded to clean up DOM
    videoElement.addEventListener('loadeddata', () => {
      console.log(`Base video loaded: ${videoElement.src}`);
      document.body.removeChild(videoElement);
    });
  });
  
  // Preload overlay videos
  videoData.forEach(video => {
    if (video.overlays && video.overlays.length) {
      video.overlays.forEach(overlay => {
        if (overlay.path && overlay.path.trim() !== '') {
          const overlayElement = document.createElement('video');
          overlayElement.preload = 'auto';
          // Add PUBLIC_URL to ensure correct path resolution in all environments
          overlayElement.src = `${process.env.PUBLIC_URL}${overlay.path}`;
          
          console.log(`Preloading overlay: ${overlayElement.src}`);
          
          // Force loading
          overlayElement.load();
          
          // Add hidden to DOM to ensure loading even if browser is conservative
          overlayElement.style.width = '1px';
          overlayElement.style.height = '1px';
          overlayElement.style.position = 'absolute';
          overlayElement.style.opacity = '0.01';
          overlayElement.style.pointerEvents = 'none';
          overlayElement.muted = true;
          document.body.appendChild(overlayElement);
          
          // Remove after it's loaded to clean up DOM
          overlayElement.addEventListener('loadeddata', () => {
            console.log(`Overlay video loaded: ${overlayElement.src}`);
            document.body.removeChild(overlayElement);
          });
        }
      });
    }
  });
  
  console.log('Video preloading initiated - videos will load in the background');
}; 