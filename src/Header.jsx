import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/coolingkings.png';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.nav-dropdown')) {
        setIsOpen(false);
      }
      if (mobileMenu && !event.target.closest('.mobile-menu') && !event.target.closest('.menu-button')) {
        setMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mobileMenu]);

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
          <div className="nav-dropdown">
            <button 
              className="nav-button" 
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              Services
              <svg 
                className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} 
                width="10" 
                height="6" 
                viewBox="0 0 10 6" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            {isOpen && (
              <div className="dropdown-menu">
                <Link to="/MaintenancePlan" className="dropdown-item">Maintenance Plans</Link>
                <Link to="/AC" className="dropdown-item">Cooling</Link>
                <Link to="/Heating" className="dropdown-item">Heating</Link>
              </div>
            )}
          </div>
          
          <Link to="/AboutUs" className="nav-link">About Us</Link>
          
          <Link to="/BookingPage" className="nav-link nav-cta">
            Contact Us
          </Link>
        </nav>
        
        {/* Mobile Navigation */}
        <div className={`mobile-menu ${mobileMenu ? 'active' : ''}`}>
          <div className="mobile-menu-container">
            <div className="mobile-menu-item">
              <button 
                className="mobile-dropdown-button"
                onClick={() => setIsOpen(!isOpen)}
              >
                Services
                <svg 
                  className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} 
                  width="10" 
                  height="6" 
                  viewBox="0 0 10 6" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              {isOpen && (
                <div className="mobile-dropdown">
                  <Link 
                    to="/MaintenancePlan" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenu(false)}
                  >
                    Maintenance Plans
                  </Link>
                  <Link 
                    to="/AC" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenu(false)}
                  >
                    Cooling
                  </Link>
                  <Link 
                    to="/Heating" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenu(false)}
                  >
                    Heating
                  </Link>
                </div>
              )}
            </div>
            <Link 
              to="/AboutUs" 
              className="mobile-menu-item"
              onClick={() => setMobileMenu(false)}
            >
              About Us
            </Link>
            <Link 
              to="/BookingPage" 
              className="mobile-menu-item mobile-cta"
              onClick={() => setMobileMenu(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;