import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal, initScrollReveal } from '../components';
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

// Icons for use cases
const FamilyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002A.274.274 0 0 1 15 13H7ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
  </svg>
);

const MealPrepIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.5 5a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V9a.5.5 0 0 0 1 0V7.5H10a.5.5 0 0 0 0-1H8.5V5z"/>
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
  </svg>
);

const CoupleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
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
    
    document.querySelectorAll('.feature-card, .step, .testimonial-card, .faq-item, .use-case-card').forEach(el => {
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
      {/* Enhanced Hero Section with Background Image */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Stop Asking "What's for Dinner?"</h1>
          <p className="tagline">Transform meal planning from daily stress into effortless organization</p>
          
          <div className="hero-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">⏰</span>
              <span>Save 2+ hours weekly</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🍽️</span>
              <span>Never run out of meal ideas</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📝</span>
              <span>Automated grocery lists</span>
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
                  Start Planning Today
                </Link>
                <Link to="/register" className="btn-secondary">
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Use Cases Section */}
      <div className="use-cases-section">
        <h2>Perfect For Every Lifestyle</h2>
        <div className="use-cases-grid">
          <ScrollReveal delay={100}>
            <div className="use-case-card">
              <div className="use-case-icon">
                <FamilyIcon />
              </div>
              <h3>Busy Families</h3>
              <p>Juggling work, kids, and activities? Plan nutritious family meals in minutes. Create kid-friendly options alongside adult favorites, and never stress about "what's for dinner" again.</p>
              <ul className="use-case-benefits">
                <li>Family-friendly recipe suggestions</li>
                <li>Batch cooking for busy weeknights</li>
                <li>Balanced nutrition for growing kids</li>
              </ul>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="use-case-card">
              <div className="use-case-icon">
                <MealPrepIcon />
              </div>
              <h3>Meal Prep Enthusiasts</h3>
              <p>Take your meal prep game to the next level. Plan weekly batches, calculate exact portions, and organize your prep schedule for maximum efficiency and variety.</p>
              <ul className="use-case-benefits">
                <li>Batch cooking optimization</li>
                <li>Portion control and scaling</li>
                <li>Prep schedule organization</li>
              </ul>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="use-case-card">
              <div className="use-case-icon">
                <CoupleIcon />
              </div>
              <h3>Couples Planning Together</h3>
              <p>Share the mental load of meal planning. Both partners can add recipes, suggest meals, and collaborate on weekly menus that satisfy everyone's tastes and dietary needs.</p>
              <ul className="use-case-benefits">
                <li>Shared recipe collections</li>
                <li>Collaborative menu planning</li>
                <li>Dietary preference management</li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
        
        <div className="workflow-result">
          <div className="result-card">
            <h4>The Result?</h4>
            <p>No more 4pm panic, no more multiple grocery trips, no more "we have nothing to eat" with a full fridge. Just organized, stress-free meals your family will actually eat.</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Features Section */}
      <div className="features">
        <ScrollReveal delay={100}>
          <div className="feature-card">
            <div className="feature-icon">
              <RecipeIcon />
            </div>
            <h3>Your Recipe Collection, Organized</h3>
            <p>Import from websites, scan recipe cards, or add your own. Smart tagging automatically categorizes by cuisine, dietary needs, and cooking time. No more digging through cookbooks or scattered notes.</p>
            <div className="feature-highlight">✨ Import from 500+ recipe websites</div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={200}>
          <div className="feature-card">
            <div className="feature-icon">
              <MenuIcon />
            </div>
            <h3>Smart Menu Planning</h3>
            <p>Our algorithm considers your preferences, dietary restrictions, and what's already in your pantry. Automatically balances nutrition and prevents the same meals from repeating too often.</p>
            <div className="feature-highlight">⚡ Plans a week in under 30 seconds</div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={300}>
          <div className="feature-card">
            <div className="feature-icon">
              <GroceryIcon />
            </div>
            <h3>Intelligent Shopping Lists</h3>
            <p>Consolidates ingredients across all meals, checks your pantry inventory, and organizes by store layout. Share with family members and check off items in real-time.</p>
            <div className="feature-highlight">🛒 Reduces shopping time by 40%</div>
          </div>
        </ScrollReveal>
      </div>
      
      {/* How It Works Section with Enhanced Steps */}
      <div className="app-description">
        <h2>From Chaos to Organized in Minutes</h2>
        <div className="workflow-intro">
          <p>Stop the daily "what's for dinner?" panic. Here's how thousands of families have transformed their meal planning:</p>
        </div>
        <div className="steps">
          <ScrollReveal delay={100}>
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <AddIcon />
              </div>
              <h3>Quick Setup (5 minutes)</h3>
              <p>Add 10-15 go-to recipes you already make. Paste URLs from your favorite food blogs, upload photos of recipe cards, or use our quick-add templates for common meals.</p>
              <div className="step-details">
                <span className="time-badge">⏱️ 5 min setup</span>
                <span className="tip">💡 Start with family favorites</span>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <GenerateIcon />
              </div>
              <h3>Set Your Preferences</h3>
              <p>Tell us about dietary restrictions, how often you want leftovers, which nights you prefer quick meals, and what's already in your pantry. The more we know, the better your suggestions.</p>
              <div className="step-details">
                <span className="time-badge">⏱️ 2 min</span>
                <span className="tip">🎯 Personalized suggestions</span>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <ListIcon />
              </div>
              <h3>Generate & Shop</h3>
              <p>Hit "Plan My Week" and get a complete menu in seconds. Adjust any meals you don't love, then generate your shopping list organized by store sections. Share with your partner and shop together.</p>
              <div className="step-details">
                <span className="time-badge">⏱️ 30 sec</span>
                <span className="tip">🛍️ One organized trip</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      
      {/* Enhanced Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <ScrollReveal delay={100}>
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
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
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
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
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
          </ScrollReveal>
        </div>
      </div>
      
      {/* Improved FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <ScrollReveal delay={100}>
            <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`} onClick={() => toggleFaq(0)}>
              <div className="faq-question">How many recipes can I store?</div>
              <div className="faq-answer">
                <p>You can store an unlimited number of recipes in your collection. The more recipes you have, the more variety our menu generator can provide.</p>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={150}>
            <div className={`faq-item ${activeIndex === 1 ? 'active' : ''}`} onClick={() => toggleFaq(1)}>
              <div className="faq-question">Can I share my recipes with others?</div>
              <div className="faq-answer">
                <p>Currently, recipes are private to your account. We're working on adding sharing functionality in a future update.</p>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className={`faq-item ${activeIndex === 2 ? 'active' : ''}`} onClick={() => toggleFaq(2)}>
              <div className="faq-question">How does the menu generator work?</div>
              <div className="faq-answer">
                <p>Our algorithm creates balanced menus based on your recipe collection, ensuring variety across meal types and avoiding repetition. You can always make adjustments to the suggestions.</p>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={250}>
            <div className={`faq-item ${activeIndex === 3 ? 'active' : ''}`} onClick={() => toggleFaq(3)}>
              <div className="faq-question">Is there a mobile app available?</div>
              <div className="faq-answer">
                <p>We're currently developing mobile apps for iOS and Android. For now, our responsive web app works great on mobile browsers.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Home;
