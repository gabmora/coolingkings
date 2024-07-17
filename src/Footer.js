import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-column">
            <h2>Serving the Low Country</h2>
            <a href="tel:201-844-3508" className="footer-phone">201-844-3508</a>
            <address>
              730 Broad St.<br />
              Bluffton, SC 29936<br />
              <a href="https://www.google.sc/maps/place/Bluffton,+SC/@32.2082612,-81.2266275,11z/data=!3m1!4b1!4m6!3m5!1s0x88fb88a4565944a9:0x533443fc3989de46!8m2!3d32.2371465!4d-80.8603868!16zL20vMF9rcWc?entry=ttu" target="_blank" rel="noopener noreferrer">[Map & Directions]</a>            </address>
            <button className="footer-button">Areas We Serve</button>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/AC">Cooling</a></li>
              <li><a href="/reviews">Reviews</a></li>
              <li><a href="/AboutUs">About Us</a></li>
              <li><a href="/service-areas">Service Areas</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>&nbsp;</h3>
            <ul>
              <li><a href="/heating">Heating</a></li>
              <li><a href="/MaintenancePlan">Maintenance Plan</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/BookingPage">Contact</a></li>
              <li><a href="/coupons">Coupons</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Follow Us</h3>
            <div className="footer-social">
              <a href="https://facebook.com" className="footer-social-link">
                <img src="https://img.icons8.com/color/48/000000/facebook.png" alt="Facebook" />
              </a>
              <a href="https://twitter.com" className="footer-social-link">
                <img src="https://img.icons8.com/color/48/000000/twitter.png" alt="Twitter" />
              </a>
              <a href="https://instagram.com" className="footer-social-link">
                <img src="https://img.icons8.com/color/48/000000/instagram-new.png" alt="Instagram" />
              </a>
              <a href="https://linkedin.com" className="footer-social-link">
                <img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" />
              </a>
            </div>
            <h3>We Accept</h3>
            <div className="footer-payments">
              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
              {/* <img src="https://img.icons8.com/color/48/000000/american-express.png" alt="American Express" /> */}
              {/* <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="MasterCard" /> */}
              {/* <img src="https://img.icons8.com/color/48/000000/discover.png" alt="Discover" /> */}
              <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="PayPal" />
              <img src="https://img.icons8.com/color/48/000000/cash.png" alt="Cash" />
              {/* <img src="https://img.icons8.com/color/48/000000/venmo.png" alt="Venmo" /> */}
              <img src="https://img.icons8.com/color/48/000000/zelle.png" alt="Zelle" />
            </div>
          </div>
        </div>
      </div>
      <p className="footer-copyright">&copy; 2024 K&E HVAC. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
