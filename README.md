# Interactive Story App

An AI-powered interactive story application that generates dynamic narratives with choices, images, and sound effects.

## Features

- Dynamic story generation using OpenAI's GPT-4
- Image generation for each scene
- Interactive choices with risk levels
- Dark/Light theme support
- Sound effects and audio feedback
- Responsive design

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- OpenAI API key

## Setup

1. Clone the repository:

```bash
git clone [your-repository-url]
cd story-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
# In one terminal, start the frontend
npm run dev

# In another terminal, start the backend
npm run server
```

5. Open http://localhost:5173 in your browser

## Development

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- API: OpenAI GPT-4 for story generation
- Styling: CSS with theme support

## Project Structure

```
story-app/
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── context/         # React context providers
│   ├── services/        # API and utility services
│   ├── styles/          # CSS styles
│   └── types/           # TypeScript type definitions
├── server/              # Backend source code
│   ├── src/             # Server source files
│   └── build/           # Compiled server files
├── public/              # Static assets
└── package.json         # Project dependencies
```

## Available Scripts

- `npm run dev`: Start frontend development server
- `npm run build`: Build frontend for production
- `npm run server`: Start backend server
- `npm run server:build`: Build backend server
- `npm run server:start`: Start backend server only

## Environment Variables

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_api_key_here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
