// src/components/PresentationViewer.js
import React, { useState, useEffect } from 'react';
import { resolvePresentationAssetPath } from '../utils/urlUtils';
import GlideCarousel from './GlideCarousel';
import '../styles/components/PresentationViewer.css';

const PresentationViewer = ({ title, plots, directoryPath, currentSlideIndex = 0, onSlideChange, showCaptions = false }) => {
  const [imageData, setImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!plots || plots.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchCatalogData = async () => {
      try {
        // Try to fetch the visualization catalog
        const catalogPath = `${directoryPath}/visualization_catalog.json`;
        const response = await fetch(resolvePresentationAssetPath(catalogPath));
        
        if (response.ok) {
          const catalogData = await response.json();
          
          // Format the images with captions from the catalog
          const formattedImages = plots.map((plotPath, index) => {
            // Extract just the filename from the plot path
            const filename = plotPath.split('/').pop();
            
            // Find matching entry in catalog
            const catalogEntry = catalogData.find(
              entry => entry.file_path.endsWith(filename)
            );
            
            return {
              src: resolvePresentationAssetPath(plotPath),
              alt: `Plot ${index + 1} for ${title}`,
              caption: catalogEntry ? catalogEntry.description : null
            };
          });
          
          setImageData(formattedImages);
        } else {
          // If catalog not found, just use basic image data
          const formattedImages = plots.map((plotPath, index) => ({
            src: resolvePresentationAssetPath(plotPath),
            alt: `Plot ${index + 1} for ${title}`
          }));
          setImageData(formattedImages);
        }
      } catch (error) {
        console.error('Error fetching visualization catalog:', error);
        // Fallback to basic image data
        const formattedImages = plots.map((plotPath, index) => ({
          src: resolvePresentationAssetPath(plotPath),
          alt: `Plot ${index + 1} for ${title}`
        }));
        setImageData(formattedImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [plots, title, directoryPath]);

  if (isLoading) {
    return <p className="loading-message">Loading presentation...</p>;
  }

  if (!plots || plots.length === 0) {
    return <p className="no-plots-message">No plots available for this selection.</p>;
  }

  return (
    <div className="presentation-viewer">
      <GlideCarousel 
        images={imageData} 
        title={title} 
        startIndex={currentSlideIndex}
        onSlideChange={onSlideChange}
        showCaptions={showCaptions}
      />
    </div>
  );
};

export default PresentationViewer; 