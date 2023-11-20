import React from 'react';

function ContactInfo() {
  return (
    <section className="contact-info">
      <h2>Contact Us</h2>
      {/* <p>Address: 123 Main St, Your City</p> */}
      <p>Phone: <a href="tel:(312) 961-4664">(312) 961-4664</a></p>
      <p>Email: <a href="mailto:info@coolingkingshvac.com">info@coolingkingshvac.com</a></p>
    </section>
  );
}

export default ContactInfo;
