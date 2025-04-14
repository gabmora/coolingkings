import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import emailjs from 'emailjs-com';
import './BookingPage.css';

const BookingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    appointmentType: '',
    description: '',
    selectedDate: null,
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      selectedDate: date,
    });
    
    if (formErrors.selectedDate) {
      setFormErrors({
        ...formErrors,
        selectedDate: null
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    
    if (!formData.appointmentType) errors.appointmentType = "Please select a service type";
    if (!formData.selectedDate) errors.selectedDate = "Please select a date and time";
    if (!formData.description.trim()) errors.description = "Please provide a brief description";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    emailjs
      .sendForm('service_577plbq', 'template_695831i', e.target, 'z01pUKhhurokO_4ff')
      .then((res) => {
        console.log('Email sent successfully:', res);
        setLoading(false);
        setSuccess(true);
        
        // Reset form data
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          appointmentType: '',
          description: '',
          selectedDate: null,
        });
        
        // Reset step
        setStep(1);
      })
      .catch((err) => {
        console.error('Failed to send the email:', err);
        setLoading(false);
        alert('There was an error sending your request. Please try again later.');
      });
  };

  // Close success message
  const closeSuccessMessage = () => {
    setSuccess(false);
  };

  // Move to the next step
  const nextStep = () => {
    const fieldsToValidate = step === 1 
      ? ['name', 'email', 'phoneNumber'] 
      : ['appointmentType', 'selectedDate', 'description'];
    
    const stepErrors = {};
    
    fieldsToValidate.forEach(field => {
      if (field === 'email' && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.email = "Email is invalid";
      } 
      else if (field === 'phoneNumber' && formData.phoneNumber && 
              !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
        stepErrors.phoneNumber = "Please enter a valid 10-digit phone number";
      }
      else if (!formData[field]) {
        stepErrors[field] = `${field === 'selectedDate' ? 'Date and time' : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    setFormErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  // Go back to the previous step
  const prevStep = () => {
    setStep(1);
  };

  // Format phone number as user types
  const formatPhoneNumber = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = '';
    
    if (input.length <= 3) {
      formatted = input;
    } else if (input.length <= 6) {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    } else {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
    }
    
    setFormData({
      ...formData,
      phoneNumber: formatted
    });
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Schedule Your HVAC Service</h1>
          <p className="booking-subheading">Request a service appointment with our expert technicians</p>
        </div>
        
        {/* Progress indicator */}
        <div className="booking-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Your Information</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Service Details</div>
          </div>
        </div>
        
        <form className="booking-form" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-container">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={formErrors.name ? 'error' : ''}
                  />
                </div>
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-container">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={formErrors.email ? 'error' : ''}
                  />
                </div>
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <div className="input-container">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={formatPhoneNumber}
                    placeholder="(123) 456-7890"
                    className={formErrors.phoneNumber ? 'error' : ''}
                  />
                </div>
                {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
              </div>
              
              <div className="form-actions">
                <button type="button" className="button button-primary" onClick={nextStep}>Continue to Service Details</button>
              </div>
            </div>
          ) : (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="appointmentType">Service Type</label>
                <div className="select-container">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                  <select
                    id="appointmentType"
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleChange}
                    className={formErrors.appointmentType ? 'error' : ''}
                  >
                    <option value="">Select a service</option>
                    <option value="Essential">Essential Maintenance</option>
                    <option value="Advanced">Advanced Repair</option>
                    <option value="Premium">Premium Installation</option>
                    <option value="Emergency">Emergency Service</option>
                    <option value="Inspection">System Inspection</option>
                  </select>
                </div>
                {formErrors.appointmentType && <div className="error-message">{formErrors.appointmentType}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="selectedDate">Preferred Date & Time</label>
                <div className="date-container">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <DatePicker
                    id="selectedDate"
                    name="selectedDate"
                    selected={formData.selectedDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm aa"
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    placeholderText="Select date and time"
                    minDate={new Date()}
                    filterDate={date => date.getDay() !== 0} // Exclude Sundays
                    className={formErrors.selectedDate ? 'error' : ''}
                  />
                </div>
                {formErrors.selectedDate && <div className="error-message">{formErrors.selectedDate}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description of Issue</label>
                <div className="textarea-container">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="10" x2="3" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="21" y1="18" x2="3" y2="18"></line>
                  </svg>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please briefly describe your HVAC issue or service need"
                    className={formErrors.description ? 'error' : ''}
                  />
                </div>
                {formErrors.description && <div className="error-message">{formErrors.description}</div>}
              </div>
              
              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={prevStep}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Success Modal */}
      {success && (
        <div className="modal-overlay">
          <div className="success-modal">
            <button className="close-modal" onClick={closeSuccessMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Request Submitted!</h2>
            <p>Thank you for choosing K&E HVAC. We've received your service request and will be in touch shortly to confirm your appointment.</p>
            <p className="success-note">Our team typically responds within 2 business hours.</p>
            <button className="button button-primary" onClick={closeSuccessMessage}>Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;