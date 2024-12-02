interface ImageGenerationOptions {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'fantasy';
  size?: 'small' | 'medium' | 'large';
}

interface ImageGenerationResponse {
  imageUrl: string;
  status: 'success' | 'error';
  message?: string;
}

const API_URL = 'http://localhost:3001';

export const generateImage = async (
  options: ImageGenerationOptions
): Promise<ImageGenerationResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return {
      imageUrl: data.imageUrl,
      status: 'success',
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      imageUrl: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to generate image',
    };
  }
}; 