"use strict";
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const path = require('path');
// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });
const app = express();
const port = process.env.PORT || 3001;
// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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
app.get('/', (req, res) => {
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
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// Story generation endpoint
app.post('/api/generate-story', cors(corsOptions), async (req, res) => {
    try {
        const { context } = req.body;
        console.log('Generating story with context:', context);
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a creative story generator for an interactive fantasy adventure. 
          Generate engaging, vivid scenes with meaningful choices that branch the story.
          Format your response as JSON with exactly these fields:
          {
            "text": "The scene description as a string",
            "choices": ["Choice 1 text", "Choice 2 text"],
            "imagePrompt": "Detailed image generation prompt"
          }`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            response_format: { type: "json_object" }
        });
        const response = JSON.parse(completion.choices[0].message.content);
        console.log('Generated story response:', response);
        res.json(response);
    }
    catch (error) {
        console.error('Story generation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate story',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Image generation endpoint
app.post('/api/generate-image', cors(corsOptions), async (req, res) => {
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
    }
    catch (error) {
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
});
export {};
