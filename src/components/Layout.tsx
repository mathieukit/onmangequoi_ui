import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} On Mange Quoi? - Your personal recipe manager and meal planner</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
