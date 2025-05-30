// components/admin/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import '../admin/CustomerList.css';

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
      <div className="customer-list-header">
        <h1>Customer Directory</h1>
        <div className="customer-count">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input enhanced"
              placeholder="Search by name, phone, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>
        {searchTerm && (
          <div className="search-info">
            Showing results for "{searchTerm}"
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="empty-state enhanced">
          <div className="empty-icon">👥</div>
          <h3>{searchTerm ? 'No customers found' : 'No customers yet'}</h3>
          <p>{searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started!'}</p>
        </div>
      ) : (
        <div className="customer-table-container">
          <div className="customer-table">
            <div className="table-header">
              <div className="header-cell name-col">Customer</div>
              <div className="header-cell contact-col">Contact</div>
              <div className="header-cell address-col">Address</div>
              <div className="header-cell actions-col">Actions</div>
            </div>
            
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="customer-row">
                <div className="row-cell name-col">
                  <div className="customer-name-section">
                    <h3 className="customer-name">{customer.name}</h3>
                    <span className={`customer-type-badge ${customer.type}`}>
                      {customer.type === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                    </span>
                  </div>
                </div>
                
                <div className="row-cell contact-col">
                                      <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <span className="contact-value">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="contact-item">
                        <span className="contact-icon">✉️</span>
                        <span className="contact-value">{customer.email}</span>
                      </div>
                    )}
                  
                </div>
                
                <div className="row-cell address-col">
                  <div className="address-info">
                    <span className="address-icon">📍</span>
                    <span className="address-text">
                      {customer.address}, {customer.city}, {customer.state} {customer.zip}
                    </span>
                  </div>
                </div>
                
                <div className="row-cell actions-col">
                  <div className="customer-actions">
                    <Link to={`/admin/customers/${customer.id}`} className="btn btn-outline btn-sm">
                      View
                    </Link>
                    <Link to={`/admin/workorders/new?customer=${customer.id}`} className="btn btn-primary btn-sm">
                      Work Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;