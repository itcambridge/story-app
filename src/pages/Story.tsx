import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoryScene, StoryChoice, APIError } from '../types/story';
import { StoryGenerationService } from '../services/storyGeneration';
import { ChoiceWithPreview } from '../components/ChoiceWithPreview';

const Story: React.FC = () => {
  const [scene, setScene] = useState<StoryScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [history, setHistory] = useState<StoryScene[]>([]);
  const navigate = useNavigate();
  const storyService = StoryGenerationService.getInstance();

  useEffect(() => {
    console.log('Story component mounted');
    startNewStory();
  }, []);

  const startNewStory = async () => {
    console.log('Starting new story...');
    setIsLoading(true);
    setError(null);
    try {
      console.log('Generating initial scene...');
      const initialScene = await storyService.generateNewScene(
        "You stand at the entrance of a mysterious cave. The wind whispers ancient secrets..."
      );
      console.log('Initial scene generated:', initialScene);
      setScene(initialScene);
      setHistory([initialScene]);
    } catch (err) {
      console.error('Error generating initial scene:', err);
      setError(err instanceof Error ? { 
        status: 500, 
        message: err.message 
      } : { 
        status: 500, 
        message: 'An unknown error occurred' 
      });
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleAccept = async (choice: StoryChoice) => {
    if (!choice.nextContext) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const previousScenes = history.map(scene => scene.text);
      const nextScene = await storyService.generateNewScene(
        choice.nextContext,
        previousScenes
      );
      setScene(nextScene);
      setHistory(prev => [...prev, nextScene]);
    } catch (err) {
      setError(err instanceof Error ? { 
        status: 500, 
        message: err.message 
      } : { 
        status: 500, 
        message: 'An unknown error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = (choice: StoryChoice) => {
    // Optional: Add some feedback or animation when a choice is rejected
    console.log('Choice rejected:', choice);
  };

  const handleReset = () => {
    storyService.reset();
    startNewStory();
  };

  const handleBack = () => {
    if (history.length > 1) {
      const previousScene = history[history.length - 2];
      setScene(previousScene);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  // Add debug logging for render states
  console.log('Current state:', { isLoading, error, scene, historyLength: history.length });

  if (isLoading) {
    return (
      <div className="story-container loading">
        <div className="loading-spinner"></div>
        <p>Generating your adventure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-container error">
        <h2>Oops! Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={startNewStory} className="retry-button">
          Try Again
        </button>
        <button onClick={() => navigate('/')} className="home-button">
          Return Home
        </button>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="story-container">
        <h2>Story not found</h2>
        <button onClick={startNewStory} className="start-button">
          Start New Story
        </button>
      </div>
    );
  }

  return (
    <div className="story-container">
      {scene.imageUrl && (
        <div className="story-image">
          <img src={scene.imageUrl} alt="Story scene" />
        </div>
      )}
      
      <div className="story-text">
        <p>{scene.text}</p>
      </div>

      <div className="story-choices">
        {scene.choices.map((choice) => (
          <ChoiceWithPreview
            key={choice.id}
            choice={choice}
            onAccept={handleAccept}
            onReject={handleReject}
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="story-controls">
        <button
          onClick={handleBack}
          disabled={history.length <= 1 || isLoading}
          className="control-button"
        >
          Back
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="control-button"
        >
          Reset
        </button>
      </div>

      <div className="scene-counter">
        <span>{history.length} {history.length === 1 ? 'scene' : 'scenes'} explored</span>
      </div>
    </div>
  );
};

export default Story; 