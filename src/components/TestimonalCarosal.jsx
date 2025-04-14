// TestimonialCarousel.jsx
import React, { useState } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const TestimonialCarousel = ({ testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <div className="testimonial-carousel">
      <button className="carousel-arrow left" onClick={prevTestimonial}>
        &#8249;
      </button>
      
      <div className="testimonial-container">
        {testimonials.map((testimonial, index) => (
          <div 
            key={testimonial.id} 
            className={`testimonial ${index === activeIndex ? 'active' : ''}`}
          >
            <FaQuoteLeft className="quote-icon" />
            <p className="testimonial-text">{testimonial.text}</p>
            <div className="testimonial-rating">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i}
                  className={i < testimonial.rating ? 'star-filled' : 'star-empty'} 
                />
              ))}
            </div>
            <h4 className="testimonial-name">{testimonial.name}</h4>
            <p className="testimonial-location">{testimonial.location}</p>
          </div>
        ))}
      </div>
      
      <button className="carousel-arrow right" onClick={nextTestimonial}>
        &#8250;
      </button>
      
      <div className="carousel-dots">
        {testimonials.map((_, index) => (
          <button 
            key={index} 
            className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
