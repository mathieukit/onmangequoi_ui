import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>On Mange Quoi?</h1>
        <p className="tagline">Your personal recipe manager and meal planner</p>
        
        <div className="features">
          <div className="feature-card">
            <h3>Store Your Recipes</h3>
            <p>Keep all your favorite recipes in one place, organized by meal type.</p>
          </div>
          
          <div className="feature-card">
            <h3>Generate Weekly Menus</h3>
            <p>Plan your meals for the entire week with just one click.</p>
          </div>
          
          <div className="feature-card">
            <h3>Create Grocery Lists</h3>
            <p>Automatically generate shopping lists based on your meal plan.</p>
          </div>
        </div>
        
        <div className="cta-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/recipes" className="btn-primary">
                My Recipes
              </Link>
              <Link to="/weekly-menu" className="btn-secondary">
                Weekly Menu
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn-secondary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="app-description">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Add Your Recipes</h3>
            <p>Start by adding your favorite recipes to your collection.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Generate a Menu</h3>
            <p>Create a balanced weekly menu with a variety of meals.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Your Grocery List</h3>
            <p>Generate a consolidated shopping list for all your planned meals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
