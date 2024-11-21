import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">WasteWise</div>
        <ul className="navbar-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/about" className="nav-link">About</Link></li>
          <li><Link to="/contact" className="nav-link">Contact</Link></li>
        </ul>
      </nav>

      <div className="homepage-container">
        <h1>Welcome to Our Website!</h1>
        <div className="options">
          <Link to="/signin" className="button">User</Link>
          <Link to="/collector-signin" className="button">Collector</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
