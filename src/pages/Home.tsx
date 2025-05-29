import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScrollReveal, { initScrollReveal } from '../components/ScrollReveal';
import './Home.css'; // Import our new CSS file

// Icons for features and steps
const RecipeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v2A1.5 1.5 0 0 0 1.5 5h8A1.5 1.5 0 0 0 11 3.5v-2A1.5 1.5 0 0 0 9.5 0h-8zm5.927 2.427A.25.25 0 0 1 7.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0l-.396-.396zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2H1zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2h14zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
    <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
  </svg>
);

const GroceryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
  </svg>
);

const GenerateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

// Avatar images for testimonials
const avatars = {
  sophie: "https://randomuser.me/api/portraits/women/32.jpg",
  marco: "https://randomuser.me/api/portraits/men/45.jpg",
  amelia: "https://randomuser.me/api/portraits/women/65.jpg"
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Animation effect on scroll
  useEffect(() => {
    // Initialize the scroll reveal system
    initScrollReveal();
    
    // Legacy animation effect for existing components
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card, .step, .testimonial-card, .faq-item').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Handle FAQ clicks
  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="home-container">
      {/* Hero Section with Background Image */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>On Mange Quoi?</h1>
          <p className="tagline">Your personal recipe manager and meal planner</p>
          
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
      </div>
      
      {/* Enhanced Features Section */}
      <ScrollReveal>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <RecipeIcon />
            </div>
            <h3>Store Your Recipes</h3>
            <p>Keep all your favorite recipes in one place, organized by meal type. Add detailed ingredients, instructions, and categorize by breakfast, lunch, or dinner.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <MenuIcon />
            </div>
            <h3>Generate Weekly Menus</h3>
            <p>Plan your meals for the entire week with just one click. Customize serving sizes, swap recipes, and create the perfect balanced menu for your household.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <GroceryIcon />
            </div>
            <h3>Create Grocery Lists</h3>
            <p>Automatically generate shopping lists based on your meal plan. Ingredients are sorted by category so you can efficiently navigate the store and never miss an item.</p>
          </div>
        </div>
      </ScrollReveal>
      
      {/* How It Works Section with Enhanced Steps */}
      <div className="app-description">
        <h2>How It Works</h2>
        <ScrollReveal>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <AddIcon />
              </div>
              <h3>Add Your Recipes</h3>
              <p>Start by adding your favorite recipes to your collection. Include ingredients, quantities, and instructions to keep everything organized.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <GenerateIcon />
              </div>
              <h3>Generate a Menu</h3>
              <p>Create a balanced weekly menu with a variety of meals. Select dates, number of people, and let the app suggest combinations or customize your own.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <ListIcon />
              </div>
              <h3>Get Your Grocery List</h3>
              <p>Generate a consolidated shopping list for all your planned meals. Print it, check items off as you shop, and never forget an ingredient again.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
      
      {/* Enhanced Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <ScrollReveal>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <img src={avatars.sophie} alt="Sophie L." className="testimonial-avatar" />
                <div>
                  <div className="testimonial-author">Sophie L.</div>
                </div>
              </div>
              <div className="testimonial-content">
                <p>This app has completely transformed how I plan meals for my family. I save so much time and we eat much better now!</p>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-header">
                <img src={avatars.marco} alt="Marco T." className="testimonial-avatar" />
                <div>
                  <div className="testimonial-author">Marco T.</div>
                </div>
              </div>
              <div className="testimonial-content">
                <p>The grocery list feature alone has saved me countless trips to the store. Everything is so well organized!</p>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-header">
                <img src={avatars.amelia} alt="Amelia R." className="testimonial-avatar" />
                <div>
                  <div className="testimonial-author">Amelia R.</div>
                </div>
              </div>
              <div className="testimonial-content">
                <p>I've tried many meal planning apps and this is by far the most intuitive and helpful one I've found.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
      
      {/* Improved FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <ScrollReveal>
          <div className="faq-list">
            <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`} onClick={() => toggleFaq(0)}>
              <div className="faq-question">How many recipes can I store?</div>
              <div className="faq-answer">
                <p>You can store an unlimited number of recipes in your collection. The more recipes you have, the more variety our menu generator can provide.</p>
              </div>
            </div>
            
            <div className={`faq-item ${activeIndex === 1 ? 'active' : ''}`} onClick={() => toggleFaq(1)}>
              <div className="faq-question">Can I share my recipes with others?</div>
              <div className="faq-answer">
                <p>Currently, recipes are private to your account. We're working on adding sharing functionality in a future update.</p>
              </div>
            </div>
            
            <div className={`faq-item ${activeIndex === 2 ? 'active' : ''}`} onClick={() => toggleFaq(2)}>
              <div className="faq-question">How does the menu generator work?</div>
              <div className="faq-answer">
                <p>Our algorithm creates balanced menus based on your recipe collection, ensuring variety across meal types and avoiding repetition. You can always make adjustments to the suggestions.</p>
              </div>
            </div>
            
            <div className={`faq-item ${activeIndex === 3 ? 'active' : ''}`} onClick={() => toggleFaq(3)}>
              <div className="faq-question">Is there a mobile app available?</div>
              <div className="faq-answer">
                <p>We're currently developing mobile apps for iOS and Android. For now, our responsive web app works great on mobile browsers.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Home;
