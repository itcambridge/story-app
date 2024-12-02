import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGES_DIR = join(__dirname, '../public/images');

const IMAGES = {
  'cave-entrance.jpg': 'https://raw.githubusercontent.com/cursor-ai/story-assets/main/cave-entrance.jpg'
};

async function downloadImage(url, path) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(path, Buffer.from(buffer));
    console.log(`Downloaded ${path}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Create images directory if it doesn't exist
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Download all images
    const downloads = Object.entries(IMAGES).map(async ([filename, url]) => {
      const filepath = join(IMAGES_DIR, filename);
      console.log(`Downloading ${filename}...`);
      await downloadImage(url, filepath);
    });

    await Promise.all(downloads);
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
    process.exit(1);
  }
}

main(); 