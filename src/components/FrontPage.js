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

      <div className="row">
        <figure className="image-figure"> {/* Add a class for styling */}
          <img className="acimage" src={acImage} alt="HVAC system" />
          <figcaption>Reddi HVAC services all makes and models of air conditioners and cooling systems. Residential and commercial service. Typically same-day AC repairs. Serving the Wichita, KS area.</figcaption>
        </figure>
        <figure className="image-figure"> {/* Add a class for styling */}
          <img className="frontpageimage" src={heatingImage} alt="Heating" />
          <figcaption>We’re here to help with all of your heating needs. We work on all furnace brands. We also install and repair thermostats, heat pumps, ductless min-splits, and geothermal systems.</figcaption>
        </figure>
      </div>
    </>
  );
}

export default FrontPage;
