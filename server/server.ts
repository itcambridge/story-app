import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Verify environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Looking for .env file at:', envPath);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI with explicit API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '' // TypeScript needs this or condition
});

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Story App API Server',
    status: 'running',
    endpoints: {
      generateImage: '/api/generate-image',
      generateStory: '/api/generate-story'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

interface GenerateStoryRequest extends Request {
  body: {
    context: string;
  };
}

interface GenerateImageRequest extends Request {
  body: {
    prompt: string;
    style?: string;
    size?: string;
  };
}

// Story generation endpoint
app.post('/api/generate-story', cors(corsOptions), async (req: GenerateStoryRequest, res: Response) => {
  try {
    const { context } = req.body;
    console.log('Generating story with context:', context);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);

    // Check if this is an image prompt request
    const isImagePrompt = context.includes('Return your response in this exact JSON format');
    
    if (isImagePrompt) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI image prompt generator specialized in creating vivid, focused scene descriptions. Your task is to distill complex scenes into their most striking visual elements. Focus on the main subject, key action, and atmosphere in 10 words or less. Avoid complex descriptions or multiple subjects."
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      try {
        // Parse the JSON response
        const response = JSON.parse(content.trim());
        res.json(response);
      } catch (parseError) {
        console.error('Image prompt parse error:', parseError);
        // If parsing fails, try to extract the prompt from the raw text
        const keyWordsMatch = content.match(/\"keyWords\":\s*\[(.*?)\]/);
        const imagePromptMatch = content.match(/\"imagePrompt\":\s*\"(.*?)\"/);
        
        if (keyWordsMatch && imagePromptMatch) {
          const response = {
            keyWords: JSON.parse(`[${keyWordsMatch[1]}]`),
            imagePrompt: imagePromptMatch[1]
          };
          res.json(response);
        } else {
          throw new Error('Failed to parse image prompt response');
        }
      }
      return;
    }

    // Regular story generation code continues here...
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a creative story generator for an interactive fantasy adventure. 
          Generate engaging, vivid scenes with meaningful choices that branch the story.
          For each choice, include potential consequences and assess its risk level.
          You must respond with valid JSON that exactly matches this format (no additional text):
          {
            "text": "The scene description as a string",
            "choices": [
              {
                "text": "Choice 1 text",
                "consequence": "Brief preview of what might happen",
                "confidence": 75,
                "riskLevel": "low"
              }
            ],
            "imagePrompt": "A concise image prompt (10 words or less) focusing on the most striking visual element and one key atmospheric detail"
          }`
        },
        {
          role: "user",
          content: context
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let response;
    try {
      response = JSON.parse(content.trim());
      
      // Validate response structure
      if (!response.text || !Array.isArray(response.choices) || !response.imagePrompt) {
        throw new Error('Invalid response structure from OpenAI');
      }

      // Validate each choice has required fields
      response.choices.forEach((choice: any, index: number) => {
        if (!choice.text || !choice.consequence || !choice.riskLevel || choice.confidence === undefined) {
          throw new Error(`Invalid choice structure at index ${index}`);
        }
      });
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('Generated story response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Story generation error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate story',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Image generation endpoint
app.post('/api/generate-image', cors(corsOptions), async (req: GenerateImageRequest, res: Response) => {
  try {
    const { prompt, style = 'fantasy', size = 'medium' } = req.body;

    // Add style modifiers to the prompt
    const enhancedPrompt = `${prompt} Style: ${style}, highly detailed, professional quality`;

    const response = await openai.images.generate({
      prompt: enhancedPrompt,
      n: 1,
      size: size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024',
      response_format: 'url',
    });

    res.json({
      status: 'success',
      imageUrl: response.data[0].url
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate image'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}`);
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY
  });
}); 