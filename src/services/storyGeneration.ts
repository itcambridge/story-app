import { generateImage } from './imageGeneration';
import { StoryScene, StoryChoice, RiskLevel } from '../types/story';

export class StoryGenerationService {
  private static instance: StoryGenerationService;
  private currentContext: string = '';

  private constructor() {}

  public static getInstance(): StoryGenerationService {
    if (!StoryGenerationService.instance) {
      StoryGenerationService.instance = new StoryGenerationService();
    }
    return StoryGenerationService.instance;
  }

  private async generateChoices(context: string): Promise<StoryChoice[]> {
    // For now, generate static choices for testing
    // In a full implementation, this would use OpenAI to generate dynamic choices
    return [
      {
        id: '1',
        text: 'Venture deeper into the darkness',
        risk: 'HIGH' as RiskLevel,
        nextContext: `${context} The adventurer decides to venture deeper into the darkness.`
      },
      {
        id: '2',
        text: 'Search for an alternative route',
        risk: 'MEDIUM' as RiskLevel,
        nextContext: `${context} The adventurer looks for a safer path forward.`
      },
      {
        id: '3',
        text: 'Retreat to safety',
        risk: 'LOW' as RiskLevel,
        nextContext: `${context} The adventurer decides to retreat to a safer position.`
      }
    ];
  }

  private async generateSceneText(context: string): Promise<string> {
    // For now, return static text for testing
    // In a full implementation, this would use OpenAI to generate dynamic text
    return "You find yourself in a dimly lit cavern. Water drips from stalactites above, creating an eerie rhythm that echoes through the chamber. Strange glowing mushrooms provide just enough light to see the three possible paths ahead.";
  }

  private async generateImagePrompt(context: string): Promise<string> {
    // For now, return static prompt for testing
    // In a full implementation, this would use OpenAI to generate dynamic prompts
    return "A mysterious cave interior with glowing mushrooms, stalactites, and three branching paths, fantasy art style, dramatic lighting";
  }

  public async generateNewScene(context: string): Promise<StoryScene> {
    this.currentContext = context;
    
    try {
      // Generate scene components
      const [sceneText, choices, imagePrompt] = await Promise.all([
        this.generateSceneText(context),
        this.generateChoices(context),
        this.generateImagePrompt(context)
      ]);

      // Generate image
      const imageResult = await generateImage({
        prompt: imagePrompt,
        style: 'fantasy'
      });

      return {
        text: sceneText,
        choices: choices,
        imagePrompt: imagePrompt,
        imageUrl: imageResult.status === 'success' ? imageResult.imageUrl : undefined
      };
    } catch (error) {
      console.error('Failed to generate scene:', error);
      throw error;
    }
  }
} 