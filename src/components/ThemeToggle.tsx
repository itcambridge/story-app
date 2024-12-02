import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { audioService } from '../services/audioService';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Load theme switch sound
    audioService.loadSound('theme', '/sounds/theme-switch.mp3');
  }, []);

  const handleThemeToggle = () => {
    audioService.playThemeSwitch();
    toggleTheme();
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleThemeToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}; 