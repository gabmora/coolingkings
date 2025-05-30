// components/admin/CustomerForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import '../admin/AdminStyles.css';

const CustomerForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bluffton',
    state: 'SC',
    zip: '',
    type: 'residential',
    notes: '',
    // Add HVAC equipment fields
    has_indoor_unit: false, 
    has_outdoor_unit: false,
    unit_brand: '',
    unit_model: '',
    unit_serial: '',
    install_date: '',
    refrigerant_type: '',
    tonnage: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Insert customer data into Supabase
      const { data, error } = await supabase
        .from('customers')
        .insert([formData])
        .select();
      
      if (error) {
        alert('Error creating customer: ' + error.message);
        return;
      }
      
      // Navigate to customer list on success
      navigate('/admin/customers');
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-container">
     
   
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Customer Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Customer Type</label>
              <select
                id="type"
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zip">ZIP Code</label>
              <input
                type="text"
                id="zip"
                name="zip"
                className="form-control"
                value={formData.zip}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* HVAC Equipment Section */}
            <div className="section">
            <h3>HVAC Equipment Details</h3>
            
            <div className="form-grid">
                <div className="form-group">
                <label>Equipment Type</label>
                <div className="checkbox-group">
                    <label>
                    <input
                        type="checkbox"
                        checked={formData.has_indoor_unit}
                        onChange={(e) => setFormData(prev => ({
                        ...prev,
                        has_indoor_unit: e.target.checked
                        }))}
                    />
                    Indoor Unit
                    </label>
                    <label>
                    <input
                        type="checkbox"
                        checked={formData.has_outdoor_unit}
                        onChange={(e) => setFormData(prev => ({
                        ...prev,
                        has_outdoor_unit: e.target.checked
                        }))}
                    />
                    Outdoor Unit
                    </label>
                </div>
                </div>
                
                <div className="form-group">
                <label htmlFor="unit_brand">Brand</label>
                <input
                    type="text"
                    id="unit_brand"
                    name="unit_brand"
                    className="form-control"
                    value={formData.unit_brand}
                    onChange={handleChange}
                />
                </div>
            </div>
            
            <div className="form-grid">
                <div className="form-group">
                <label htmlFor="unit_model">Model Number</label>
                <input
                    type="text"
                    id="unit_model"
                    name="unit_model"
                    className="form-control"
                    value={formData.unit_model}
                    onChange={handleChange}
                />
                </div>
                
                <div className="form-group">
                <label htmlFor="unit_serial">Serial Number</label>
                <input
                    type="text"
                    id="unit_serial"
                    name="unit_serial"
                    className="form-control"
                    value={formData.unit_serial}
                    onChange={handleChange}
                />
                </div>
            </div>
            
            <div className="form-grid">
                <div className="form-group">
                <label htmlFor="install_date">Installation Date</label>
                <input
                    type="date"
                    id="install_date"
                    name="install_date"
                    className="form-control"
                    value={formData.install_date}
                    onChange={handleChange}
                />
                </div>
                
                <div className="form-group">
                <label htmlFor="refrigerant_type">Refrigerant Type</label>
                <select
                    id="refrigerant_type"
                    name="refrigerant_type"
                    className="form-control"
                    value={formData.refrigerant_type}
                    onChange={handleChange}
                >
                    <option value="">Select Refrigerant</option>
                    <option value="R-22">R-22 (HCFC-22)</option>
                    <option value="R-410A">R-410A (Puron)</option>
                    <option value="R-32">R-32</option>
                    <option value="R-134a">R-134a</option>
                    <option value="R-407C">R-407C</option>
                    <option value="other">Other</option>
                </select>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="tonnage">Tonnage</label>
                <select
                id="tonnage"
                name="tonnage"
                className="form-control"
                value={formData.tonnage}
                onChange={handleChange}
                >
                <option value="">Select Tonnage</option>
                <option value="1.5">1.5 Ton</option>
                <option value="2">2 Ton</option>
                <option value="2.5">2.5 Ton</option>
                <option value="3">3 Ton</option>
                <option value="3.5">3.5 Ton</option>
                <option value="4">4 Ton</option>
                <option value="5">5 Ton</option>
                <option value="other">Other</option>
                </select>
            </div>
            </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/admin/customers')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;