import React, { useState } from 'react';
import { StoryChoice } from '../types/story';

interface ChoiceWithPreviewProps {
  choice: StoryChoice;
  onAccept: (choice: StoryChoice) => void;
  onReject: (choice: StoryChoice) => void;
  disabled?: boolean;
}

export const ChoiceWithPreview: React.FC<ChoiceWithPreviewProps> = ({
  choice,
  onAccept,
  onReject,
  disabled = false
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getRiskColor = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#f44336';
      default:
        return '#3498db';
    }
  };

  const getRiskDescription = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'Safe choice - minimal risk involved';
      case 'medium':
        return 'Moderate risk - outcome uncertain';
      case 'high':
        return 'High risk - dangerous but potentially rewarding';
      default:
        return 'Risk level unknown';
    }
  };

  const getRiskIcon = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return '🛡️';
      case 'medium':
        return '⚠️';
      case 'high':
        return '⚡';
      default:
        return '❔';
    }
  };

  return (
    <div className="choice-preview-container">
      <button
        className={`choice-button ${isPreviewOpen ? 'expanded' : ''}`}
        onClick={() => setIsPreviewOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        style={{
          borderColor: isHovered ? getRiskColor(choice.riskLevel) : undefined
        }}
      >
        <div className="choice-content">
          <span className="choice-text">{choice.text}</span>
          {choice.riskLevel && (
            <div 
              className="risk-indicator"
              style={{ backgroundColor: getRiskColor(choice.riskLevel) }}
              title={getRiskDescription(choice.riskLevel)}
            >
              <span className="risk-icon">{getRiskIcon(choice.riskLevel)}</span>
              <span className="risk-label">Risk: {choice.riskLevel}</span>
            </div>
          )}
        </div>
      </button>

      {isPreviewOpen && (
        <div className="choice-preview">
          <div className="preview-content">
            <div className="risk-details">
              <span className="risk-icon-large">{getRiskIcon(choice.riskLevel)}</span>
              <div className="risk-info">
                <h4>Risk Level: {choice.riskLevel}</h4>
                <p>{getRiskDescription(choice.riskLevel)}</p>
              </div>
            </div>
            {choice.consequence && (
              <p className="consequence-text">{choice.consequence}</p>
            )}
            {choice.confidence && (
              <div className="confidence-meter">
                <div 
                  className="confidence-fill"
                  style={{ 
                    width: `${choice.confidence}%`,
                    backgroundColor: getRiskColor(choice.riskLevel)
                  }}
                />
                <span>Confidence: {choice.confidence}%</span>
              </div>
            )}
          </div>
          
          <div className="preview-actions">
            <button
              className="action-button accept"
              onClick={() => {
                onAccept(choice);
                setIsPreviewOpen(false);
              }}
              disabled={disabled}
            >
              Accept
            </button>
            <button
              className="action-button reject"
              onClick={() => {
                onReject(choice);
                setIsPreviewOpen(false);
              }}
              disabled={disabled}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 