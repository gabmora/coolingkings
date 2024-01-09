// src/components/ACInfo.js

import React from 'react';
import './AC.css'; // Import your CSS
import acImage from './images/HVAC-system.jpg'; // Import your AC image

function AC() {
  return (
    <div className="ACInfo-container">
      <section className="ACInfo-introduction">
      <section className="ACInfo-image">
        <img src={acImage} alt="AC System" />
        <p>Our advanced AC systems ensure reliable and efficient cooling.</p>
      </section>

      <section className="ACInfo-cta">
        <h2>Ready to Upgrade Your Comfort?</h2>
        <h3>Contact us today to explore our AC solutions and enhance your indoor environment.</h3>
        {/* Add a button or link for the CTA */}
      </section>
        <h1>AC Solutions</h1>
        <p>24/7 AC repair in the Low Country area. Flat rates and comprehensive warranties.</p>
      </section>

      <section className="ACInfo-benefits">
        <h2>We Repair All Air Conditioner Brands</h2>
        <h3>Servies Include:</h3>
        <ul>
          <li>Efficient cooling for your home or business</li>
          <li>Improved airflow and air quality</li>
          <li>Energy-efficient options</li>
          <li>Repairing ACs that aren’t cooling</li>
          <li>Fixing refrigerant leaks</li>
          <li>Fixing power issues to the unit</li>
          <li>Repairing frozen units</li>
          <li>Cleaning out old, damaged filters</li>
          <li>Installing new, high efficiency filters</li>
          <li>Cleaning condenser coils</li>
          <li>Electrical and breaker issues</li>
          <li>Comprehensive HVAC diagnostics</li>
        </ul>
      </section>

      <section className="ACInfo-types">
        {/* <h2>Types of AC Systems</h2> */}
        <div className="ACInfo-type">
          <h3>Central AC</h3>
          <h4>Efficiently cools the entire home using a centralized system.</h4>
        </div>
        <div className="ACInfo-type">
          <h3>Split AC</h3>
          <h4>Allows for cooling individual rooms or zones.</h4>
        </div>
        <div className="ACInfo-type">
          <h3>Window Units</h3>
          <h4>Perfect for cooling single rooms and easy to install.</h4>
        </div>
      </section>

      {/* Add more sections for installation, maintenance, energy efficiency, etc. */}

    </div>
  );
}

export default AC;
