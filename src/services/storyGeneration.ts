import { generateImage } from './imageGeneration';
import { StoryScene, StoryChoice, RiskLevel, StoryMemory } from '../types/story';
import { api } from './api';
import { storyCache } from './storyCache';

export class StoryGenerationService {
  private static instance: StoryGenerationService;
  private currentContext: string = '';
  private storyHistory: StoryScene[] = [];
  private memory: StoryMemory = {
    decisions: [],
    visitedLocations: new Set(),
    lastChoice: undefined
  };

  private constructor() {}

  public static getInstance(): StoryGenerationService {
    if (!StoryGenerationService.instance) {
      StoryGenerationService.instance = new StoryGenerationService();
    }
    return StoryGenerationService.instance;
  }

  public getHistory(): StoryScene[] {
    return [...this.storyHistory];
  }

  public goBack(): StoryScene | null {
    if (this.storyHistory.length > 1) {
      this.storyHistory.pop(); // Remove current scene
      return this.storyHistory[this.storyHistory.length - 1];
    }
    return null;
  }

  public reset(): void {
    this.currentContext = '';
    this.storyHistory = [];
    this.memory = {
      decisions: [],
      visitedLocations: new Set(),
      lastChoice: undefined
    };
  }

  public async generateNewScene(context: string, choice?: StoryChoice): Promise<StoryScene> {
    // Check cache first
    const cachedScene = storyCache.getScene(context);
    if (cachedScene) {
      console.log('Using cached scene for context:', context);
      this.storyHistory.push(cachedScene);
      return cachedScene;
    }

    if (choice) {
      this.memory.decisions.push({
        text: choice.text,
        timestamp: Date.now()
      });
      this.memory.lastChoice = {
        text: choice.text,
        risk: choice.risk
      };
    }

    try {
      const response = await api.generateStory({
        context: this.storyHistory.length === 0 
          ? "Begin an exciting adventure story with an intriguing situation."
          : context,
        temperature: 0.9
      });

      if (!response) {
        throw new Error('No response from story generation API');
      }

      const imagePrompt = response.imagePrompt.split(' ').length > 10 
        ? response.imagePrompt.split(' ').slice(0, 10).join(' ') + '. Fantasy art style'
        : response.imagePrompt + '. Fantasy art style';

      const imageResult = await generateImage({
        prompt: imagePrompt,
        style: 'fantasy'
      });

      const newScene: StoryScene = {
        text: response.text,
        choices: response.choices.map((choice: any, index: number) => ({
          id: String(index + 1),
          text: choice.text.replace('Choose to ', ''),
          risk: (choice.riskLevel || 'MEDIUM').toUpperCase() as RiskLevel,
          nextContext: `${response.text} The adventurer ${choice.text.toLowerCase().replace('choose to ', '')}`
        })),
        imagePrompt: imagePrompt,
        imageUrl: imageResult.status === 'success' ? imageResult.imageUrl : undefined
      };

      // Cache the new scene
      storyCache.addScene(context, newScene);
      
      // Add to history
      this.storyHistory.push(newScene);

      return newScene;
    } catch (error) {
      console.error('Failed to generate scene:', error);
      throw error;
    }
  }
} 