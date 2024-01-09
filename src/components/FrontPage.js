import React from 'react';
import './FrontPage.css';

// Import your images using the import statement
import acImage from './images/HVAC-system.jpg';
import heatingImage from './images/heating.jpeg';

function FrontPage() {
  console.log('FrontPage component rendered');
  return (
    <>
      <div className="FrontPage-container">
        <h1 className='FrontPage-title'>Welcome to Cooling Kings HVAC</h1>
        <h2 className='FrontPage-subtitle'>HEATING AND COOLING SERVICE IN THE LOW COUNTRY</h2>
        <p className='FrontPage-content'>At Cooling Kings, we specialize in delivering premium HVAC services designed to create the perfect indoor environment for your home or business. With a commitment to excellence and customer satisfaction, we offer a comprehensive range of heating, ventilation, and air conditioning solutions.</p>
      </div>
      
      <div className="FrontPage-container">
          <figure className="image-figure"> 
            <img className="frontpageimage" src={heatingImage} alt="Heating" />
              <iframe className="frontpageimage"src="https://www.google.com/maps/d/embed?mid=10rgyoD9J5jcrE1fHftglIfIldKIYpBs&ehbc=2E312F&noprof=1"></iframe>
          </figure>
          
      
        <div class="reviews-container">
          <h2>Customer Reviews</h2>
          <div id="google-reviews"> </div>
          <a href="YOUR_GOOGLE_MY_BUSINESS_LINK" target="_blank" class="review-cta-button">Leave Us a Review on Google</a>
        <figcaption>CK HVAC services all makes and models of air conditioners and cooling systems. Residential and commercial service. Typically same-day AC repairs. Serving the LowCountry, SC area. We’re here to help with all of your heating needs. We work on all furnace brands. We also install and repair thermostats, heat pumps, ductless min-splits, and geothermal systems.</figcaption>
      </div>
      </div>
      
    </>
  );
}

export default FrontPage;
