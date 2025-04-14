// components/admin/CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import '../admin/AdminStyles.css';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    type: '',
    notes: ''
  });
  
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        
        // Fetch customer data
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();
        
        if (customerError) {
          console.error('Error fetching customer:', customerError);
          navigate('/admin/customers');
          return;
        }
        
        setCustomer(customerData);
        setFormData(customerData);
        
        // Fetch related work orders
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false });
        
        if (workOrderError) {
          console.error('Error fetching work orders:', workOrderError);
        } else {
          setWorkOrders(workOrderData || []);
        }
        
      } catch (error) {
        console.error('Error in fetchCustomer:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update customer data in Supabase
      const { data, error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', id)
        .select();
      
      if (error) {
        alert('Error updating customer: ' + error.message);
        return;
      }
      
      setCustomer(data[0]);
      setEditing(false);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An unexpected error occurred');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'scheduled': return 'badge-info';
      case 'in-progress': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Customer Details</h1>
        <div>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/admin/customers')}
            style={{ marginRight: '10px' }}
          >
            Back to Customers
          </button>
          <Link 
            to={`/admin/workorders/new?customer=${id}`} 
            className="btn btn-primary"
          >
            Create Work Order
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading customer details...</div>
      ) : customer ? (
        <>
          <div className="card">
            {editing ? (
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
                      value={formData.email || ''}
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
                      value={formData.zip || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setFormData(customer);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="customer-header">
                  <h2>{customer.name}</h2>
                  <span className="customer-type-badge">
                    {customer.type === 'residential' ? 'Residential' : 'Commercial'}
                  </span>
                </div>
                
                <div className="form-grid">
                  <div>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Address:</strong> {customer.address}</p>
                    <p><strong>City/State/ZIP:</strong> {customer.city}, {customer.state} {customer.zip}</p>
                  </div>
                </div>
                
                {customer.notes && (
                  <div className="customer-notes">
                    <h3>Notes</h3>
                    <p>{customer.notes}</p>
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setEditing(true)}
                  >
                    Edit Customer
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="section-header">
            <h2>Work Order History</h2>
            <Link to={`/admin/workorders/new?customer=${id}`} className="btn btn-text">
              Create New Work Order
            </Link>
          </div>
          
          <div className="card">
            {workOrders.length === 0 ? (
              <div className="empty-state">
                <p>No work orders found for this customer.</p>
              </div>
            ) : (
              <div className="work-order-list">
                {workOrders.map(order => (
                  <div key={order.id} className="work-order-item">
                    <div className="work-order-header">
                      <h3>{order.title}</h3>
                      <span className={`badge ${getStatusClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="work-order-details">
                      <div className="detail-row">
                        <div className="detail-label">Service Date:</div>
                        <div className="detail-value">{formatDate(order.service_date)}</div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-label">Service Type:</div>
                        <div className="detail-value">
                          {order.service_type.charAt(0).toUpperCase() + order.service_type.slice(1)}
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-label">Description:</div>
                        <div className="detail-value">{order.description}</div>
                      </div>
                    </div>
                    <div className="work-order-actions">
                      <Link to={`/admin/workorders/${order.id}`} className="btn btn-primary btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p>Customer not found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;