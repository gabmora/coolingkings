import React from 'react';
import './FrontPage.css';

function ContactInfo() {
  return (
    <>
    <div className="contactRow">
      <div className="ContactInfo-phone">
        <h2><a href="tel:(312) 961-4664">(312) 961-4664</a></h2>
        <p>Call to schedule, or to learn more about our heating and cooling services. </p>
      </div>
      <div className="ContactInfo-email">
          <h2><a href="mailto:info@coolingkingshvac.com">info@coolingkingshvac.com</a></h2>
          <p>Email us to schedule HVAC service, or let us know what questions you have. </p>
        </div>
        <div className="ContactInfo-chatnow">
          <h2><a href="https://calendly.com/coolingkings" target="_blank">Chat Now</a></h2>
          <p>Text a heating and cooling service agent now.</p>
        </div>
      </div>
    </>

  );
}

export default ContactInfo;
