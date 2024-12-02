import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../services/api';
import type { StoryResponse, ImageResponse } from '../../types/story';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Story API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates story content successfully', async () => {
    const mockResponse: StoryResponse = {
      text: "A new story scene",
      choices: [
        {
          text: "Go left",
          consequence: "You might find treasure",
          confidence: 75,
          riskLevel: "medium"
        }
      ],
      imagePrompt: "A dark corridor with two paths"
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await api.generateStory({
      context: "The adventurer reaches a fork in the path",
      temperature: 0.7
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/generate-story'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.any(String)
      })
    );
  });

  it('generates image successfully', async () => {
    const mockResponse: ImageResponse = {
      status: 'success',
      imageUrl: 'https://example.com/image.jpg'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await api.generateImage({
      prompt: "A mysterious cave entrance",
      style: 'fantasy'
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/generate-image'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.any(String)
      })
    );
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(api.generateStory({
      context: "Test context"
    })).rejects.toThrow('Failed to generate story');
  });

  it('retries failed requests', async () => {
    // First attempt fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    // Second attempt succeeds
    const mockResponse: StoryResponse = {
      text: "Success after retry",
      choices: [],
      imagePrompt: "Test prompt"
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await api.generateStory({
      context: "Test context"
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(api.generateStory({
      context: "Test context"
    })).rejects.toThrow('Network error');
  });

  it('validates response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        invalidFormat: true // Missing required fields
      })
    });

    await expect(api.generateStory({
      context: "Test context"
    })).rejects.toThrow();
  });
}); 