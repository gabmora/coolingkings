import React, { useState } from 'react';
import './FreeEstimate.css';
import { supabase } from '../services/supabase'; // Use your existing supabase service

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Send notifications to admin users
  const sendNotifications = async (estimateData) => {
    try {
      console.log('Sending notifications for:', estimateData);
      
      // Call edge function to send emails to admin users
      const { data, error } = await supabase.functions.invoke('send-estimate-notification', {
        body: {
          estimateData,
          recipients: [
            'keats.c.daley@gmail.com',  // Your admin emails from the database
            'gabimm29@gmail.com'
          ]
        }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      console.log('Notification function response:', data);
      
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't throw here - we don't want notification failures to break form submission
    }
  };

  // Send confirmation email to customer
  const sendCustomerConfirmation = async (customerData) => {
    try {
      console.log('Sending customer confirmation to:', customerData.email);
      
      const { data, error } = await supabase.functions.invoke('send-customer-confirmation', {
        body: {
          customerEmail: customerData.email,
          customerName: customerData.name,
          serviceType: customerData.serviceType
        }
      });

      if (error) {
        console.error('Error sending customer confirmation:', error);
        throw error;
      }

      console.log('Customer confirmation sent:', data);
      
    } catch (error) {
      console.error('Error sending customer confirmation:', error);
      // Don't throw here - we don't want confirmation failures to break form submission
    }
  };

  // Determine priority based on service type
  const determineRequestPriority = (serviceType) => {
    const urgentServices = ['ac-repair', 'heating-repair'];
    return urgentServices.includes(serviceType) ? 'urgent' : 'normal';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Debug: Check if supabase is working
      console.log('Testing Supabase connection...');
      
      // First, let's test a simple query to see if connection works
      const { data: testData, error: testError } = await supabase
        .from('estimate_requests')
        .select('*')
        .limit(1);
      
      console.log('Connection test result:', { testData, testError });
      
      if (testError) {
        console.error('Supabase connection failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      // Save estimate request to Supabase
      console.log('Inserting data:', formData);
      
      const { data: estimateData, error: insertError } = await supabase
        .from('estimate_requests')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            service_type: formData.serviceType,
            description: formData.description,
            preferred_date: formData.preferredDate || null,
            preferred_time: formData.preferredTime || null,
            status: 'pending',
            priority: determineRequestPriority(formData.serviceType)
          }
        ])
        .select()
        .single();

      console.log('Insert result:', { estimateData, insertError });

      if (insertError) throw insertError;

      console.log('Estimate request saved successfully:', estimateData);

      // Send email notifications to admins
      await sendNotifications(estimateData);

      // Send confirmation email to customer
      await sendCustomerConfirmation(formData);

      setFormSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
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
        setFormSubmitted(false);
      }, 8000);

    } catch (error) {
      console.error('Detailed error:', error);
      setSubmitError(`Failed to submit request: ${error.message}. Please try again or call us at (555) 123-HVAC.`);
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
  <>
    {/* Hero Section - Full Width */}
    <section className="estimate-hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Request Your Free Estimate</h1>
        <p>
          Get a no-obligation quote for your heating and cooling needs from the experts at K&E HVAC.
        </p>
      </div>
    </section>

    {/* Form Section - Full Width Background */}
    <section className="estimate-form-section">
      <div className="content-container">
        <div className="estimate-form-wrapper">
          <div className="estimate-form-content">
            {formSubmitted ? (
              <div className="form-success">
                <div className="success-icon">✓</div>
                <h2>Thank You!</h2>
                <p>Your estimate request has been submitted successfully. One of our HVAC specialists will contact you within 24 hours to discuss your needs and schedule a convenient time for your free estimate.</p>
                <p>We've also sent a confirmation email to <strong>{formData.email}</strong> with next steps.</p>
                <button 
                  className="button button--primary"
                  onClick={() => setFormSubmitted(false)}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <h2>Tell Us About Your Project</h2>
                  <p>Fill out the form below and we'll get back to you within 24 hours</p>
                </div>
                
                {submitError && (
                  <div className="form-error">
                    {submitError}
                  </div>
                )}
                
                <form className="estimate-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="address">Property Address *</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="serviceType">Service Type *</label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select a service</option>
                      <option value="ac-installation">🌬️ AC Installation</option>
                      <option value="ac-repair">🔧 AC Repair</option>
                      <option value="heating-installation">🔥 Heating Installation</option>
                      <option value="heating-repair">⚒️ Heating Repair</option>
                      <option value="maintenance">🛠️ Maintenance</option>
                      <option value="ductwork">🏠 Ductwork</option>
                      <option value="other">❓ Other</option>
                    </select>
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="description">Project Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Please provide details about your project or issue..."
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="preferredDate">Preferred Date</label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="preferredTime">Preferred Time</label>
                      <select
                        id="preferredTime"
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="">Select a time</option>
                        <option value="morning">🌅 Morning (8AM - 12PM)</option>
                        <option value="afternoon">☀️ Afternoon (12PM - 4PM)</option>
                        <option value="evening">🌆 Evening (4PM - 7PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-submit">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          📋 Request Free Estimate
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          
          <div className="estimate-sidebar">
            <div className="benefits-card">
              <h3>💡 Why Choose K&E HVAC?</h3>
              <ul>
                <li>
                  <span className="benefit-icon">✅</span>
                  <span>Free, no-obligation estimates</span>
                </li>
                <li>
                  <span className="benefit-icon">🏆</span>
                  <span>Licensed and insured professionals</span>
                </li>
                <li>
                  <span className="benefit-icon">⚡</span>
                  <span>Energy-efficient solutions</span>
                </li>
                <li>
                  <span className="benefit-icon">💳</span>
                  <span>Flexible financing options</span>
                </li>
                <li>
                  <span className="benefit-icon">🚨</span>
                  <span>24/7 emergency service</span>
                </li>
                <li>
                  <span className="benefit-icon">💯</span>
                  <span>100% satisfaction guarantee</span>
                </li>
              </ul>
            </div>
            
            <div className="contact-card">
              <h3>📞 Need Immediate Help?</h3>
              <p>For urgent HVAC issues, call us directly:</p>
              <a href="tel:555-123-HVAC" className="phone-link">
                (555) 123-HVAC
              </a>
              <p className="availability">Available 24/7 for emergencies</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Process Section - Full Width Background */}
    <section className="estimate-process-section">
      <div className="content-container">
        <div className="section-header">
          <h2>What to Expect</h2>
          <p>Our simple 4-step process makes getting your estimate easy</p>
        </div>
        
        <div className="process-grid">
          <div className="process-step">
            <div className="process-number">1</div>
            <div className="process-content">
              <h3>📝 Submit Your Request</h3>
              <p>Fill out our simple form with your contact information and project details.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="process-number">2</div>
            <div className="process-content">
              <h3>📅 Schedule Consultation</h3>
              <p>Our team will contact you within 24 hours to schedule a convenient time for an in-home assessment.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="process-number">3</div>
            <div className="process-content">
              <h3>💰 Receive Your Estimate</h3>
              <p>Our expert will evaluate your needs and provide a detailed, transparent estimate with no hidden costs.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="process-number">4</div>
            <div className="process-content">
              <h3>😊 Enjoy Peace of Mind</h3>
              <p>Once approved, our team will complete your project efficiently and to the highest standards.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section - Full Width */}
    <section className="estimate-cta-section">
      <div className="content-container">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers who trust K&E HVAC for their comfort needs</p>
          <div className="cta-stats">
            <div className="stat">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Emergency Service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);
};

export default FreeEstimate;