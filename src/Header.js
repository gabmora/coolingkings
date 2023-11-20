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
      {/* <div className="header-title">Cooling Kings HVAC</div> */}
      <nav className="header-nav">
        <Link to="/BookingPage" className="nav-link">Book an Appointment</Link>
        <Link to="/AboutUs" className="nav-link">About Us</Link>
      </nav>
    </header>
  );
}

export default Header;
