/**
 * Utility functions for URL and path handling
 * Ensures paths work correctly both in local development and on GitHub Pages
 */

/**
 * Determines the base URL for assets based on the current environment
 * - Checks the actual URL path we're running under, not just the hostname
 * - Returns the correct base path for both local development and GitHub Pages
 */
export const getBaseUrl = () => {
  // Get the base path from the current URL
  const pathname = window.location.pathname;
  
  // Check if we're running under the GitHub Pages path
  if (pathname.includes('/LCN-heatmap-overlays')) {
    return '/LCN-heatmap-overlays';
  }
  
  // If not, we're at the root (in pure development mode)
  return '';
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

/**
 * Resolves a presentation asset path relative to the public directory.
 * @param {string} relativePath - The relative path from the manifest (e.g., /presentations/...)
 * @returns {string} The full path usable in <img> src.
 */
export const resolvePresentationAssetPath = (relativePath) => {
  if (!relativePath) return '';
  
  // Ensure relativePath starts with a slash if it doesn't already
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  // Use PUBLIC_URL (defaulting to empty string if undefined)
  const fullPath = `${process.env.PUBLIC_URL || ''}${path}`;
  
  console.log('Asset path resolved (using PUBLIC_URL):', fullPath);
  return fullPath;
}; 