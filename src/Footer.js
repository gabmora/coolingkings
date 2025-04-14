import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-info">
            <h2 className="footer-title">Serving the Low Country</h2>
            <a href="tel:201-844-3508" className="footer-phone">
              <svg className="footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              201-844-3508
            </a>
            <address className="footer-address">
              <svg className="footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              730 Broad St.<br />
              Bluffton, SC 29936<br />
              <a href="https://www.google.sc/maps/place/Bluffton,+SC/@32.2082612,-81.2266275,11z/data=!3m1!4b1!4m6!3m5!1s0x88fb88a4565944a9:0x533443fc3989de46!8m2!3d32.2371465!4d-80.8603868!16zL20vMF9rcWc?entry=ttu" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-map-link">
                View on Map
              </a>
            </address>
            <button className="footer-button">
              <svg className="footer-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8l4 4-4 4M8 12h8"></path>
              </svg>
              Areas We Serve
            </button>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h3 className="footer-heading">Quick Links</h3>
              <ul className="footer-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/AC">Cooling</Link></li>
                <li><Link to="/reviews">Reviews</Link></li>
                <li><Link to="/AboutUs">About Us</Link></li>
                <li><Link to="/service-areas">Service Areas</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3 className="footer-heading">Services</h3>
              <ul className="footer-list">
                <li><Link to="/heating">Heating</Link></li>
                <li><Link to="/MaintenancePlan">Maintenance Plan</Link></li>
                <li><Link to="/admin">Careers</Link></li>
                <li><Link to="/BookingPage">Contact</Link></li>
                <li><Link to="/coupons">Coupons</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-connect">
            <div className="footer-social-section">
              <h3 className="footer-heading">Follow Us</h3>
              <div className="footer-social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="footer-social-icon">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="footer-social-icon">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="footer-social-icon">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="footer-social-icon">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="footer-payment-section">
              <h3 className="footer-heading">We Accept</h3>
              <div className="footer-payment-methods">
                <div className="payment-icon visa" title="Visa"></div>
                <div className="payment-icon paypal" title="PayPal"></div>
                <div className="payment-icon cash" title="Cash"></div>
                <div className="payment-icon zelle" title="Zelle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">&copy; {new Date().getFullYear()} K&E HVAC. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;