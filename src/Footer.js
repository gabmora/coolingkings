// Footer.js

import React from 'react';
import './Footer.css'; 

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="contactRow">
          <div className="ContactInfo-phone">
            <p>Get in Touch</p>
            <h2>Email: <a href="mailto:info@knehvac.com">info@knehvac.com</a></h2>
            <h2>Phone: <a href="tel:(312) 961-4664">(312) 961-4664</a></h2>
            <p>Assitance Hours: </p>      
            <h2>Mon-Sat: 9AM-6PM</h2>  
            <h2>Sun: 10AM-5PM</h2>  
          </div>
     
          <div className="ContactInfo-chatnow">
                <iframe className="frontpageimage"src="https://www.google.com/maps/d/embed?mid=10rgyoD9J5jcrE1fHftglIfIldKIYpBs&ehbc=2E312F&noprof=1"></iframe>
          </div>
        </div> 
      </div>
          <p className='copyright'>&copy; 2024 K&E HVAC. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
