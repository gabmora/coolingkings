import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from './coolingkings.png'; 
import './Header.css'; 

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (

  //   {/* Navbar */}
  //   <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: 'linear-gradient(to right, #07689f, #ecda8e)', padding: '15px 0' }}>
  //   <div className="container">
  //     <div>
  //       <a className="navbar-brand" href="#" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', fontWeight: 'bold', color: '#ffffff' }}>
  //         Your Company Name
  //         <i className="fas fa-home" style={{ marginLeft: '5px' }} />
  //       </a>
  //       <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: '#ecda8e', marginTop: '-10px', textAlign: 'center' }}>Your Slogan Here</div>
  //     </div>
  //     {/* Navbar toggler and menu */}
  //   </div>
  // </nav>


    <header className="header">
      <Link to="/" className="logo-link">
        <div className="header-logo">
          <img src={logo} alt="logo" />
        </div>
      </Link>
      <nav className="header-nav">
        <div className="dropdown">
          {/* <button className="dropbtn" onClick={toggleDropdown}>Services</button> */}
          {isDropdownOpen && (
            <div className="dropdown-content">
              <Link to="/AC" className="nav-link">AC</Link>
              <Link to="/Heating" className="nav-link">Heating</Link>
            </div>
          )}
        </div>
          <Link to="/BookingPage" className="nav-link">Contact Us</Link>
      </nav>
    </header>
  );
}

export default Header;
