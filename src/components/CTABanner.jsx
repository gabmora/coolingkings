// CTABanner.jsx
import React from 'react';

const CTABanner = ({ title, subtitle, buttonText, link }) => {
  return (
    <div className="cta-banner">
      <div className="cta-content">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <a href={link} className="cta-button">{buttonText}</a>
    </div>
  );
};

export default CTABanner;