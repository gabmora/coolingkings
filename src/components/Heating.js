import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FrontPage.css';

function Heating() {
 // Example of how to structure your AC component for full width
const navigate = useNavigate();
  return (
    <>
      {/* Introduction Section - Full Width */}
      <section className="ACInfo-introduction">
        <div className="content-wrapper">
          <h2>Air Conditioning Services</h2>
          <p>
            Stay cool and comfortable with our professional air conditioning services. 
            We provide installation, repair, and maintenance for all types of AC systems.
          </p>
        </div>
      </section>

      {/* Benefits Section - Full Width */}
      <section className="ACInfo-benefits">
        <div className="content-wrapper">
          <h2>Benefits of Professional AC Service</h2>
          <ul>
            <li>Improved energy efficiency and lower utility bills</li>
            <li>Extended equipment lifespan</li>
            <li>Better indoor air quality</li>
            <li>Consistent temperature control</li>
            <li>Reduced repair costs</li>
          </ul>
        </div>
      </section>

      {/* AC Types Section - Full Width */}
      <section className="ACInfo-types">
        <div className="content-wrapper">
          <h2>Types of AC Systems We Service</h2>
          
          <div className="ACInfo-type">
            <h3>Central Air Conditioning</h3>
            <p>
              Whole-home cooling systems that distribute conditioned air through ductwork. 
              Perfect for larger homes and commercial spaces.
            </p>
          </div>

          <div className="ACInfo-type">
            <h3>Ductless Mini-Split Systems</h3>
            <p>
              Energy-efficient systems that cool individual rooms or zones without ductwork. 
              Ideal for home additions or older homes.
            </p>
          </div>

          <div className="ACInfo-type">
            <h3>Heat Pumps</h3>
            <p>
              Versatile systems that provide both heating and cooling. 
              Highly efficient and environmentally friendly option.
            </p>
          </div>
        </div>
      </section>

      {/* Image Section - Full Width */}
      <section className="ACInfo-image">
        <div className="content-wrapper">
          <img 
            src="/images/ac-technician.jpg" 
            alt="Professional AC Installation" 
          />
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="ACInfo-cta">
        <div className="content-wrapper">
          <h2>Need AC Service?</h2>
          <p>
            Don't let a broken AC system leave you uncomfortable. 
            Contact us today for fast, reliable service.
          </p>
          <button onClick={() => navigate('/estimate')}>
            Get Free Estimate
          </button>
        </div>
      </section>
    </>
  );
};


export default Heating;
