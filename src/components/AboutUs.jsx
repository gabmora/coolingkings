import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';

const AboutUs = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200">
      {/* Hero Section */}
      <section className="relative h-80 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://marketplace.canva.com/EAD2962NKnQ/2/0/1600w/canva-rainbow-gradient-pink-and-purple-virtual-background-_Tcjok-d9b4.jpg')",
            backgroundAttachment: 'fixed' 
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-white max-w-2xl"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">About K&E HVAC</h1>
            <p className="text-base md:text-lg font-light">
              Your trusted partner for all heating, cooling, and ventilation needs in the Low Country
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-purple-900/10 rounded-l-full -z-10"></div>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Our Mission</h2>
            <div className="h-0.5 w-16 bg-purple-500 mx-auto mb-4"></div>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Whether it's a residential property, commercial space, or industrial facility, K&E HVAC is dedicated to 
              providing superior HVAC solutions that prioritize your comfort, health, and peace of mind.
              Contact us today to discuss your HVAC needs and experience the difference of working with a dedicated 
              team committed to ensuring your indoor environment is nothing short of perfect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Our Services</h2>
            <div className="h-0.5 w-16 bg-purple-500 mx-auto"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Service Card 1 */}
            <motion.div variants={fadeIn} className="bg-gray-800 rounded shadow-md overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
              <div className="p-4">
                <div className="w-8 h-8 bg-purple-900/50 text-purple-300 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 text-center">Installation & Upgrades</h3>
                <p className="text-xs text-gray-400 text-center">
                  From installing state-of-the-art HVAC systems to upgrading existing ones, 
                  we ensure efficient, cost-effective, and eco-friendly solutions.
                </p>
              </div>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div variants={fadeIn} className="bg-gray-800 rounded shadow-md overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
              <div className="p-4">
                <div className="w-8 h-8 bg-purple-900/50 text-purple-300 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 text-center">Repair & Maintenance</h3>
                <p className="text-xs text-gray-400 text-center">
                  Our team of skilled technicians provides timely and reliable repair services, 
                  as well as proactive maintenance plans.
                </p>
              </div>
            </motion.div>

            {/* Service Card 3 */}
            <motion.div variants={fadeIn} className="bg-gray-800 rounded shadow-md overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
              <div className="p-4">
                <div className="w-8 h-8 bg-purple-900/50 text-purple-300 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0 0L9.121 9.121" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 text-center">Indoor Air Quality</h3>
                <p className="text-xs text-gray-400 text-center">
                  We prioritize your health and comfort by offering solutions to enhance indoor air quality 
                  through advanced systems.
                </p>
              </div>
            </motion.div>

            {/* Service Card 4 */}
            <motion.div variants={fadeIn} className="bg-gray-800 rounded shadow-md overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
              <div className="p-4">
                <div className="w-8 h-8 bg-purple-900/50 text-purple-300 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 text-center">Energy Efficiency</h3>
                <p className="text-xs text-gray-400 text-center">
                  We assist in optimizing energy usage, helping you save on utility bills 
                  while reducing your carbon footprint.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Why Choose Us</h2>
            <div className="h-0.5 w-16 bg-purple-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              className="rounded overflow-hidden shadow-md"
            >
              <img 
                src="/images/team-photo.jpg" 
                alt="K&E HVAC Team" 
                className="w-full h-64 object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="flex flex-col justify-center"
            >
              {/* Expertise */}
              <motion.div variants={fadeIn} className="flex items-start mb-4">
                <div className="bg-purple-900/40 text-purple-300 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Expertise</h3>
                  <p className="text-xs text-gray-400">
                    Our team comprises certified technicians with extensive experience in the HVAC industry, 
                    ensuring top-notch service delivery.
                  </p>
                </div>
              </motion.div>

              {/* Customer-Centric */}
              <motion.div variants={fadeIn} className="flex items-start mb-4">
                <div className="bg-purple-900/40 text-purple-300 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Customer-Centric Approach</h3>
                  <p className="text-xs text-gray-400">
                    We prioritize customer satisfaction, offering personalized solutions 
                    and transparent communication every step of the way.
                  </p>
                </div>
              </motion.div>

              {/* Reliability */}
              <motion.div variants={fadeIn} className="flex items-start mb-4">
                <div className="bg-purple-900/40 text-purple-300 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Reliability & Timeliness</h3>
                  <p className="text-xs text-gray-400">
                    Count on us for prompt responses, efficient service, and timely project completion.
                  </p>
                </div>
              </motion.div>

              {/* Quality */}
              <motion.div variants={fadeIn} className="flex items-start">
                <div className="bg-purple-900/40 text-purple-300 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Quality Assurance</h3>
                  <p className="text-xs text-gray-400">
                    We use high-quality products and cutting-edge technology to deliver reliable, 
                    long-lasting HVAC solutions.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">What Our Clients Say</h2>
            <div className="h-0.5 w-16 bg-purple-500 mx-auto"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Testimonial 1 */}
            <motion.div variants={fadeIn} className="bg-gray-800 p-4 rounded shadow-md border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 bg-purple-900/40 text-purple-300 rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Sarah Johnson</h4>
                  <p className="text-purple-300 text-xs">Bluffton Homeowner</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                "K&E HVAC saved us during a summer heatwave. Their technicians arrived promptly, quickly diagnosed the issue with our AC, and had it running perfectly the same day."
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div variants={fadeIn} className="bg-gray-800 p-4 rounded shadow-md border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 bg-purple-900/40 text-purple-300 rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Michael Thompson</h4>
                  <p className="text-purple-300 text-xs">Business Owner</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                "We've been using K&E HVAC for all our commercial properties for over 5 years. Their maintenance program has saved us thousands in potential repairs and downtime."
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div variants={fadeIn} className="bg-gray-800 p-4 rounded shadow-md border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 bg-purple-900/40 text-purple-300 rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Jennifer Davis</h4>
                  <p className="text-purple-300 text-xs">Hilton Head Resident</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                "After struggling with high energy bills, K&E HVAC helped us upgrade to an energy-efficient system that's reduced our monthly costs significantly. The team was informative and never pushy."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="max-w-xl mx-auto text-center"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4">Ready to experience superior HVAC service?</h2>
            <p className="text-sm md:text-base mb-6 opacity-90">Contact our team today for a consultation or service appointment.</p>
            <div className="contact-info px-4 py-6 rounded-lg">
              <button className="px-6 py-2 bg-white text-purple-800 font-medium rounded shadow-sm hover:bg-gray-100 transition-colors duration-300 text-sm">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;