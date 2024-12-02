import { afterEach, beforeEach } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Set up test environment variables
process.env.OPENAI_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

// Clean up after each test
afterEach(() => {
  // Clean up any test data or mocks
});

// Set up before each test
beforeEach(() => {
  // Set up any required test state
}); 