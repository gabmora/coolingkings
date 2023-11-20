// Footer.js

import React from 'react';
import './Header.css'; // Import the CSS file
import ContactInfo from './components/ContactInfo';

function Footer() {
  return (
    <footer>
      <div className="container">
        <ContactInfo/>
        <p>&copy; 2023 Cooling Kings HVAC. All rights reserved.</p>
      </div> 
    </footer>
  );
}

export default Footer;
