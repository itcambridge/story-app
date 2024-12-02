import { 
  StoryResponse, 
  ImageResponse, 
  APIError, 
  GenerateStoryRequest, 
  GenerateImageRequest 
} from '../types/story';

const API_BASE_URL = 'http://localhost:3001/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      response.status,
      error.message || 'An error occurred',
      error.code,
      error.details
    );
  }
  return response.json();
}

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof APIError && error.status >= 500) {
      console.warn(`Retrying operation, ${retries} attempts remaining`);
      await sleep(delay);
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const api = {
  generateStory: async (request: GenerateStoryRequest): Promise<StoryResponse> => {
    return withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return handleResponse<StoryResponse>(response);
    });
  },

  generateImage: async (request: GenerateImageRequest): Promise<ImageResponse> => {
    return withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return handleResponse<ImageResponse>(response);
    });
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
}; 