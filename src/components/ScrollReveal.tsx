/**
 * ScrollReveal Component
 * Handles revealing elements as they scroll into view
 */
import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Global intersection observer for general page elements
export const initScrollReveal = (): void => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });
  
  // Target all elements with the reveal-on-scroll class that are not managed by the component
  document.querySelectorAll('.reveal-on-scroll:not([data-managed="true"])').forEach(el => {
    observer.observe(el);
  });
};

// ScrollReveal component with ref
const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className = "", delay = 0 }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Skip if no ref
    if (!elementRef.current) return;
    
    // Mark as managed to avoid double observers
    elementRef.current.setAttribute('data-managed', 'true');
    
    // Add the delay as a style if provided
    if (delay > 0) {
      elementRef.current.style.transitionDelay = `${delay}ms`;
    }
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    
    // Observe the current element
    observer.observe(elementRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={elementRef} className={`reveal-on-scroll ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
