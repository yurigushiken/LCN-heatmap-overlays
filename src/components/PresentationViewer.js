// src/components/PresentationViewer.js
import React, { useState, useEffect, forwardRef } from 'react';
import { resolvePresentationAssetPath } from '../utils/urlUtils';
import GlideCarousel from './GlideCarousel';
import '../styles/components/PresentationViewer.css';

// Wrap component with forwardRef
const PresentationViewer = forwardRef(({ title, plots, directoryPath, currentSlideIndex = 0, onSlideChange, showCaptions = false, isFullScreen }, ref) => {
  console.log('--- PresentationViewer Start Render ---');
  const [imageData, setImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log props on render
  console.log('[PresentationViewer] Rendering with props:', { title, plots, directoryPath });

  useEffect(() => {
    console.log('[PresentationViewer] useEffect triggered. Plots prop:', plots);
    if (!plots || plots.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchCatalogData = async () => {
      console.log('[PresentationViewer] fetchCatalogData started');
      try {
        // Try to fetch the visualization catalog
        const catalogPath = `${directoryPath}/visualization_catalog.json`;
        console.log('[PresentationViewer] Fetching catalog:', catalogPath);
        const response = await fetch(resolvePresentationAssetPath(catalogPath));
        
        console.log('[PresentationViewer] Catalog fetch response status:', response.status);

        if (response.ok) {
          const catalogData = await response.json();
          
          // Format the images with captions from the catalog
          const formattedImages = plots.map((plotPath, index) => {
            const filename = plotPath.split('/').pop();
            const catalogEntry = catalogData.find(
              entry => entry.file_path.endsWith(filename)
            );

            let finalCaption = null; // Initialize caption

            if (catalogEntry) {
              const metadata = catalogEntry.metadata;
              const description = catalogEntry.description;
              const plotType = catalogEntry.plot_type;
              const identifier = catalogEntry.identifier || '';

              let ageGroup = '';
              const idParts = identifier.split('_');
              if (idParts.length > 1 && idParts[0].match(/^\d+$/)) {
                 ageGroup = idParts.slice(1).join(' ');
                 ageGroup = ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1);
              } else {
                 ageGroup = identifier.replace(/_/g, ' ');
                 ageGroup = ageGroup.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              }
              
              if (metadata && metadata.hasOwnProperty('entry_frame') && metadata.hasOwnProperty('duration_gte_40_entry_lte_75')) {
                let resultsParts = [];
                resultsParts.push(`Results (${ageGroup}):`);
                if (metadata.entry_frame !== null) {
                  resultsParts.push(`- Entry (≤F75): Frame ${metadata.entry_frame}`);
                }
                if (metadata.exit_frame !== null) {
                   resultsParts.push(`- Exit (<40%): Frame ${metadata.exit_frame}`);
                }
                 if (metadata.duration_gte_40_entry_lte_75 !== null) {
                   resultsParts.push(`- Duration (≥40%): ${metadata.duration_gte_40_entry_lte_75} frames`);
                 } else {
                   resultsParts.push(`- Duration (≥40%): N/A ${metadata.entry_frame !== null ? '(Entry > F75)' : ''}`);
                 }
                 if (metadata.latency_body_to_entry_lte_75 !== null) {
                   resultsParts.push(`- Latency (from body frame): ${metadata.latency_body_to_entry_lte_75} frames`);
                 } else {
                   resultsParts.push(`- Latency (from body frame): N/A ${metadata.entry_frame !== null ? '(Entry > F75)' : ''}`);
                 }
                finalCaption = resultsParts.join(' '); 
              } else if (plotType === "01_baseline_age_timeseries") {
                 finalCaption = description;
              } else if (metadata && plotType === '05_mean_proportion_comparison_bar') {
                 let resultsParts = [`Results (Mean Proportion):`];
                 for (const [key, value] of Object.entries(metadata)) {
                     const displayValue = (typeof value === 'number') ? value.toFixed(3) : value; 
                     resultsParts.push(`- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${displayValue}`);
                 }
                 finalCaption = resultsParts.join(' ');
              } else if (metadata && (plotType === '04_duration_bar' || plotType === '03_latency_bar')) {
                 let resultType = plotType === '04_duration_bar' ? 'Duration (Frames, 0 if N/A)' : 'Latency (Frames, 0 if N/A)';
                 let resultsParts = [`Results (${resultType}):`];
                 for (const [key, value] of Object.entries(metadata)) {
                     const displayValue = (value === null || value === undefined) ? 0 : value;
                     resultsParts.push(`- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${displayValue}`);
                 }
                 finalCaption = resultsParts.join(' ');
              } else {
                finalCaption = description;
              }
            } else {
              // No fallback; caption remains null if no catalog entry
              finalCaption = null;
            }

            console.log(`[PresentationViewer] Final caption for ${filename}:`, finalCaption);

            return {
              src: resolvePresentationAssetPath(plotPath),
              alt: `Plot ${index + 1} for ${title}`,
              caption: finalCaption // Assign the constructed or null caption
            };
          });
          
          console.log('[PresentationViewer] Setting imageData (with constructed captions):', formattedImages);
          setImageData(formattedImages);
        } else {
          console.log('[PresentationViewer] Catalog not found or fetch failed. Formatting without captions.');
          // If catalog not found, just use basic image data
          const formattedImages = plots.map((plotPath, index) => ({
            src: resolvePresentationAssetPath(plotPath),
            alt: `Plot ${index + 1} for ${title}`,
            caption: null // Ensure caption is null when no catalog
          }));
          console.log('[PresentationViewer] Setting imageData (no catalog):', formattedImages);
          setImageData(formattedImages);
        }
      } catch (error) {
        console.error('Error fetching visualization catalog:', error);
        // Fallback to basic image data
        const formattedImages = plots.map((plotPath, index) => ({
          src: resolvePresentationAssetPath(plotPath),
          alt: `Plot ${index + 1} for ${title}`,
          caption: null // Ensure caption is null on error
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
    <div className={`presentation-viewer ${isFullScreen ? 'presentation-viewer--fullscreen' : ''}`}>
      {/* Pass the forwarded ref to GlideCarousel */}
      <GlideCarousel
        ref={ref}
        images={imageData}
        title={title}
        startIndex={currentSlideIndex}
        onSlideChange={onSlideChange}
        showCaptions={showCaptions}
        isFullScreen={isFullScreen}
      />
    </div>
  );
});

export default PresentationViewer; 