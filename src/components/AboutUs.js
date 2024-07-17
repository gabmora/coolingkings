import React from 'react';
import './AboutUs.css'; 

function AboutUs() {
  return (
    <div className="about-us">
        <div className="column">
          <h3>Our Mission</h3>
          <p> Whether it's a residential property, commercial space, or industrial facility, K&E HVAC is dedicated to providing superior HVAC solutions that prioritize your comfort, health, and peace of mind.
            Contact us today to discuss your HVAC needs and experience the difference of working with a dedicated team committed to ensuring your indoor environment is nothing short of perfect.</p> 
          {/* <h3>Our Team</h3> */}
        </div>
      <div className="row">
        <div className="column">
          <h3>Our Services</h3>
          <h5>Installation & Upgrades:</h5>
          From installing state-of-the-art HVAC systems to upgrading existing ones, we ensure efficient, cost-effective, and eco-friendly solutions tailored to your needs.
          <h5>Repair & Maintenance:</h5> 
          Our team of skilled technicians provides timely and reliable repair services, as well as proactive maintenance plans to keep your systems running smoothly year-round.
          <h5>Indoor Air Quality:</h5>
          We prioritize your health and comfort by offering solutions to enhance indoor air quality through air purifiers, humidifiers, and ventilation systems.
          <h5>Energy Efficiency Consulting:</h5> 
          We assist in optimizing energy usage, helping you save on utility bills while reducing your carbon footprint through energy-efficient HVAC solutions.
        </div>
        <div className="column">
          <h3>Why Choose Us</h3>
            <h5>Expertise:</h5> Our team comprises certified technicians with extensive experience in the HVAC industry, ensuring top-notch service delivery.
            <h5>Customer-Centric Approach:</h5>We prioritize customer satisfaction, offering personalized solutions and transparent communication every step of the way.
            <h5>Reliability & Timeliness:</h5>Count on us for prompt responses, efficient service, and timely project completion.
            <h5>Quality Assurance:</h5> We use high-quality products and cutting-edge technology to deliver reliable, long-lasting HVAC solutions.
            <h5>Competitive Pricing:</h5> Our services come at competitive rates, offering value for your investment in comfort and efficiency.
          
        </div>
      </div>
    </div>
    
  );
}

export default AboutUs;
