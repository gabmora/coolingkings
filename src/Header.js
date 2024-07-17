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
                <Link to="/MaintenancePlan" className="nav-link">Maintenance Plans</Link>
                <Link to="/AC" className="nav-link">Cooling</Link>
                <Link to="/AC" className="nav-link">Heating</Link>
              </div>
            )}
          </div>
          <Link to="/BookingPage" className="nav-link">
            <button className="dropbtn">Contact Us</button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
