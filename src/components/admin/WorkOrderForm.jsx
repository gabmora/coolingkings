// components/admin/WorkOrderForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCustomers, createCustomer } from '../../services/customerService';
import { createWorkOrder } from '../../services/workOrderService';
import './AdminStyles.css';

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    service_date: formatDate(new Date()),
    time_preference: 'morning',
    service_type: 'repair',
    priority: 'normal',
    description: '',
    notes: ''
  });
  
  // Customer selection state
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bluffton',
    state: 'SC',
    zip: '',
    type: 'residential',
    notes: ''
  });
  
  // Ref for detecting clicks outside of search results
  const searchResultsRef = useRef(null);
  
  // Format date in YYYY-MM-DD for input field
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Handle clicks outside of search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle customer search input changes
  const handleCustomerSearchChange = async (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    
    if (value.length >= 2) {
      try {
        const results = await searchCustomers(value);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching customers:', error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };
  
  // Handle selecting a customer from search results
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowResults(false);
  };
  
  // Handle new customer form input changes
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer && !showNewCustomerForm) {
      alert('Please select a customer or create a new one');
      return;
    }
    
    try {
      let customerId = selectedCustomer?.id;
      
      // If creating a new customer, save them first
      if (showNewCustomerForm) {
        const createdCustomer = await createCustomer(newCustomer);
        if (createdCustomer) {
          customerId = createdCustomer.id;
        } else {
          alert('Error creating customer');
          return;
        }
      }
      
      // Create the work order
      const workOrderData = {
        ...formData,
        customer_id: customerId
      };
      
      const createdWorkOrder = await createWorkOrder(workOrderData);
      
      if (createdWorkOrder) {
        alert('Work order created successfully!');
        navigate('/admin/workorders');
      } else {
        alert('Error creating work order');
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      alert('An error occurred');
    }
  };
  
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Create New Work Order</h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/admin/workorders')}
        >
          Back to Work Orders
        </button>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Customer Selection Section */}
          <div className="form-section">
            <h2>Customer Information</h2>
            
            {!showNewCustomerForm ? (
              <div className="form-group">
                <label htmlFor="customerSearch">Search Customer:</label>
                <div className="search-container" ref={searchResultsRef}>
                  <input
                    id="customerSearch"
                    type="text"
                    value={customerSearch}
                    onChange={handleCustomerSearchChange}
                    placeholder="Start typing customer name or phone..."
                    className="form-control"
                    autoComplete="off"
                  />
                  
                  {showResults && searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(customer => (
                        <div 
                          key={customer.id} 
                          className="search-result-item"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div><strong>{customer.name}</strong></div>
                          <div>{customer.phone}</div>
                          <div className="small-text">{customer.address}, {customer.city}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showResults && searchResults.length === 0 && customerSearch.length >= 2 && (
                    <div className="search-results">
                      <div className="search-result-item no-results">
                        No customers found
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowNewCustomerForm(true);
                      setNewCustomer(prev => ({
                        ...prev,
                        name: customerSearch // Populate name field with search text
                      }));
                    }}
                  >
                    + Add New Customer
                  </button>
                </div>
                
                {selectedCustomer && (
                  <div className="selected-customer mt-3">
                    <h3>Selected Customer:</h3>
                    <div className="customer-details">
                      <p><strong>Name:</strong> {selectedCustomer.name}</p>
                      <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                      <p><strong>Address:</strong> {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}</p>
                      {selectedCustomer.notes && (
                        <p><strong>Notes:</strong> {selectedCustomer.notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="new-customer-form">
                <h3>New Customer</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Customer Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newCustomer.name}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number:</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={newCustomer.phone}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newCustomer.email}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="type">Customer Type:</label>
                    <select
                      id="type"
                      name="type"
                      value={newCustomer.type}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                      required
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newCustomer.address}
                    onChange={handleNewCustomerChange}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="city">City:</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={newCustomer.city}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State:</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={newCustomer.state}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zip">ZIP Code:</label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={newCustomer.zip}
                      onChange={handleNewCustomerChange}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Customer Notes:</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={newCustomer.notes}
                    onChange={handleNewCustomerChange}
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>
                
                <div className="mt-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowNewCustomerForm(false);
                      setSelectedCustomer(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Work Order Details Section */}
          <div className="form-section">
            <h2>Work Order Details</h2>
            
            <div className="form-group">
              <label htmlFor="title">Work Order Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                required
                placeholder="e.g., AC Repair, Heating Maintenance"
              />
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="service_type">Service Type:</label>
                <select
                  id="service_type"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="repair">Repair</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="installation">Installation</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="service_date">Service Date:</label>
                <input
                  type="date"
                  id="service_date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time_preference">Preferred Time:</label>
                <select
                  id="time_preference"
                  name="time_preference"
                  value={formData.time_preference}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Required):</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="3"
                required
                placeholder="Describe the service needed or issue to be addressed"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Additional Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Any additional information for the technician"
              ></textarea>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/workorders')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderForm;

