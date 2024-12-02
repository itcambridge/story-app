import { generateImage } from './imageGeneration';
import { StoryScene, StoryChoice, RiskLevel } from '../types/story';
import { api } from './api';

export class StoryGenerationService {
  private static instance: StoryGenerationService;
  private currentContext: string = '';
  private storyHistory: string[] = [];

  private constructor() {}

  public static getInstance(): StoryGenerationService {
    if (!StoryGenerationService.instance) {
      StoryGenerationService.instance = new StoryGenerationService();
    }
    return StoryGenerationService.instance;
  }

  private async generateChoices(currentText: string): Promise<StoryChoice[]> {
    try {
      const prompt = `Based on this current scene: "${currentText}"
      Generate 3 different choices for what the adventurer could do next.
      Each choice should have:
      - A clear action
      - A potential consequence
      - A risk level (low, medium, or high)`;

      const response = await api.generateStory({
        context: prompt,
        temperature: 0.9,
        previousScenes: this.storyHistory
      });

      console.log('API Response for choices:', response);

      if (!response?.choices?.length) {
        console.warn('No choices returned from API, using fallback');
        throw new Error('No choices returned from API');
      }

      // Map the API response choices to our StoryChoice format
      return response.choices.map((choice: any, index) => {
        // Ensure we have the required properties
        if (!choice.text) {
          throw new Error('Invalid choice format from API');
        }

        return {
          id: String(index + 1),
          text: choice.text.replace('Choose to ', ''),  // Remove "Choose to" prefix if present
          risk: (choice.riskLevel || 'MEDIUM').toUpperCase() as RiskLevel,
          nextContext: `${currentText} The adventurer ${choice.text.toLowerCase().replace('choose to ', '')}`
        };
      });

    } catch (error) {
      console.error('Failed to generate choices:', error);
      // Generate contextual fallback choices based on the current text
      const fallbackChoices = this.generateFallbackChoices(currentText);
      console.log('Using fallback choices:', fallbackChoices);
      return fallbackChoices;
    }
  }

  private generateFallbackChoices(currentText: string): StoryChoice[] {
    const textLower = currentText.toLowerCase();
    
    // Pattern matching for common scenarios
    if (textLower.includes('creature') || textLower.includes('monster') || textLower.includes('beast')) {
      return [
        {
          id: '1',
          text: 'Prepare for combat with the creatures',
          risk: 'HIGH',
          nextContext: `${currentText} The adventurer prepares to fight.`
        },
        {
          id: '2',
          text: 'Try to sneak past without being noticed',
          risk: 'MEDIUM',
          nextContext: `${currentText} The adventurer attempts to move silently.`
        },
        {
          id: '3',
          text: 'Search for an alternative escape route',
          risk: 'LOW',
          nextContext: `${currentText} The adventurer looks for another way out.`
        }
      ];
    }

    if (textLower.includes('tome') || textLower.includes('book') || textLower.includes('scroll')) {
      return [
        {
          id: '1',
          text: 'Read from the mysterious text',
          risk: 'HIGH',
          nextContext: `${currentText} The adventurer begins to read the ancient words.`
        },
        {
          id: '2',
          text: 'Examine the text without reading it aloud',
          risk: 'MEDIUM',
          nextContext: `${currentText} The adventurer carefully studies the text.`
        },
        {
          id: '3',
          text: 'Leave the text untouched',
          risk: 'LOW',
          nextContext: `${currentText} The adventurer decides not to risk reading the text.`
        }
      ];
    }

    // Default choices if no specific scenario is matched
    return [
      {
        id: '1',
        text: 'Investigate the surroundings carefully',
        risk: 'LOW',
        nextContext: `${currentText} The adventurer takes time to examine the area.`
      },
      {
        id: '2',
        text: 'Press forward boldly',
        risk: 'HIGH',
        nextContext: `${currentText} The adventurer moves ahead with determination.`
      },
      {
        id: '3',
        text: 'Look for an alternative approach',
        risk: 'MEDIUM',
        nextContext: `${currentText} The adventurer considers other options.`
      }
    ];
  }

