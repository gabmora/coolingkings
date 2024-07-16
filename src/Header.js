import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/coolingkings.png';
import './Header.css';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="header-logo">
            <img src={logo} alt="logo" />
          </div>
        </Link>
        <nav className="header-nav">
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleDropdown}>Services</button>
            {isDropdownOpen && (
              <div className="dropdown-content">
                <Link to="/AC" className="nav-link">AC</Link>
                <Link to="/MaintenancePlan" className="nav-link">Maintenance Plan</Link>
              </div>
            )}
          </div>
          <Link to="/BookingPage" className="nav-link">Contact Us</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
