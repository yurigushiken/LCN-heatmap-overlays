// src/components/PresentationSection.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PresentationSelector from './PresentationSelector';
import PresentationViewer from './PresentationViewer';
import '../styles/components/PresentationSection.css';

const PresentationSection = ({ presentationsData }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedAnalysisTypeId, setSelectedAnalysisTypeId] = useState(
    presentationsData?.analysisTypes?.[0]?.id || null
  );
  const [selectedPresentationEventId, setSelectedPresentationEventId] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showCaptions, setShowCaptions] = useState(false);
  const carouselRef = useRef(null);

  // Memoize derived data to prevent unnecessary recalculations
  const availableAnalysisTypes = useMemo(() =>
    presentationsData?.analysisTypes || [],
    [presentationsData]
  );

  const selectedAnalysis = useMemo(() =>
    availableAnalysisTypes.find(a => a.id === selectedAnalysisTypeId),
    [availableAnalysisTypes, selectedAnalysisTypeId]
  );

  const availableEvents = useMemo(() =>
    selectedAnalysis?.events || [],
    [selectedAnalysis]
  );

  // Set default event when analysis changes or on initial load
  useEffect(() => {
    if (availableEvents.length > 0 && !selectedPresentationEventId) {
      setSelectedPresentationEventId(availableEvents[0].eventId);
    }
  }, [availableEvents, selectedPresentationEventId]);

  const currentPresentation = useMemo(() =>
    availableEvents.find(e => e.eventId === selectedPresentationEventId),
    [availableEvents, selectedPresentationEventId]
  );

  // Combine directory path and plot filenames
  const currentPlots = useMemo(() => {
    if (!currentPresentation || !currentPresentation.directoryPath || !currentPresentation.plots) {
      return [];
    }
    const plots = currentPresentation.plots.map(plotFile =>
      `${currentPresentation.directoryPath}/${plotFile}`
    );
    console.log('Current presentation:', {
      title: currentPresentation.presentationTitle,
      directoryPath: currentPresentation.directoryPath,
      plotsCount: plots.length,
      plots: plots
    });
    return plots;
  }, [currentPresentation]);

  // Add logging to see derived state changes
  useEffect(() => {
    console.log('[PresentationSection] selectedPresentationEventId changed:', selectedPresentationEventId);
    console.log('[PresentationSection] currentPresentation derived:', currentPresentation);
    console.log('[PresentationSection] currentPlots derived:', currentPlots);
  }, [selectedPresentationEventId, currentPresentation, currentPlots]);

  // Add effect to focus carousel after event change
  useEffect(() => {
    // Check if an event is selected and there are plots to display
    if (selectedPresentationEventId && currentPlots.length > 0) {
      // Use setTimeout to ensure the carousel has rendered/updated
      const timerId = setTimeout(() => {
        if (carouselRef.current && typeof carouselRef.current.focusCarousel === 'function') {
          carouselRef.current.focusCarousel();
        } else {
          console.log('[PresentationSection] useEffect tried to focus, but carouselRef.current or focusCarousel is not ready.');
        }
      }, 100); // Delay in milliseconds

      return () => clearTimeout(timerId); // Cleanup timeout
    }
  }, [selectedPresentationEventId, currentPlots]); // Rerun when event ID or plots change

  const handleAnalysisChange = useCallback((analysisId) => {
    setSelectedAnalysisTypeId(analysisId);
    // Reset event selection when analysis changes
    const firstEventId = presentationsData?.analysisTypes
                          ?.find(a => a.id === analysisId)
                          ?.events?.[0]?.eventId || null;
    setSelectedPresentationEventId(firstEventId);
    setIsFullScreen(false);
  }, [presentationsData]);

  const handleEventChange = useCallback((eventId) => {
    console.log('[PresentationSection] handleEventChange called with eventId:', eventId);
    setSelectedPresentationEventId(eventId);
    setCurrentSlideIndex(0);
    setIsFullScreen(false);
  }, []);

  const handleSlideChange = useCallback((index) => {
    setCurrentSlideIndex(index);
  }, []);

  const toggleCaptions = useCallback(() => {
    setShowCaptions(prevState => !prevState);
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prevState => !prevState);
    // Focus carousel when entering fullscreen (optional, but might be good UX)
    if (!isFullScreen && carouselRef.current && typeof carouselRef.current.focusCarousel === 'function') {
      // Delay slightly to allow DOM updates
      setTimeout(() => carouselRef.current.focusCarousel(), 100); 
    }
  }, [isFullScreen]);

  // Add effect to handle Escape key AND toggle body class for fullscreen mode
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Check isFullScreen directly inside handler to ensure latest state
        setIsFullScreen(currentIsFullScreen => {
          if (currentIsFullScreen) {
            // If currently fullscreen, set to false
            return false;
          }
          // Otherwise, keep the state as is
          return currentIsFullScreen;
        });
      }
    };

    // Add/remove class based on isFullScreen state
    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.classList.add('fullscreen-active'); // <<< ADD class to body
      document.body.style.overflow = 'hidden'; // Keep existing overflow style
    } else {
      // Ensure class is removed if component initializes non-fullscreen
      // or when fullscreen is exited
      document.body.classList.remove('fullscreen-active'); // <<< REMOVE class from body
      // Restore body scroll if it was hidden by this effect
      // Check if style was set before resetting
      if (document.body.style.overflow === 'hidden') {
         document.body.style.overflow = 'auto';
      }
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Always remove class and restore overflow on cleanup
      document.body.classList.remove('fullscreen-active'); // <<< REMOVE class from body on cleanup
      // Restore body scroll ONLY if we are sure we set it to hidden
      if (document.body.style.overflow === 'hidden') { 
         document.body.style.overflow = 'auto';
      }
    };
  }, [isFullScreen]); // Rerun effect when isFullScreen changes

  if (!presentationsData || availableAnalysisTypes.length === 0) {
    return <div className="presentation-section">No presentation data available.</div>;
  }

  return (
    <div className={`presentation-section ${isFullScreen ? 'presentation-section--fullscreen' : ''}`}>
      <div className="presentation-header">
        <PresentationSelector
          analysisTypes={availableAnalysisTypes}
          events={availableEvents}
          selectedAnalysisTypeId={selectedAnalysisTypeId}
          selectedPresentationEventId={selectedPresentationEventId}
          onAnalysisChange={handleAnalysisChange}
          onEventChange={handleEventChange}
        />
        <div className="presentation-controls">
          {!isFullScreen && currentPresentation && currentPlots.length > 0 && (
            <button
              className="fullscreen-toggle"
              onClick={toggleFullScreen}
              title="View Fullscreen"
            >
              Fullscreen
            </button>
          )}
          <button
            className={`caption-toggle ${showCaptions ? 'active' : ''}`}
            onClick={toggleCaptions}
            title={showCaptions ? "Hide captions" : "Show captions"}
          >
            {showCaptions ? "Hide Captions" : "Show Captions"}
          </button>
        </div>
      </div>
      {isFullScreen && (
        <button
          className="presentation-fullscreen-close-button"
          onClick={toggleFullScreen}
          title="Exit Fullscreen"
        >
          &times;
        </button>
      )}
      <div className="presentation-content">
        {currentPresentation ? (
          <PresentationViewer
            ref={carouselRef}
            title={currentPresentation.presentationTitle}
            plots={currentPlots}
            directoryPath={currentPresentation.directoryPath}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={handleSlideChange}
            showCaptions={showCaptions}
            isFullScreen={isFullScreen}
          />
        ) : (
          <p>Select an analysis and event to view plots.</p>
        )}
      </div>
    </div>
  );
};

export default PresentationSection; 