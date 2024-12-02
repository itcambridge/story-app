import React, { useState, useEffect } from 'react';
import { StoryScene, StoryChoice, StoryMemory } from '../types/story';
import { StoryGenerationService } from '../services/storyGeneration';
import { audioService } from '../services/audioService';
import { ThemeToggle } from '../components/ThemeToggle';
import '../styles/StoryPage.css';

export const StoryPage: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [isLoadingScene, setIsLoadingScene] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [memory, setMemory] = useState<StoryMemory>({
    decisions: [],
    visitedLocations: new Set(),
    lastChoice: undefined
  });

  const storyService = StoryGenerationService.getInstance();

  useEffect(() => {
    startNewScene();
  }, []);

  const startNewScene = async () => {
    setIsLoadingScene(true);
    setIsLoadingImage(true);
    try {
      const newScene = await storyService.generateNewScene(
        "You stand at the entrance of a mysterious cave. The wind whispers ancient secrets..."
      );
      setCurrentScene(newScene);
      if (newScene.imageUrl) {
        setImageUrl(newScene.imageUrl);
      }
      // Track initial location
      setMemory(prev => ({
        ...prev,
        visitedLocations: new Set([...prev.visitedLocations].concat(['cave entrance']))
      }));
    } catch (error) {
      console.error('Failed to generate scene:', error);
    } finally {
      setIsLoadingScene(false);
      setIsLoadingImage(false);
    }
  };

  const handleChoiceClick = async (choice: StoryChoice) => {
    setIsLoadingScene(true);
    setIsLoadingImage(true);
    audioService.playButtonClick();

    // Update memory with the choice
    setMemory(prev => ({
      ...prev,
      decisions: [...prev.decisions, {
        text: choice.text,
        timestamp: Date.now()
      }],
      lastChoice: {
        text: choice.text,
        risk: choice.risk
      }
    }));

    try {
      const newScene = await storyService.generateNewScene(choice.nextContext);
      setCurrentScene(newScene);
      if (newScene.imageUrl) {
        setImageUrl(newScene.imageUrl);
      }

      // Extract location from the scene text (simple example)
      const locationMatches = newScene.text.match(/(?:in|at|near) the ([^,.]+)/i);
      if (locationMatches && locationMatches[1]) {
        setMemory(prev => ({
          ...prev,
          visitedLocations: new Set([...prev.visitedLocations].concat([locationMatches[1].toLowerCase()]))
        }));
      }
    } catch (error) {
      console.error('Failed to generate scene:', error);
    } finally {
      setIsLoadingScene(false);
      setIsLoadingImage(false);
    }
  };

  const renderMemoryPanel = () => (
    <div className="memory-panel">
      <div className="memory-section">
        <h3>Journey Log</h3>
        <div className="decisions-list">
          {memory.decisions.slice(-3).map((decision, index) => (
            <div key={index} className="decision-entry">
              <span>{decision.text}</span>
              <span className="decision-time">
                {new Date(decision.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="memory-section">
        <h3>Locations Visited</h3>
        <div className="locations-list">
          {[...memory.visitedLocations].map((location, index) => (
            <span key={index} className="location-tag">
              {location}
            </span>
          ))}
        </div>
      </div>

      {memory.lastChoice && (
        <div className="memory-section">
          <h3>Last Decision</h3>
          <div className={`last-choice ${memory.lastChoice.risk.toLowerCase()}`}>
            {memory.lastChoice.text}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="story-container">
      <div className="story-banner">
        <div className="banner-controls">
          <button
            onClick={() => {
              const previousScene = storyService.goBack();
              if (previousScene) {
                setCurrentScene(previousScene);
                setImageUrl(previousScene.imageUrl || null);
                if (previousScene.choices) {
                  setMemory(prev => ({
                    ...prev,
                    decisions: prev.decisions.slice(0, -1),
                    lastChoice: prev.decisions.length > 1 ? {
                      text: prev.decisions[prev.decisions.length - 2].text,
                      risk: 'MEDIUM'
                    } : undefined
                  }));
                }
                audioService.playButtonClick();
              }
            }}
            disabled={storyService.getHistory().length <= 1 || isLoadingScene}
            className="control-button"
          >
            ← Back
          </button>
          <span className="scene-counter">
            {storyService.getHistory().length} {storyService.getHistory().length === 1 ? 'scene' : 'scenes'}
          </span>
          <button
            onClick={() => {
              storyService.reset();
              setMemory({
                decisions: [],
                visitedLocations: new Set(),
                lastChoice: undefined
              });
              startNewScene();
              audioService.playButtonClick();
            }}
            disabled={isLoadingScene}
            className="control-button"
          >
            ↺ Reset
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="scene-image">
        {isLoadingImage ? (
          <div className="image-placeholder loading">
            Generating scene image...
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={currentScene?.imagePrompt || "A scene from the story"}
          />
        ) : (
          <div className="image-placeholder error">
            Failed to load scene image
          </div>
        )}
      </div>

      {renderMemoryPanel()}

      <div className="story-text">
        <p>{currentScene?.text || 'Loading story...'}</p>
      </div>
      
      <div className="story-choices">
        {currentScene?.choices.map(choice => (
          <button 
            key={choice.id}
            className="choice-button"
            onClick={() => handleChoiceClick(choice)}
            onMouseEnter={() => audioService.playButtonHover()}
            disabled={isLoadingScene}
          >
            <div className="choice-content">
              <span>{choice.text}</span>
              <div className={`risk-indicator ${choice.risk.toLowerCase()}`}>
                RISK: {choice.risk}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 