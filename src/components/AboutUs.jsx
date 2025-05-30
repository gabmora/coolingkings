import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';

const AboutUs = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      {/* Hero Section - Full Width */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-background"></div>
        <div className="hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="hero-text"
          >
            <h1>About K&E HVAC</h1>
            <p>
              Your trusted partner for all heating, cooling, and ventilation needs in the Low Country
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement - Full Width */}
      <section className="mission-section">
        <div className="mission-background"></div>
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="mission-content"
          >
            <h2>Our Mission</h2>
            <div className="section-divider"></div>
            <p>
              Whether it's a residential property, commercial space, or industrial facility, K&E HVAC is dedicated to 
              providing superior HVAC solutions that prioritize your comfort, health, and peace of mind.
              Contact us today to discuss your HVAC needs and experience the difference of working with a dedicated 
              team committed to ensuring your indoor environment is nothing short of perfect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section - Full Width */}
      <section className="services-section">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="section-header"
          >
            <h2>Our Services</h2>
            <div className="section-divider"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="services-grid"
          >
            {/* Service Card 1 */}
            <motion.div variants={fadeIn} className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3>Installation & Upgrades</h3>
              <p>
                From installing state-of-the-art HVAC systems to upgrading existing ones, 
                we ensure efficient, cost-effective, and eco-friendly solutions.
              </p>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div variants={fadeIn} className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3>Repair & Maintenance</h3>
              <p>
                Our team of skilled technicians provides timely and reliable repair services, 
                as well as proactive maintenance plans.
              </p>
            </motion.div>

            {/* Service Card 3 */}
            <motion.div variants={fadeIn} className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0 0L9.121 9.121" />
                </svg>
              </div>
              <h3>Indoor Air Quality</h3>
              <p>
                We prioritize your health and comfort by offering solutions to enhance indoor air quality 
                through advanced systems.
              </p>
            </motion.div>

            {/* Service Card 4 */}
            <motion.div variants={fadeIn} className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3>Energy Efficiency</h3>
              <p>
                We assist in optimizing energy usage, helping you save on utility bills 
                while reducing your carbon footprint.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section - Full Width */}
      <section className="why-choose-section">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="section-header"
          >
            <h2>Why Choose Us</h2>
            <div className="section-divider"></div>
          </motion.div>

          <div className="why-choose-grid">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              className="team-image"
            >
              <img 
                src="/images/team-photo.jpg" 
                alt="K&E HVAC Team"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="features-list"
            >
              {/* Expertise */}
              <motion.div variants={fadeIn} className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Expertise</h3>
                  <p>
                    Our team comprises certified technicians with extensive experience in the HVAC industry, 
                    ensuring top-notch service delivery.
                  </p>
                </div>
              </motion.div>

              {/* Customer-Centric */}
              <motion.div variants={fadeIn} className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Customer-Centric Approach</h3>
                  <p>
                    We prioritize customer satisfaction, offering personalized solutions 
                    and transparent communication every step of the way.
                  </p>
                </div>
              </motion.div>

              {/* Reliability */}
              <motion.div variants={fadeIn} className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Reliability & Timeliness</h3>
                  <p>
                    Count on us for prompt responses, efficient service, and timely project completion.
                  </p>
                </div>
              </motion.div>

              {/* Quality */}
              <motion.div variants={fadeIn} className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Quality Assurance</h3>
                  <p>
                    We use high-quality products and cutting-edge technology to deliver reliable, 
                    long-lasting HVAC solutions.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Full Width */}
      <section className="testimonials-section">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="section-header"
          >
            <h2>What Our Clients Say</h2>
            <div className="section-divider"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="testimonials-grid"
          >
            {/* Testimonial 1 */}
            <motion.div variants={fadeIn} className="testimonial-card">
              <div className="testimonial-header">
                <div className="client-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="client-info">
                  <h4>Sarah Johnson</h4>
                  <p>Bluffton Homeowner</p>
                </div>
              </div>
              <p>
                "K&E HVAC saved us during a summer heatwave. Their technicians arrived promptly, quickly diagnosed the issue with our AC, and had it running perfectly the same day."
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div variants={fadeIn} className="testimonial-card">
              <div className="testimonial-header">
                <div className="client-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="client-info">
                  <h4>Michael Thompson</h4>
                  <p>Business Owner</p>
                </div>
              </div>
              <p>
                "We've been using K&E HVAC for all our commercial properties for over 5 years. Their maintenance program has saved us thousands in potential repairs and downtime."
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div variants={fadeIn} className="testimonial-card">
              <div className="testimonial-header">
                <div className="client-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="client-info">
                  <h4>Jennifer Davis</h4>
                  <p>Hilton Head Resident</p>
                </div>
              </div>
              <p>
                "After struggling with high energy bills, K&E HVAC helped us upgrade to an energy-efficient system that's reduced our monthly costs significantly. The team was informative and never pushy."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="cta-section">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="cta-content"
          >
            <h2>Ready to experience superior HVAC service?</h2>
            <p>Contact our team today for a consultation or service appointment.</p>
            <div className="cta-button-wrapper">
              <button className="cta-button">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;