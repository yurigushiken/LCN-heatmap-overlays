// src/components/PresentationViewer.js
import React from 'react';
import { resolvePresentationAssetPath } from '../utils/urlUtils';
import GlideCarousel from './GlideCarousel';
import '../styles/components/PresentationViewer.css';

const PresentationViewer = ({ title, plots, currentSlideIndex = 0, onSlideChange }) => {
  if (!plots || plots.length === 0) {
    return <p className="no-plots-message">No plots available for this selection.</p>;
  }
  
  // Format the images for the GlideCarousel
  const formattedImages = plots.map((plotPath, index) => ({
    src: resolvePresentationAssetPath(plotPath),
    alt: `Plot ${index + 1} for ${title}`
  }));

  return (
    <div className="presentation-viewer">
      <GlideCarousel 
        images={formattedImages} 
        title={title} 
        startIndex={currentSlideIndex}
        onSlideChange={onSlideChange}
      />
    </div>
  );
};

export default PresentationViewer; 