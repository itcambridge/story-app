import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Your Story Awaits</h1>
        <p className="tagline">Every choice shapes your destiny</p>
      </div>
      
      <div className="features">
        <div className="feature">
          <h3>🌟 Interactive Adventures</h3>
          <p>Immerse yourself in stories where your choices matter</p>
        </div>
        <div className="feature">
          <h3>🎭 Multiple Paths</h3>
          <p>Every decision leads to a unique journey</p>
        </div>
        <div className="feature">
          <h3>✨ Rich Narratives</h3>
          <p>Discover beautifully crafted worlds and characters</p>
        </div>
      </div>

      <div className="cta-section">
        <Link to="/story" className="cta-button">Begin Your Journey</Link>
      </div>
    </div>
  );
};

export default Home; 