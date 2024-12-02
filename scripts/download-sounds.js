import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOUNDS_DIR = join(__dirname, '../public/sounds');

// Create a simple beep sound using Web Audio API
async function createBeepSound(frequency = 440, duration = 0.1, volume = 0.1) {
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const buffer = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    buffer[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * volume;
  }
  
  // Convert to 16-bit PCM
  const pcm = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    pcm[i] = buffer[i] * 0x7FFF;
  }
  
  // Create WAV header
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // "RIFF" chunk descriptor
  view.setUint32(0, 0x46464952, true);
  view.setUint32(4, 36 + pcm.length * 2, true);
  view.setUint32(8, 0x45564157, true);
  
  // "fmt " sub-chunk
  view.setUint32(12, 0x20746D66, true);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  
  // "data" sub-chunk
  view.setUint32(36, 0x61746164, true);
  view.setUint32(40, pcm.length * 2, true);
  
  // Combine header and PCM data
  const blob = new Uint8Array(header.byteLength + pcm.length * 2);
  blob.set(new Uint8Array(header), 0);
  blob.set(new Uint8Array(pcm.buffer), header.byteLength);
  
  return blob;
}

async function main() {
  try {
    // Create sounds directory if it doesn't exist
    await fs.mkdir(SOUNDS_DIR, { recursive: true });
    
    // Create different beep sounds for different actions
    const sounds = {
      'hover.mp3': await createBeepSound(880, 0.05, 0.05),
      'click.mp3': await createBeepSound(440, 0.1, 0.1),
      'success.mp3': await createBeepSound(880, 0.15, 0.1),
      'error.mp3': await createBeepSound(220, 0.2, 0.1),
      'theme-switch.mp3': await createBeepSound(660, 0.1, 0.1),
      'ambient.mp3': await createBeepSound(440, 0.3, 0.05),
      'accept.mp3': await createBeepSound(880, 0.1, 0.1),
      'reject.mp3': await createBeepSound(220, 0.15, 0.1)
    };
    
    // Save all sound files
    for (const [filename, data] of Object.entries(sounds)) {
      const filepath = join(SOUNDS_DIR, filename);
      console.log(`Creating ${filename}...`);
      await fs.writeFile(filepath, data);
      console.log(`Created ${filename}`);
    }
    
    console.log('All sound files created successfully!');
  } catch (error) {
    console.error('Error creating sound files:', error);
    process.exit(1);
  }
}

main(); 