import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at', envPath);
  process.exit(1);
}

// Load environment variables
dotenv.config({ path: envPath });

// Check required variables
const requiredVars = ['OPENAI_API_KEY'];
const missing = requiredVars.filter(name => !process.env[name]);

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  console.error('Please check your .env file at:', envPath);
  process.exit(1);
}

console.log('Environment check passed!');
console.log('Found .env file at:', envPath);
console.log('Required variables present:', requiredVars);
process.exit(0); 