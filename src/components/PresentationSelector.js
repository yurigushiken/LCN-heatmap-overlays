// src/components/PresentationSelector.js
import React from 'react';
import '../styles/components/PresentationSelector.css';

const PresentationSelector = ({
  analysisTypes,
  events,
  selectedAnalysisTypeId,
  selectedPresentationEventId,
  onAnalysisChange,
  onEventChange
}) => {

  const handleAnalysisSelectChange = (e) => {
    onAnalysisChange(e.target.value);
  };

  const handleEventSelectChange = (e) => {
    onEventChange(e.target.value);
  };

  return (
    <div className="presentation-selector-panel">
      <div className="selector-header">
        <h3>Analysis Plots</h3>
      </div>
      <div className="selector-controls">
        <div className="selector-group">
          <label htmlFor="analysis-select">Analysis:</label>
          <select
            id="analysis-select"
            value={selectedAnalysisTypeId || ''}
            onChange={handleAnalysisSelectChange}
            disabled={analysisTypes.length <= 1} // Disable if only one option
          >
            {analysisTypes.map(analysis => (
              <option key={analysis.id} value={analysis.id}>
                {analysis.name}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="event-select">Event:</label>
          <select
            id="event-select"
            value={selectedPresentationEventId || ''}
            onChange={handleEventSelectChange}
            disabled={!selectedAnalysisTypeId || events.length === 0}
          >
            {events.length === 0 && <option value="">-- Select Analysis First --</option>}
            {events.map(event => (
              <option key={event.eventId} value={event.eventId}>
                {`${event.eventId.toUpperCase()}`} {/* Simple display for now */}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PresentationSelector; 