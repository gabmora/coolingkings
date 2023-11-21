import React from 'react';
import { Link } from 'react-router-dom';
import logo from './coolingkings.png'; 
import './Header.css'; 
function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo-link"> {/* Link to the home page */}
        <div className="header-logo">
          <img src={logo} alt="logo" />
        </div>
      </Link>
      <nav className="header-nav">
        <Link to="/AC" className="nav-link">AIR CONDITIONER</Link>
        <Link to="/Heating" className="nav-link">HEATING</Link>
        <Link to="/BookingPage" className="nav-link">REQUEST A SERVICE</Link>
        
      </nav>
    </header>
  );
}

export default Header;
