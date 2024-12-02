import { audioService } from './audioService';

// Sound file paths
const SOUND_FILES = {
  hover: '/sounds/hover.mp3',
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  theme: '/sounds/theme-switch.mp3',
  ambient: '/sounds/ambient.mp3',
  accept: '/sounds/accept.mp3',
  reject: '/sounds/reject.mp3'
};

// Sound descriptions for attribution
export const SOUND_CREDITS = {
  hover: 'Soft click sound',
  click: 'UI click feedback',
  success: 'Success completion sound',
  error: 'Error alert sound',
  theme: 'Theme switch sound',
  ambient: 'Cave ambiance',
  accept: 'Choice acceptance sound',
  reject: 'Choice rejection sound'
};

export async function loadAllSounds() {
  console.log('Loading sound effects...');
  
  const loadPromises = Object.entries(SOUND_FILES).map(([name, path]) => {
    return audioService.loadSound(name, path)
      .catch(error => {
        console.warn(`Failed to load sound: ${name}`, error);
        return null;
      });
  });

  try {
    await Promise.all(loadPromises);
    console.log('All sounds loaded successfully');
  } catch (error) {
    console.error('Error loading sounds:', error);
  }
}

// Initialize sounds when the module loads
loadAllSounds(); 