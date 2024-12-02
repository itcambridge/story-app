import React, { useEffect, useState } from 'react';
import { audioService } from '../services/audioService';
import { useTheme } from '../context/ThemeContext';
import { generateImage } from '../services/imageGeneration';
import { StoryGenerationService } from '../services/storyGeneration';
import { StoryScene, StoryChoice } from '../types/story';
import '../styles/StoryPage.css';

const storyService = StoryGenerationService.getInstance();

export const StoryPage: React.FC = () => {
  const { theme } = useTheme();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [isLoadingScene, setIsLoadingScene] = useState(true);

  useEffect(() => {
    // Load sounds when component mounts
    audioService.loadSound('hover', '/sounds/hover.mp3');
    audioService.loadSound('click', '/sounds/click.mp3');
    audioService.loadSound('success', '/sounds/success.mp3');
    audioService.loadSound('error', '/sounds/error.mp3');
    audioService.loadSound('theme', '/sounds/theme-switch.mp3');
    audioService.loadSound('ambient', '/sounds/ambient.mp3');
    audioService.loadSound('accept', '/sounds/accept.mp3');
    audioService.loadSound('reject', '/sounds/reject.mp3');

    // Initialize story
    const initializeStory = async () => {
      try {
        const initialScene = await storyService.generateNewScene('Start a new story about exploring a mysterious cave');
        setCurrentScene(initialScene);
        if (initialScene.imageUrl) {
          setImageUrl(initialScene.imageUrl);
          setIsLoadingImage(false);
        }
      } catch (error) {
        console.error('Failed to initialize story:', error);
      } finally {
        setIsLoadingScene(false);
      }
    };

    initializeStory();
  }, []);

  const handleChoiceClick = async (choice: StoryChoice) => {
    setIsLoadingScene(true);
    setIsLoadingImage(true);
    audioService.playButtonClick();
    try {
      const newScene = await storyService.generateNewScene(choice.nextContext);
      setCurrentScene(newScene);
      if (newScene.imageUrl) {
        setImageUrl(newScene.imageUrl);
      }
    } catch (error) {
      console.error('Failed to generate scene:', error);
    } finally {
      setIsLoadingScene(false);
      setIsLoadingImage(false);
    }
  };

  return (
    <div className="story-container">
      <h1>Interactive Story</h1>
      
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

      <p>{currentScene?.text || 'Loading story...'}</p>
      
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