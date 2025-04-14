import React, { useState } from 'react';
import './FreeEstimate.css';
// import estimateImage from './images/hvac-technician.jpg';

const FreeEstimate = () => {
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

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
  };

  return (
    <div className="estimate-page">
      <section className="estimate-hero">
        <div className="estimate-hero__content">
          <h1 className="estimate-hero__title">Request Your Free Estimate</h1>
          <p className="estimate-hero__description">
            Get a no-obligation quote for your heating and cooling needs from the experts at K&E HVAC.
          </p>
        </div>
      </section>

      <section className="estimate-form-section">
        <div className="container">
          <div className="estimate-form-wrapper">
            <div className="estimate-form-content">
              {formSubmitted ? (
                <div className="form-success">
                  <h2>Thank You!</h2>
                  <p>Your estimate request has been submitted successfully. One of our HVAC specialists will contact you within 24 hours to discuss your needs and schedule a convenient time for your free estimate.</p>
                  <button 
                    className="button button--primary"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="estimate-form__title">Tell Us About Your Project</h2>
                  <p className="estimate-form__subtitle">Fill out the form below and we'll get back to you within 24 hours</p>
                  
                  <form className="estimate-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
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
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="serviceType">Service Type *</label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a service</option>
                        <option value="ac-installation">AC Installation</option>
                        <option value="ac-repair">AC Repair</option>
                        <option value="heating-installation">Heating Installation</option>
                        <option value="heating-repair">Heating Repair</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="ductwork">Ductwork</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Project Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Please provide details about your project or issue..."
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="preferredDate">Preferred Date</label>
                        <input
                          type="date"
                          id="preferredDate"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="preferredTime">Preferred Time</label>
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleChange}
                        >
                          <option value="">Select a time</option>
                          <option value="morning">Morning (8AM - 12PM)</option>
                          <option value="afternoon">Afternoon (12PM - 4PM)</option>
                          <option value="evening">Evening (4PM - 7PM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-submit">
                      <button type="submit" className="button button--primary">
                        Request Free Estimate
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
            <div className="estimate-form-image">
              {/* <img src={estimateImage} alt="HVAC technician inspecting system" /> */}
              <div className="estimate-benefits">
                <h3>Why Choose K&E HVAC?</h3>
                <ul>
                  <li>Free, no-obligation estimates</li>
                  <li>Licensed and insured professionals</li>
                  <li>Energy-efficient solutions</li>
                  <li>Flexible financing options</li>
                  <li>24/7 emergency service</li>
                  <li>100% satisfaction guarantee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="estimate-info">
        <div className="container">
          <h2>What to Expect</h2>
          <div className="estimate-process">
            <div className="process-step">
              <div className="process-number">1</div>
              <h3>Submit Your Request</h3>
              <p>Fill out our simple form with your contact information and project details.</p>
            </div>
            <div className="process-step">
              <div className="process-number">2</div>
              <h3>Schedule Consultation</h3>
              <p>Our team will contact you within 24 hours to schedule a convenient time for an in-home assessment.</p>
            </div>
            <div className="process-step">
              <div className="process-number">3</div>
              <h3>Receive Your Estimate</h3>
              <p>Our expert will evaluate your needs and provide a detailed, transparent estimate with no hidden costs.</p>
            </div>
            <div className="process-step">
              <div className="process-number">4</div>
              <h3>Enjoy Peace of Mind</h3>
              <p>Once approved, our team will complete your project efficiently and to the highest standards.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreeEstimate;