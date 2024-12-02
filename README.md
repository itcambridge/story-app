# Interactive Story Adventure

An AI-powered interactive story game that generates dynamic narratives with choices, images, and sound effects.

## Features

- Dynamic story generation using OpenAI's GPT-4
- AI-generated images for each scene
- Interactive choices with risk levels
- Journey log and location tracking
- Dark/Light theme support
- Sound effects and audio feedback
- Story branching with memory system
- Scene caching for improved performance

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- AI: OpenAI GPT-4 for story generation
- Styling: CSS with CSS Variables for theming
- State Management: React Hooks

## Getting Started

1. Clone the repository:

```bash
git clone [your-repository-url]
cd story-app
```

2. Install dependencies:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Create environment files:

Create `.env` in the server directory:

```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the development servers:

```bash
# Start the backend server (in server directory)
npm run dev

# Start the frontend (in root directory)
npm run dev
```

5. Open http://localhost:5173 in your browser

## Project Structure

```
story-app/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── services/          # API and utility services
│   ├── styles/            # CSS styles
│   └── types/             # TypeScript type definitions
├── server/                # Backend server code
│   ├── src/              # Server source code
│   └── test/             # Server tests
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
