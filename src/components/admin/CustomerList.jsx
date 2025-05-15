// components/admin/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import '../admin/AdminStyles.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        // Fetch customers from Supabase
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching customers:', error);
          return;
        }
        
        setCustomers(data || []);
        setFilteredCustomers(data || []);
      } catch (error) {
        console.error('Error in fetchCustomers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Filter customers when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  return (
    
    <div className="admin-container">
        <div className="admin-header">
            <h1>Work Order Details</h1>
            <div>
                <button 
                className="btn btn-secondary" 
                style={{ marginRight: '10px' }}
                >
                Dashboard
                </button>
                
            </div>
            </div>
      <div className="admin-header">
        <h1>Customer Management</h1>
        <Link to="/admin/customers/new" className="btn btn-primary">
          Add New Customer
        </Link>
        <Link to="/admin" className="btn btn-secondary">
          Dashboard
        </Link>
      </div>
      
      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search customers by name, phone, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="loading">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? 'No customers match your search' : 'No customers found. Add your first customer!'}
          </div>
        ) : (
          <div className="customer-list">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="customer-card">
                <div className="customer-header">
                  <h3>{customer.name}</h3>
                  <span className="customer-type-badge">
                    {customer.type === 'residential' ? 'Residential' : 'Commercial'}
                  </span>
                </div>
                <div className="customer-details">
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {customer.address}, {customer.city}, {customer.state} {customer.zip}</p>
                </div>
                <div className="customer-actions">
                  <Link to={`/admin/customers/${customer.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                  <Link to={`/admin/workorders/new?customer=${customer.id}`} className="btn btn-success btn-sm">
                    Create Work Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;