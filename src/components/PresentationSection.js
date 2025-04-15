// src/components/PresentationSection.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PresentationSelector from './PresentationSelector';
import PresentationViewer from './PresentationViewer';
import '../styles/components/PresentationSection.css';

const PresentationSection = ({ presentationsData }) => {
  const [selectedAnalysisTypeId, setSelectedAnalysisTypeId] = useState(
    presentationsData?.analysisTypes?.[0]?.id || null
  );
  const [selectedPresentationEventId, setSelectedPresentationEventId] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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

  const handleAnalysisChange = useCallback((analysisId) => {
    setSelectedAnalysisTypeId(analysisId);
    // Reset event selection when analysis changes
    const firstEventId = presentationsData?.analysisTypes
                          ?.find(a => a.id === analysisId)
                          ?.events?.[0]?.eventId || null;
    setSelectedPresentationEventId(firstEventId);
  }, [presentationsData]);

  const handleEventChange = useCallback((eventId) => {
    setSelectedPresentationEventId(eventId);
  }, []);

  const handleSlideChange = useCallback((index) => {
    setCurrentSlideIndex(index);
  }, []);

  if (!presentationsData || availableAnalysisTypes.length === 0) {
    return <div className="presentation-section">No presentation data available.</div>;
  }

  return (
    <div className="presentation-section">
      <div className="presentation-header">
        <PresentationSelector
          analysisTypes={availableAnalysisTypes}
          events={availableEvents}
          selectedAnalysisTypeId={selectedAnalysisTypeId}
          selectedPresentationEventId={selectedPresentationEventId}
          onAnalysisChange={handleAnalysisChange}
          onEventChange={handleEventChange}
        />
      </div>
      <div className="presentation-content">
        {currentPresentation ? (
          <PresentationViewer
            title={currentPresentation.presentationTitle}
            plots={currentPlots}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={handleSlideChange}
          />
        ) : (
          <p>Select an analysis and event to view plots.</p>
        )}
      </div>
    </div>
  );
};

export default PresentationSection; 