import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import emailjs from 'emailjs-com'; // Import the emailjs-com library
import './BookingPage.css';

function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    appointmentType: '',
    description: '',
    selectedDate: null,
  });

  const [success, setSuccess] = useState(false);
  // Define the handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Define the handleDateChange function
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      selectedDate: date,
    });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_577plbq', 'template_695831i', e.target, 'z01pUKhhurokO_4ff')
      .then((res) => {
        console.log('Email sent successfully:', res);
        setSuccess(true);

        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          appointmentType: '',
          description: '',
          selectedDate: null,
        });
      })
      .catch((err) => {
        console.error('Failed to send the email:', err);
      });
  };
    const closeSuccessMessage = () => {
      setSuccess(false);
  };
  return (
    <div className="BookingPage-container">
      <h1>Book an Appointment</h1>
      <form className="BookingPage-form" onSubmit={sendEmail}>
        <div>
          <label htmlFor="name"></label>
          <input
            type="text"
            id="name"
            name="name"
            className="BookingPage-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
        </div>
        <div>
          <label htmlFor="email"></label>
          <input
            type="text"
            id="email"
            name="email"
            className="BookingPage-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label htmlFor="phoneNumber"></label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            className="BookingPage-input"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
        </div>
        <div>
          <label htmlFor="appointmentType"></label>
          <select
            id="appointmentType"
            name="appointmentType"
            className="BookingPage-input"
            value={formData.appointmentType}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="Initial Consultation">Initial Consultation</option>
            <option value="Follow Up">Follow Up</option>
          </select>
        </div>
        <div>
          <label htmlFor="selectedDate"></label>
          <DatePicker
            id="selectedDate"
            name="selectedDate"
            className="BookingPage-datepicker"
            selected={formData.selectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm aa"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select a date and time"
            required
          />
        </div>
        <div>
          <label htmlFor="description"></label>
          <textarea
            id="description"
            name="description"
            className="BookingPage-input"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
        </div>
        <button className="BookingPage-button" type="submit">
          Submit
        </button>
        </form>
        {success && (
          <div className="popup">
            <div className="popup-content">
              <span className="close" onClick={closeSuccessMessage}>
                &times;
              </span>
              <p>   Thanks for your message,    </p>
              <p>   we'll be in touch shortly!   </p>
            </div>
          </div>
        )}

    </div>
  );
}

export default BookingPage;
