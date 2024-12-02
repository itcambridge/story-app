import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StoryPage } from '../../pages/StoryPage';
import { ThemeProvider } from '../../context/ThemeContext';
import { StoryGenerationService } from '../../services/storyGeneration';
import { audioService } from '../../services/audioService';

// Mock the services
vi.mock('../../services/storyGeneration', () => ({
  StoryGenerationService: {
    getInstance: vi.fn(() => ({
      generateNewScene: vi.fn().mockResolvedValue({
        text: "You find yourself in a mysterious cave. The air is damp and cool.",
        choices: [
          {
            id: "1",
            text: "Explore deeper into the cave",
            risk: "HIGH",
            nextContext: "The adventurer explores deeper into the cave"
          },
          {
            id: "2",
            text: "Search for another way",
            risk: "LOW",
            nextContext: "The adventurer looks for an alternative route"
          }
        ],
        imagePrompt: "Dark mysterious cave entrance with glowing fungi",
        imageUrl: "mock-image-url.jpg"
      })
    }))
  }
}));

vi.mock('../../services/audioService', () => ({
  audioService: {
    loadSound: vi.fn(),
    playButtonClick: vi.fn(),
    playButtonHover: vi.fn(),
    playThemeSwitch: vi.fn()
  }
}));

describe('Story Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial story scene with choices', async () => {
    render(
      <ThemeProvider>
        <StoryPage />
      </ThemeProvider>
    );

    // Wait for initial scene to load
    await waitFor(() => {
      expect(screen.getByText(/You find yourself in a mysterious cave/)).toBeInTheDocument();
    });

    // Check if choices are rendered
    expect(screen.getByText(/Explore deeper into the cave/)).toBeInTheDocument();
    expect(screen.getByText(/Search for another way/)).toBeInTheDocument();

    // Check if risk levels are displayed
    expect(screen.getByText(/HIGH/)).toBeInTheDocument();
    expect(screen.getByText(/LOW/)).toBeInTheDocument();

    // Check if image is rendered
    const image = screen.getByAltText(/A scene from the story/);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mock-image-url.jpg');
  });

  it('loads required sounds on mount', async () => {
    render(
      <ThemeProvider>
        <StoryPage />
      </ThemeProvider>
    );

    expect(audioService.loadSound).toHaveBeenCalledWith('hover', '/sounds/hover.mp3');
    expect(audioService.loadSound).toHaveBeenCalledWith('click', '/sounds/click.mp3');
    expect(audioService.loadSound).toHaveBeenCalledWith('theme', '/sounds/theme-switch.mp3');
  });

  it('generates new scene when choice is selected', async () => {
    render(
      <ThemeProvider>
        <StoryPage />
      </ThemeProvider>
    );

    // Wait for initial scene to load
    await waitFor(() => {
      expect(screen.getByText(/You find yourself in a mysterious cave/)).toBeInTheDocument();
    });

    // Click the first choice
    const choice = screen.getByText(/Explore deeper into the cave/);
    fireEvent.click(choice);

    // Verify audio feedback
    expect(audioService.playButtonClick).toHaveBeenCalled();

    // Verify new scene generation was triggered
    const storyService = StoryGenerationService.getInstance();
    expect(storyService.generateNewScene).toHaveBeenCalledTimes(2); // Once for initial load, once for choice
    expect(storyService.generateNewScene).toHaveBeenLastCalledWith(
      expect.stringContaining("The adventurer explores deeper into the cave")
    );
  });

  it('handles loading states correctly', async () => {
    // Mock a delayed response
    const getInstance = vi.spyOn(StoryGenerationService, 'getInstance');
    getInstance.mockImplementation(() => ({
      generateNewScene: vi.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(() => {
          resolve({
            text: "New scene text",
            choices: [],
            imagePrompt: "New image prompt",
            imageUrl: "new-image-url.jpg"
          });
        }, 100);
      }))
    }));

    render(
      <ThemeProvider>
        <StoryPage />
      </ThemeProvider>
    );

    // Check for loading state
    expect(screen.getByText(/Generating scene image/i)).toBeInTheDocument();

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/New scene text/)).toBeInTheDocument();
    });

    // Clean up
    getInstance.mockRestore();
  });

  it('handles error states gracefully', async () => {
    // Mock an error response
    const getInstance = vi.spyOn(StoryGenerationService, 'getInstance');
    getInstance.mockImplementation(() => ({
      generateNewScene: vi.fn().mockRejectedValue(new Error('Failed to generate scene'))
    }));

    render(
      <ThemeProvider>
        <StoryPage />
      </ThemeProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Failed to load scene image/i)).toBeInTheDocument();
    });

    // Clean up
    getInstance.mockRestore();
  });
}); 