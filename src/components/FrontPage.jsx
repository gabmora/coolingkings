import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FrontPage.css';
import hvacImage from './images/HVAC-system.jpg';

const FrontPage = () => {
  const navigate = useNavigate();
  
  const goToEstimatePage = () => {
    navigate('/estimate');
  };

  const goToAboutPage = () => {
    navigate('/MaintenancePlan');
  };
  
 return (
  <>
    {/* Hero Section - Full width background */}
    <section 
      className="hero" 
      style={{ backgroundImage: `url(${hvacImage})` }}
    >
      <div className="hero__overlay"></div>
      <div className="hero__content">
        <h1 className="hero__title">Heating & Cooling Services</h1>
        <h2 className="hero__subtitle">K&E Heating and Cooling</h2>
        <p className="hero__description">
          Your one-stop company for all of your home maintenance needs in the Low County. 
          We make every effort to provide our customers with quick turnarounds, 
          personalized solutions, and a worry-free experience.
        </p>
        <div className="hero__buttons">
          <button 
            className="button button--primary" 
            onClick={goToEstimatePage}
          >
            FREE Estimate
          </button>
          <button 
            className="button button--secondary"
            onClick={goToAboutPage}
          >
            About K&E HVAC
          </button>
        </div>
      </div>
    </section>

    {/* Introduction Section - Full width background with contained content */}
    <section className="intro">
      <div className="content-container">
        <h2 className="intro__title">Welcome to K&E HVAC</h2>
        <h3 className="intro__subtitle">HEATING AND COOLING SERVICE IN THE LOW COUNTRY</h3>
        <p className="intro__content">
          At K&E HVAC, we specialize in delivering premium HVAC services designed to create 
          the perfect indoor environment for your home or business. With a commitment to 
          excellence and customer satisfaction, we offer a comprehensive range of heating, 
          ventilation, and air conditioning solutions.
        </p>
      </div>
    </section>

    {/* Information Section - Full width background with contained content */}
    <section className="info">
      <div className="content-container">
        <h2 className="info__title">Reach Out to a Trusted Home Expert in Bluffton</h2>
        <div className="info__content">
          <p>
            At K&E HVAC, we understand how hard it can be to deal with cooling and A/C issues, 
            especially in sweltering summer temperatures. In extreme cases, a faulty A/C system 
            can threaten your family's health and safety. That's why our home expert team is 
            committed to being your one-stop shop for all of your HVAC and cooling needs.
          </p>
          <p>
            Our friendly professionals offer expert cooling services to homeowners and business 
            owners in the Low Country and surrounding areas, including installation, repair, 
            maintenance, and replacement for all types of cooling systems. We'll work quickly 
            to diagnose the issues you're facing so you can get back to enjoying comfortable 
            temperatures in your home or office—without worrying about ridiculous energy bills 
            or costly replacements.
          </p>
          <p>
            At K&E HVAC, your comfort and safety are our top priorities. Contact us online to 
            request a quote or schedule a service for your cooling needs.
          </p>
        </div>
      </div>
    </section>
  </>
);
};

export default FrontPage;