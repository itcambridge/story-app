import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Server API Tests', () => {
  // Reset request count before each test
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('Story Generation', () => {
    it('should handle story generation request', async () => {
      const response = await request(app)
        .post('/api/generate-story')
        .send({
          context: 'Start a new story in a magical forest'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('choices');
      expect(response.body).toHaveProperty('imagePrompt');
      
      if (response.body.choices.length > 0) {
        const firstChoice = response.body.choices[0];
        expect(firstChoice).toHaveProperty('text');
        expect(firstChoice).toHaveProperty('consequence');
        expect(firstChoice).toHaveProperty('confidence');
        expect(firstChoice).toHaveProperty('riskLevel');
      }
    });

    it('should handle OpenAI API errors', async () => {
      const response = await request(app)
        .post('/api/generate-story')
        .send({
          context: 'trigger_error'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/generate-story')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed OpenAI response', async () => {
      const response = await request(app)
        .post('/api/generate-story')
        .send({
          context: 'malformed_response'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Image Generation', () => {
    it('should handle image generation request', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .send({
          prompt: 'A magical forest with glowing mushrooms',
          style: 'fantasy',
          size: 'small'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('imageUrl');
    });

    it('should handle image generation errors', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .send({
          prompt: 'trigger_error'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate image generation request', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting', async () => {
      // Make multiple requests to trigger rate limit
      const requests = Array(101).fill(null).map(() => 
        request(app)
          .post('/api/generate-story')
          .send({ context: 'test' })
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toHaveProperty('error', 'Rate limit exceeded');
    });
  });
}); 