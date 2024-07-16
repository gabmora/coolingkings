import React from 'react';
import './FrontPage.css';
import hvacImage from './images/HVAC-system.jpg'; // Import the local image

function FrontPage() {
  console.log('FrontPage component rendered');
  return (
    <>
      <div className="hero-section" style={{ backgroundImage: `url(${hvacImage})` }}>
        <div className="hero-content">
          <h1 className="hero-title">Heating & Cooling Services</h1>
          <h2 className="hero-subtitle">K&E Heating and Cooling </h2>
          <p className="hero-description">
            Your one-stop company for all of your home maintenance needs in Bergen County. We make every effort to provide our customers with quick turnarounds, personalized solutions, and a worry-free experience.
          </p>
          <div className="hero-buttons">
            <button className="hero-button">FREE Estimate</button>
            <button className="hero-button">About K&E HVAC</button>
          </div>
        </div>
      </div>

      <div className="FrontPage-container">
        <section className="intro-block">
          <h1 className="FrontPage-title">Welcome to K&E HVAC</h1>
          <h2 className="FrontPage-subtitle">HEATING AND COOLING SERVICE IN THE LOW COUNTRY</h2>
          <h3 className="FrontPage-content">
            At K&E HVAC, we specialize in delivering premium HVAC services designed to create the perfect indoor environment for your home or business. With a commitment to excellence and customer satisfaction, we offer a comprehensive range of heating, ventilation, and air conditioning solutions.
          </h3>
        </section>
      </div>

      <div className="FrontPage-container">
        <div className="info-container">
          <h2>Reach Out to a Trusted Home Expert in Bluffton</h2>
          <p>At K&E HVAC, we understand how hard it can be to deal with cooling and A/C issues, especially in sweltering summer temperatures. In extreme cases, a faulty A/C system can threaten your family’s health and safety. That’s why our home expert team is committed to being your one-stop shop for all of your HVAC and cooling needs.</p>
          <p>Our friendly professionals offer expert cooling services to homeowners and business owners in the Low Country and surrounding areas, including installation, repair, maintenance, and replacement for all types of cooling systems. We’ll work quickly to diagnose the issues you’re facing so you can get back to enjoying comfortable temperatures in your home or office—without worrying about ridiculous energy bills or costly replacements.</p>
          <p>At K&E HVAC, your comfort and safety are our top priorities. Contact us online to request a quote or schedule a service for your cooling needs.</p>
        </div>
      </div>
    </>
  );
}

export default FrontPage;
