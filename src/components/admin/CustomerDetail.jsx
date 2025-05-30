// components/admin/CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import '../admin/CustomerDetails.css';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    type: '',
    notes: '',
    // HVAC equipment fields
    has_indoor_unit: false,
    has_outdoor_unit: false,
    unit_brand: '',
    unit_model: '',
    unit_serial: '',
    install_date: '',
    refrigerant_type: '',
    tonnage: '',
    photos: []
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
        setFormData({
          ...customerData,
          has_indoor_unit: customerData.has_indoor_unit || false,
          has_outdoor_unit: customerData.has_outdoor_unit || false,
          unit_brand: customerData.unit_brand || '',
          unit_model: customerData.unit_model || '',
          unit_serial: customerData.unit_serial || '',
          install_date: customerData.install_date || '',
          refrigerant_type: customerData.refrigerant_type || '',
          tonnage: customerData.tonnage || '',
          photos: customerData.photos || []
        });
        
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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setUploadStatus('Uploading...');
    
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        // Create a unique file path in the storage bucket
        const filePath = `customers/${id}/${Date.now()}_${file.name}`;
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('customerphotos')
          .upload(filePath, file);
        
        if (error) {
          throw error;
        }
        
        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('customer_photos')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(urlData.publicUrl);
      }
      
      // Update the form data with the new photos
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploadedUrls]
      }));
      
      setUploadStatus('Uploaded successfully');
      
      // Clear the status after a few seconds
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };
  
  const removePhoto = (index) => {
    setFormData(prev => {
      const updatedPhotos = [...prev.photos];
      updatedPhotos.splice(index, 1);
      return { ...prev, photos: updatedPhotos };
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const deleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);
        
        if (error) {
          alert('Error deleting customer: ' + error.message);
          return;
        }
        
        // Redirect back to customers list
        navigate('/admin/customers');
        
      } catch (error) {
        console.error('Error in deleteCustomer:', error);
        alert('An unexpected error occurred');
      }
    }
  };

  return (
  <div className="admin-container">
    {loading ? (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading customer details...</p>
      </div>
    ) : customer ? (
      <>
        {/* Customer Profile Header */}
        <div className="profile-header">
          <div className="profile-title">
            <h1>{customer.name}</h1>
            <span className={`profile-badge ${customer.type}`}>
              {customer.type === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
            </span>
          </div>
          <div className="profile-actions">
            {!editing && (
              <>
                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>
                <button className="btn btn-danger" onClick={deleteCustomer}>
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>📋 Basic Information</h2>
              <div className="form-row">
                <div className="form-field">
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
                <div className="form-field">
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
              
              <div className="form-row">
                <div className="form-field">
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
                <div className="form-field">
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

              <div className="form-field full-width">
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
              
              <div className="form-row">
                <div className="form-field">
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
                <div className="form-field">
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
                <div className="form-field">
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
              
              <div className="form-field full-width">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional notes about this customer..."
                ></textarea>
              </div>
            </div>

            {/* HVAC Equipment Section */}
            <div className="form-section">
              <h2>🔧 HVAC Equipment</h2>
              
              <div className="form-row">
                <div className="form-field">
                  <label>Equipment Type</label>
                  <div className="checkbox-row">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.has_indoor_unit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          has_indoor_unit: e.target.checked
                        }))}
                      />
                      <span>Indoor Unit</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.has_outdoor_unit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          has_outdoor_unit: e.target.checked
                        }))}
                      />
                      <span>Outdoor Unit</span>
                    </label>
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="unit_brand">Brand</label>
                  <input
                    type="text"
                    id="unit_brand"
                    name="unit_brand"
                    className="form-control"
                    value={formData.unit_brand}
                    onChange={handleChange}
                    placeholder="e.g., Carrier, Trane, Lennox"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
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
                <div className="form-field">
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
              
              <div className="form-row">
                <div className="form-field">
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
                <div className="form-field">
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
                <div className="form-field">
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
            </div>

            {/* Photo Upload Section */}
            <div className="form-section">
              <h2>📸 Equipment Photos</h2>
              
              <div className="upload-area">
                <input
                  type="file"
                  id="photos"
                  name="photos"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="photos" className="upload-button">
                  <span className="upload-icon">📁</span>
                  <span>Add Photos</span>
                </label>
                
                {uploadStatus && (
                  <div className="upload-status">{uploadStatus}</div>
                )}
              </div>
              
              {formData.photos && formData.photos.length > 0 ? (
                <div className="photo-grid">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)} 
                        alt={`HVAC unit ${index + 1}`} 
                      />
                      <button 
                        type="button" 
                        className="remove-photo" 
                        onClick={() => removePhoto(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content">No photos uploaded</p>
              )}
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
              <button type="submit" className="btn btn-primary">
                💾 Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <>
            <div className="profile-content">
              <div className="info-section">
                <h2>📋 Contact Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p>{customer.phone}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p>{customer.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-icon">📍</span>
                    <div>
                      <strong>Address</strong>
                      <p>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="map-link"
                        >
                          {customer.address}, {customer.city}, {customer.state} {customer.zip}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                {customer.notes && (
                  <div className="notes-section">
                    <h3>📝 Notes</h3>
                    <p>{customer.notes}</p>
                  </div>
                )}
              </div>

              <div className="info-section">
                <h2>🔧 HVAC Equipment</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-icon">⚙️</span>
                    <div>
                      <strong>Equipment Type</strong>
                      <p>
                        {customer.has_indoor_unit && customer.has_outdoor_unit ? 'Indoor & Outdoor Units' : 
                         customer.has_indoor_unit ? 'Indoor Unit' : 
                         customer.has_outdoor_unit ? 'Outdoor Unit' : 'No units specified'}
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🏷️</span>
                    <div>
                      <strong>Brand</strong>
                      <p>{customer.unit_brand || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🔢</span>
                    <div>
                      <strong>Model</strong>
                      <p>{customer.unit_model || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🏷️</span>
                    <div>
                      <strong>Serial Number</strong>
                      <p>{customer.unit_serial || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <div>
                      <strong>Install Date</strong>
                      <p>{formatDate(customer.install_date)}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">❄️</span>
                    <div>
                      <strong>Refrigerant</strong>
                      <p>{customer.refrigerant_type || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">⚖️</span>
                    <div>
                      <strong>Tonnage</strong>
                      <p>{customer.tonnage ? `${customer.tonnage} Ton` : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h2>📸 Equipment Photos</h2>
                {customer.photos && customer.photos.length > 0 ? (
                  <div className="photo-gallery">
                    {customer.photos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <a href={photo} target="_blank" rel="noopener noreferrer">
                          <img src={photo} alt={`HVAC unit ${index + 1}`} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-content">No photos available</p>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Work Order History */}
        <div className="work-orders-section">
          <div className="section-header">
            <h2>📋 Work Order History</h2>
            <Link to={`/admin/workorders/new?customer=${id}`} className="btn btn-primary">
              ➕ New Work Order
            </Link>
          </div>
          
          {workOrders.length === 0 ? (
            <div className="empty-state">
              <p>No work orders found for this customer.</p>
            </div>
          ) : (
            <div className="work-order-list">
              {workOrders.map(order => (
                <div key={order.id} className="work-order-card">
                  <div className="work-order-header">
                    <h3>{order.title}</h3>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="work-order-details">
                    <p><strong>Service Date:</strong> {formatDate(order.service_date)}</p>
                    <p><strong>Service Type:</strong> {order.service_type.charAt(0).toUpperCase() + order.service_type.slice(1)}</p>
                    <p><strong>Description:</strong> {order.description}</p>
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
      <div className="empty-state">
        <h2>Customer not found</h2>
        <p>The requested customer could not be located.</p>
      </div>
    )}
  </div>
);
};

export default CustomerDetail;