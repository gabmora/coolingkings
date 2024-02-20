// Footer.js

import React from 'react';
import ContactInfo from './components/ContactInfo';
import './Footer.css'; 

function Footer() {
  return (
    <footer>
      <div className="container">
        <ContactInfo/>
        <p>&copy; 2024 K&E HVAC. All rights reserved.</p>
      </div> 
    </footer>
  );
}

export default Footer;
