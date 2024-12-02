import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoryPage } from './pages/StoryPage';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/story" replace />} />
        <Route path="/story" element={<StoryPage />} />
      </Routes>
    </div>
  );
};

export default App;
