/**
 * Utility functions for URL and path handling
 * Ensures paths work correctly both in local development and on GitHub Pages
 */

/**
 * Determines the base URL for assets based on the current environment
 * - Returns '' (empty string) for local development
 * - Returns '/LCN-heatmap-overlays' for GitHub Pages
 */
export const getBaseUrl = () => {
  // Check if we're running on localhost (development) or GitHub Pages (production)
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' 
         ? '' 
         : '/LCN-heatmap-overlays';
};

/**
 * Resolves a path to work in both development and production environments
 * @param {string} path - The relative path to resolve
 * @returns {string} The full path with the correct base URL
 */
export const resolvePath = (path) => {
  if (!path) return '';
  
  const baseUrl = getBaseUrl();
  
  // Handle paths that already start with a slash
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }
  
  // Handle paths without a leading slash
  return `${baseUrl}/${path}`;
}; 