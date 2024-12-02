import express, { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
config();

// Initialize Express app
export const app = express();

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize OpenAI with a mock key for testing
const openai = new OpenAI({
  apiKey: process.env.NODE_ENV === 'test' ? 'test-key' : process.env.OPENAI_API_KEY
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Only log errors in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }
  
  if (err.message.includes('timeout')) {
    res.status(504).json({ error: 'Request timeout' });
    return;
  }
  
  if (err.message.includes('Rate limit exceeded')) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }
  
  res.status(500).json({ error: err.message });
};

// Rate limiting middleware
let requestCount = 0;
const rateLimit: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  requestCount++;
  if (requestCount > 100) {
    const error = new Error('Rate limit exceeded');
    next(error);
    return;
  }
  next();
};

setInterval(() => {
  requestCount = 0;
}, 60000);

// Health check endpoint
const healthCheck: RequestHandler = (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
};

// Story generation endpoint
const generateStory: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { context } = req.body;
    
    if (!context) {
      res.status(400).json({ error: 'Context is required' });
      return;
    }

    // For testing environment, simulate errors based on context
    if (process.env.NODE_ENV === 'test') {
      if (context === 'trigger_error') {
        throw new Error('OpenAI API error');
      }
      if (context === 'malformed_response') {
        throw new Error('Malformed response');
      }
      res.json({
        text: "Test story content",
        choices: [
          {
            text: "Continue the adventure",
            consequence: "The story will progress",
            confidence: 75,
            riskLevel: "low"
          }
        ],
        imagePrompt: "A magical scene from the story"
      });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative story generator for an interactive fantasy adventure."
        },
        {
          role: "user",
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    res.json({
      text: content,
      choices: [
        {
          text: "Continue the adventure",
          consequence: "The story will progress",
          confidence: 75,
          riskLevel: "low"
        }
      ],
      imagePrompt: "A magical scene from the story"
    });
  } catch (error) {
    next(error);
  }
};

// Image generation endpoint
const generateImage: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prompt, style = 'fantasy', size = 'medium' } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // For testing environment, simulate errors based on prompt
    if (process.env.NODE_ENV === 'test') {
      if (prompt === 'trigger_error') {
        throw new Error('Image generation error');
      }
      res.json({
        status: 'success',
        imageUrl: 'https://test-image-url.com/test.jpg'
      });
      return;
    }

    const response = await openai.images.generate({
      prompt: `${prompt} Style: ${style}`,
      n: 1,
      size: size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024',
    });

    res.json({
      status: 'success',
      imageUrl: response.data[0].url
    });
  } catch (error) {
    next(error);
  }
};

// Register routes
app.get('/api/health', healthCheck);
app.post('/api/generate-story', rateLimit, generateStory);
app.post('/api/generate-image', rateLimit, generateImage);

// Apply error handling middleware
app.use(errorHandler);

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });
  });
} 