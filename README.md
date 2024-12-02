# Interactive Story App

An interactive storytelling application that generates dynamic story content and images using AI.

## Features

- Dynamic story generation using OpenAI's GPT-4
- Interactive choices that affect story progression
- AI-generated images for story scenes
- Real-time story state management
- Modern, responsive UI

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- OpenAI API key

## Setup

1. Clone the repository:

```bash
git clone <your-repository-url>
cd story-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
PORT=3001
```

4. Start the development server:

```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start the backend
npm run server
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/pages` - Page components
  - `/services` - API and utility services
  - `/types` - TypeScript type definitions
- `/server` - Backend Express server
  - `/src` - Server source code
  - `/build` - Compiled server code

## Development

- Frontend: React with TypeScript
- Backend: Node.js with Express
- State Management: React Context
- Styling: CSS Modules
- API: OpenAI GPT-4 and DALL-E

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
