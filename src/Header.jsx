import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/coolingkings.png';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  
  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenu && !event.target.closest('.mobile-menu') && !event.target.closest('.menu-button')) {
        setMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenu]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenu(false);
    }
  };

  return (
    
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo-container">
          <img src={logo} alt="K&E HVAC" className="logo-image" />
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="menu-button" 
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenu ? 'active' : ''}`}></span>
        </button>
        
        {/* Desktop Navigation */}
        <nav className={`desktop-nav ${mobileMenu ? 'hidden' : ''}`}>
          <button
            className="nav-link nav-button"
            onClick={() => scrollToSection('services')}
          >
            Services
          </button>

          <button
            className="nav-link nav-button"
            onClick={() => scrollToSection('maintenance-plans')}
          >
            Maintenance Plans
          </button>

          <button
            className="nav-link nav-button"
            onClick={() => scrollToSection('about')}
          >
            About
          </button>

          <button
            className="nav-link nav-cta"
            onClick={() => scrollToSection('contact')}
          >
            Get Estimate
          </button>
        </nav>
        
        {/* Mobile Navigation */}
        <div className={`mobile-menu ${mobileMenu ? 'active' : ''}`}>
          <div className="mobile-menu-container">
            <button
              className="mobile-menu-item"
              onClick={() => scrollToSection('services')}
            >
              Services
            </button>
            <button
              className="mobile-menu-item"
              onClick={() => scrollToSection('maintenance-plans')}
            >
              Maintenance Plans
            </button>
            <button
              className="mobile-menu-item"
              onClick={() => scrollToSection('about')}
            >
              About
            </button>
            <button
              className="mobile-menu-item mobile-cta"
              onClick={() => scrollToSection('contact')}
            >
              Get Estimate
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;