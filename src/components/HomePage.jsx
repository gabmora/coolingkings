import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaSnowflake,
  FaFire,
  FaTools,
  FaCheckCircle,
  FaClock,
  FaAward,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
  FaWrench,
  FaShieldAlt
} from 'react-icons/fa';
import './HomePage.css';
import hvacImage from './images/HVAC-system.jpg';

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const services = [
    {
      icon: <FaSnowflake />,
      title: 'Air Conditioning',
      description: 'Expert AC installation, repair, and maintenance. Stay cool all summer with efficient, reliable cooling solutions.',
      features: ['Installation', 'Repair', 'Maintenance', 'Emergency Service']
    },
    {
      icon: <FaFire />,
      title: 'Heating Systems',
      description: 'Comprehensive heating services including furnaces, heat pumps, and ductless systems for year-round comfort.',
      features: ['Furnace Repair', 'Heat Pumps', 'Installation', 'Tune-Ups']
    },
    {
      icon: <FaTools />,
      title: 'Maintenance Plans',
      description: 'Preventive maintenance to keep your system running efficiently and extend its lifespan.',
      features: ['Seasonal Tune-Ups', 'Priority Service', 'Discounts', 'Extended Warranty']
    }
  ];

  const whyChooseUs = [
    {
      icon: <FaAward />,
      title: '15+ Years Experience',
      description: 'Trusted expertise in residential and commercial HVAC services'
    },
    {
      icon: <FaClock />,
      title: '24/7 Emergency Service',
      description: 'We\'re here when you need us most, day or night'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Licensed & Insured',
      description: 'Fully certified technicians and comprehensive coverage'
    },
    {
      icon: <FaUsers />,
      title: '5000+ Happy Customers',
      description: 'Delivering exceptional service throughout the Low Country'
    }
  ];

  const maintenancePlans = [
    {
      icon: <FaWrench />,
      title: 'Essential Plan',
      price: '$150/year',
      color: 'bronze',
      features: [
        'Seasonal tune-up and inspection (1 visit per year)',
        'Priority scheduling for service calls',
        '10% discount on repairs',
        'Reminder service for scheduling maintenance',
        'Technician will perform various checks and inspections'
      ]
    },
    {
      icon: <FaTools />,
      title: 'Advanced Plan',
      price: '$250/year',
      color: 'silver',
      popular: true,
      features: [
        'Seasonal tune-up and inspection (2 visits per year)',
        'Priority scheduling for service calls',
        '15% discount on repairs',
        'No overtime charges for after-hours service',
        'Reminder service for scheduling maintenance',
        'Additional checks and inspections by technician'
      ]
    },
    {
      icon: <FaShieldAlt />,
      title: 'Premium Plan',
      price: '$350/year',
      color: 'gold',
      features: [
        'Seasonal tune-up and inspection (2 visits per year)',
        'Priority scheduling for service calls',
        '20% discount on repairs',
        'No overtime charges for after-hours service',
        'Reminder service for scheduling maintenance',
        'Comprehensive checks and inspections',
        'Priority status for emergency service calls'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'Bluffton Homeowner',
      text: 'K&E HVAC installed our new AC system and the difference is incredible! Professional, on-time, and the pricing was very fair.',
      rating: 5
    },
    {
      name: 'Michael Thompson',
      location: 'Business Owner',
      text: 'We use K&E for all our commercial HVAC needs. Their maintenance plans have saved us thousands in prevented breakdowns.',
      rating: 5
    },
    {
      name: 'Jennifer Davis',
      location: 'Hilton Head Resident',
      text: 'Emergency service on a Sunday and they came right away! Fixed our AC in under an hour. Highly recommend!',
      rating: 5
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { supabase } = await import('../services/supabase');

      const priority = formData.serviceType.toLowerCase().includes('repair') ? 'urgent' : 'normal';

      const { error } = await supabase
        .from('estimate_requests')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          service_type: formData.serviceType,
          description: formData.description,
          preferred_date: formData.preferredDate || null,
          preferred_time: formData.preferredTime,
          priority: priority,
          status: 'pending'
        }]);

      if (error) throw error;

      setSubmitMessage('Thank you! We\'ll contact you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        serviceType: '',
        description: '',
        preferredDate: '',
        preferredTime: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('Something went wrong. Please call us at (201) 844-3508');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${hvacImage})` }}
      >
        <div className="hero-overlay"></div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">Expert HVAC Services in the Low Country</h1>
          <p className="hero-subtitle">
            Professional heating, cooling, and maintenance solutions for your comfort
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => scrollToSection('contact')}
            >
              Get Free Estimate
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => scrollToSection('about')}
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Comprehensive HVAC solutions tailored to your needs
            </p>
          </motion.div>

          <div className="services-grid">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="service-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i}>
                      <FaCheckCircle className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Why Choose K&E HVAC</h2>
            <p className="section-subtitle">
              Your trusted partner for heating and cooling excellence
            </p>
          </motion.div>

          <div className="features-grid">
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <motion.div
              className="about-text"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title">About K&E HVAC</h2>
              <h3 className="about-subtitle">Serving the Low Country Since 2008</h3>
              <p>
                At K&E HVAC, we understand how important comfort is to your home and business.
                With over 15 years of experience, we've built our reputation on delivering
                exceptional HVAC services throughout the Low Country.
              </p>
              <p>
                Our team of licensed and certified technicians is committed to providing
                top-quality installation, repair, and maintenance services. We work with all
                major brands and systems, ensuring your heating and cooling needs are met with
                professionalism and expertise.
              </p>
              <p>
                Whether you need emergency repairs, routine maintenance, or a complete system
                installation, K&E HVAC is your trusted partner for year-round comfort.
              </p>
            </motion.div>
            <motion.div
              className="about-stats"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Years Experience</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Emergency Service</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Satisfaction Guaranteed</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Maintenance Plans Section */}
      <section id="maintenance-plans" className="maintenance-plans-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Maintenance Plans</h2>
            <p className="section-subtitle">
              Protect your investment with our comprehensive maintenance plans
            </p>
          </motion.div>

          <div className="plans-grid">
            {maintenancePlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`plan-card ${plan.color} ${plan.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <div className={`plan-icon ${plan.color}`}>{plan.icon}</div>
                <h3 className="plan-title">{plan.title}</h3>
                <div className="plan-price">{plan.price}</div>
                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <FaCheckCircle className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-plan"
                  onClick={() => scrollToSection('contact')}
                >
                  Choose Plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">
              Don't just take our word for it
            </p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-location">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Estimate Form Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title">Get Your Free Estimate</h2>
              <p className="contact-description">
                Ready to improve your comfort? Fill out the form and we'll get back to you
                within 24 hours with a free, no-obligation estimate.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    {/* <div className="contact-label">Phone</div> */}
                    <div className="contact-value">(312) 961-4664</div>
                  </div>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    {/* <div className="contact-label">Email</div> */}
                    <div className="contact-value">info@knehvac.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    {/* <div className="contact-label">Address</div> */}
                    <div className="contact-value">730 Broad St., Bluffton, SC 29936</div>
                  </div>
                </div>
              </div>

              <div className="emergency-banner">
                <FaClock className="emergency-icon" />
                <div>
                  <strong>24/7 Emergency Service Available</strong>
                  <p>Call now for immediate assistance</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="contact-form-wrapper"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Property Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serviceType">Service Type *</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="AC Installation">AC Installation</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Heating Installation">Heating Installation</option>
                    <option value="Heating Repair">Heating Repair</option>
                    <option value="Maintenance">Maintenance Plan</option>
                    <option value="Ductwork">Ductwork</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date</label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="preferredTime">Preferred Time</label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (8am-12pm)</option>
                      <option value="afternoon">Afternoon (12pm-5pm)</option>
                      <option value="evening">Evening (5pm-8pm)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Project Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about your HVAC needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Request Free Estimate'}
                </button>

                {submitMessage && (
                  <div className={`submit-message ${submitMessage.includes('went wrong') ? 'error' : 'success'}`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
