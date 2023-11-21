// src/components/FrontPage.js

import React from 'react';
// import logo from 'src/components/images/coolingkings.png';
import './FrontPage.css'; // Import your CSS



function FrontPage() {
  console.log('FrontPage component rendered');
  return (
    <div className="FrontPage-container">
     
        <h1 className='FrontPage-title'>Welcome to Cooling Kings HVAC</h1>
        <h2 className='FrontPage-subtitle'>HEATING AND COOLING SERVICE IN THE LOW COUNTRY</h2>
        <p className='FrontPage-content'>At Cooling Kings, we specialize in delivering premium HVAC services designed to create the perfect indoor environment for your home or business. With a commitment to excellence and customer satisfaction, we offer a comprehensive range of heating, ventilation, and air conditioning solutions.</p>

        {/* <button className="FrontPage-button">Learn More</button> */}
     
      
    </div>
  );
}

export default FrontPage;
