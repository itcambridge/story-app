import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../context/ThemeContext';
import { audioService } from '../services/audioService';

// Mock audioService
vi.mock('../services/audioService', () => ({
  audioService: {
    loadSound: vi.fn(),
    playThemeSwitch: vi.fn(),
  },
}));

describe('ThemeToggle', () => {
  it('renders with initial light theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
    expect(button.textContent).toBe('🌙');
  });

  it('toggles theme when clicked', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    
    // Initial state (light theme)
    expect(button.textContent).toBe('🌙');
    
    // Click to toggle to dark theme
    fireEvent.click(button);
    expect(button.textContent).toBe('☀️');
    expect(button).toHaveAttribute('title', 'Switch to light mode');
    
    // Click to toggle back to light theme
    fireEvent.click(button);
    expect(button.textContent).toBe('🌙');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('plays sound effect when toggling theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(audioService.playThemeSwitch).toHaveBeenCalled();
  });

  it('loads theme sound on mount', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    expect(audioService.loadSound).toHaveBeenCalledWith('theme', '/sounds/theme-switch.mp3');
  });
}); 