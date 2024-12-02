export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StoryChoice {
  id: string;
  text: string;
  risk: RiskLevel;
  nextContext: string;
}

export interface StoryScene {
  text: string;
  choices: StoryChoice[];
  imagePrompt: string;
  imageUrl?: string;
}

export interface StoryResponse {
  text: string;
  choices: string[];
  imagePrompt: string;
}

export interface ImageResponse {
  status: 'success' | 'error';
  imageUrl?: string;
  error?: string;
}

export interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface GenerateStoryRequest {
  context: string;
  previousScenes?: string[];
  temperature?: number;
}

export interface GenerateImageRequest {
  prompt: string;
  style?: 'fantasy' | 'realistic' | 'anime' | 'abstract';
  size?: 'small' | 'medium' | 'large';
}

export interface StoryMemory {
  decisions: {
    text: string;
    timestamp: number;
  }[];
  visitedLocations: Set<string>;
  lastChoice?: {
    text: string;
    risk: RiskLevel;
  };
}

export interface StoryState {
  currentScene: StoryScene | null;
  history: StoryScene[];
  memory: StoryMemory;
  isLoading: boolean;
  error: APIError | null;
  retryCount: number;
}

export interface CachedStory {
  scene: StoryScene;
  timestamp: number;
  expiresAt: number;
}

export interface ChoicePreview {
  choiceId: string;
  previewText: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeToDecide?: number;
} 