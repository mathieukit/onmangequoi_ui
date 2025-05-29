/**
 * ScrollReveal Component
 * Handles revealing elements as they scroll into view
 */
import React, { ReactNode, useEffect } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

// Initialize the observer when the component mounts
export const initScrollReveal = (): void => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });
  
  // Target all elements with the reveal-on-scroll class
  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
};

// ScrollReveal component
const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className = "" }) => {
  useEffect(() => {
    // Initialize a single element observer for this specific component
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`reveal-on-scroll ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
