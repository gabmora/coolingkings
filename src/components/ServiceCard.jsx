// ServiceCard.jsx
import React from 'react';

const ServiceCard = ({ icon, title, description }) => {
  return (
    <div className="service-card">
      <div className="service-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href="#" className="card-link">Learn More →</a>
    </div>
  );
};

export default ServiceCard;
