import React from 'react';
import './FrontPage.css';

// Import your images using the import statement
// import acImage from './images/HVAC-system.jpg';

function FrontPage() {
  console.log('FrontPage component rendered');
  return (
    <>
      <div className="FrontPage-container">
        <section className='into-block'>
          <p> </p>
        </section>
        <section className='intro-block'>
          <h1 className='FrontPage-title'>Welcome to K&E HVAC</h1>
          <h2 className='FrontPage-subtitle'>HEATING AND COOLING SERVICE IN THE LOW COUNTRY</h2>
          <h3 className='FrontPage-content'>At K&E HVAC, we specialize in delivering premium HVAC services designed to create the perfect indoor environment for your home or business. With a commitment to excellence and customer satisfaction, we offer a comprehensive range of heating, ventilation, and air conditioning solutions.</h3>
        </section>
      </div>
      
      <div className="FrontPage-container">
          {/* <figure className="image-figure"> 
            <img className="frontpageimage" src={heatingImage} alt="Heating" />
              <iframe className="frontpageimage"src="https://www.google.com/maps/d/embed?mid=10rgyoD9J5jcrE1fHftglIfIldKIYpBs&ehbc=2E312F&noprof=1"></iframe>
          </figure> */}
          
      
        <div class="reviews-container">
          <h2>Customer Reviews</h2>
          <div id="google-reviews"> </div>
          <a href="https://www.google.com/search?q=my+business&mat=CdE0ELzdG9aQEkwB7PxHsWkuNwFfJWLnoXR0jfP5eH0N57XjqTlPQ2l0lq66WCla9Hg7IEG3MmeuSGIZCdSYAGtIGI5n4LDpPAp4636XyJwj5_kJJpOI&hl=en&authuser=0" target="_blank" class="review-cta-button">Leave Us a Review on Google</a>
        <figcaption>K&E HVAC services all makes and models of air conditioners and cooling systems. Residential and commercial service. Typically same-day AC repairs. Serving the LowCountry, SC area. We’re here to help with all of your heating needs. We work on all furnace brands. We also install and repair thermostats, heat pumps, ductless min-splits, and geothermal systems.</figcaption>
      </div>
      </div>
      
    </>
  );
}

export default FrontPage;