  private calculateRiskLevel(choice: string): RiskLevel {
    const riskWords = {
      high: ['dangerous', 'risky', 'deadly', 'fight', 'attack', 'jump', 'dark', 'deep', 'confront', 'challenge'],
      medium: ['explore', 'investigate', 'search', 'climb', 'swim', 'unknown', 'attempt', 'try'],
      low: ['careful', 'safe', 'cautious', 'slow', 'wait', 'observe', 'return', 'hide', 'avoid']
    };

    const choiceLower = choice.toLowerCase();
    
    if (riskWords.high.some(word => choiceLower.includes(word))) {
      return 'HIGH';
    }
    if (riskWords.medium.some(word => choiceLower.includes(word))) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private async generateSceneText(context: string): Promise<any> {
    try {
      const prompt = `Based on the previous events: "${context}"
        Continue the story with a vivid description of what happens next.
        Focus on the immediate consequences of the adventurer's action and the new situation they find themselves in.
        Include sensory details and any important discoveries or challenges they face.
        Keep the description concise but engaging.
        For each choice, include potential consequences and assess its risk level.`;

      const response = await api.generateStory({
        context: prompt,
        temperature: 0.7
      });

      if (!response || !response.text || !Array.isArray(response.choices)) {
        throw new Error('Invalid response format from API');
      }

      return response;
    } catch (error) {
      console.error('Failed to generate scene text:', error);
      return {
        text: "The adventure continues as new challenges emerge...",
        choices: this.generateFallbackChoices("The adventure continues...")
      };
    }
  }

  private async generateImagePrompt(sceneText: string): Promise<string> {
    try {
      const prompt = `Analyze this scene and create a very concise image prompt.
Scene: "${sceneText}"

Return your response in this exact JSON format:
{
  "keyWords": ["word1", "word2", "word3", "word4", "word5"],
  "imagePrompt": "your concise image prompt here"
}

Requirements:
- The image prompt MUST be 10 words or less
- Focus on the SINGLE most important visual element or action
- Capture the main subject and its most striking feature
- Include ONE key atmospheric detail (lighting, mood, or weather)
- Make it specific and vivid
- Optimize for AI image generation
- DO NOT include multiple subjects or actions

Example format:
{
  "keyWords": ["mountain", "sunset", "silhouette", "dramatic", "peak"],
  "imagePrompt": "Lone mountain peak silhouetted against blazing sunset sky"
}`;

      const response = await api.generateStory({
        context: prompt,
        temperature: 0.7
      });

      if (!response?.text) {
        throw new Error('Invalid response format from API');
      }

      try {
        // Parse the JSON response
        const parsedResponse = JSON.parse(response.text);
        const { keyWords, imagePrompt } = parsedResponse;

        // Log for debugging
        console.log('Key Words:', keyWords.join(', '));
        console.log('Raw image prompt:', imagePrompt);

        // Count words
        const wordCount = imagePrompt.split(' ').length;
        if (wordCount > 10) {
          console.warn('Image prompt too long, truncating...');
          const shortenedPrompt = imagePrompt.split(' ').slice(0, 10).join(' ');
          return `${shortenedPrompt}. Fantasy art style`;
        }

        // Add style directive
        const finalPrompt = `${imagePrompt}. Fantasy art style`;
        console.log('Final image prompt:', finalPrompt);

        return finalPrompt;
      } catch (error) {
        console.error('Failed to parse image prompt response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to generate image prompt:', error);
      return "Dramatic fantasy scene with magical lighting";
    }
  }

  public async generateNewScene(context: string): Promise<StoryScene> {
    // For the first scene
    if (this.storyHistory.length === 0) {
      const initialPrompt = "Begin an exciting adventure story with an intriguing situation.";
      this.storyHistory.push(initialPrompt);
      this.currentContext = initialPrompt;
    } else {
      this.storyHistory.push(context);
      this.currentContext = context;
    }
    
    try {
      // Generate the scene text and initial choices
      const sceneResponse = await this.generateSceneText(this.currentContext);
      
      // Ensure the image prompt is concise (10 words or less)
      const words = sceneResponse.imagePrompt.split(' ');
      const imagePrompt = words.length > 10 
        ? words.slice(0, 10).join(' ') + '. Fantasy art style'
        : sceneResponse.imagePrompt + '. Fantasy art style';

      // Generate image
      const imageResult = await generateImage({
        prompt: imagePrompt,
        style: 'fantasy'
      });

      // Map the choices from the scene response
      const choices = sceneResponse.choices.map((choice: any, index: number) => ({
        id: String(index + 1),
        text: choice.text.replace('Choose to ', ''),
        risk: (choice.riskLevel || 'MEDIUM').toUpperCase() as RiskLevel,
        nextContext: `${sceneResponse.text} The adventurer ${choice.text.toLowerCase().replace('choose to ', '')}`
      }));

      return {
        text: sceneResponse.text,
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