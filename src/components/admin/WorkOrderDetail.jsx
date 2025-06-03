// components/admin/WorkOrderDetail.jsx - Updated with work order number and better notes handling
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { updateWorkOrderNotes } from '../../services/workOrderService';
import '../admin/AdminStyles.css';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    service_date: '',
    time_preference: '',
    service_type: '',
    priority: '',
    description: '',
    notes: ''
  });
  
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        
        // Fetch work order with customer info
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (
              *
            )
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching work order:', error);
          navigate('/admin/workorders');
          return;
        }
        
        setWorkOrder(data);
        setNotesValue(data.notes || '');
        setFormData({
          title: data.title,
          service_date: data.service_date,
          time_preference: data.time_preference,
          service_type: data.service_type,
          priority: data.priority,
          description: data.description,
          notes: data.notes || ''
        });
        
      } catch (error) {
        console.error('Error in fetchWorkOrder:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrder();
  }, [id, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update work order in Supabase
      const { data, error } = await supabase
        .from('work_orders')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) {
        alert('Error updating work order: ' + error.message);
        return;
      }
      
      // Update local state with updated work order
      setWorkOrder({
        ...workOrder,
        ...data[0]
      });
      
      setEditing(false);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An unexpected error occurred');
    }
  };

  // Handle notes update separately
  const handleNotesUpdate = async () => {
    try {
      const updatedOrder = await updateWorkOrderNotes(id, notesValue);
      if (updatedOrder) {
        setWorkOrder({
          ...workOrder,
          ...updatedOrder
        });
        setEditingNotes(false);
      } else {
        alert('Error updating notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('An unexpected error occurred');
    }
  };

  const deleteWorkOrder = async () => {
    if (window.confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('work_orders')
          .delete()
          .eq('id', id);
        
        if (error) {
          alert('Error deleting work order: ' + error.message);
          return;
        }
        
        // Redirect back to work orders list
        navigate('/admin/workorders');
        
      } catch (error) {
        console.error('Error in deleteWorkOrder:', error);
        alert('An unexpected error occurred');
      }
    }
  };
  
  const updateStatus = async (newStatus) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}),
          ...(newStatus === 'in-progress' ? { started_at: new Date().toISOString() } : {})
        })
        .eq('id', id)
        .select();
      
      if (error) {
        alert('Error updating status: ' + error.message);
        return;
      }
      
      // Update local state
      setWorkOrder({
        ...workOrder,
        ...data[0]
      });
      
    } catch (error) {
      console.error('Error in updateStatus:', error);
      alert('An unexpected error occurred');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get status badge class
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
  
  // Get time preference display
  const getTimeDisplay = (timePreference) => {
    switch (timePreference) {
      case 'morning': return 'Morning (8AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 5PM)';
      case 'anytime': return 'Anytime';
      default: return timePreference;
    }
  };

  return (
    <div className="admin-container">
      {loading ? (
        <div className="loading">Loading work order details...</div>
      ) : workOrder ? (
        <>
          <div className="card">
            <div className="work-order-header">
              <div>
                <h2>{workOrder.title}</h2>
                {workOrder.work_order_number && (
                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    Work Order: <strong>{workOrder.work_order_number}</strong>
                  </p>
                )}
              </div>
              <span className={`badge ${getStatusClass(workOrder.status)}`}>
                {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
              </span>
            </div>
            
            {/* Customer Information */}
            <div className="section">
              <h3>Customer Information</h3>
              <div className="customer-details">
                <h4>{workOrder.customers.name}</h4>
                <div className="form-grid">
                  <div>
                    <p><strong>Phone:</strong> {workOrder.customers.phone}</p>
                    <p><strong>Email:</strong> {workOrder.customers.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p>
                      <strong>Address:</strong> 
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${workOrder.customers.address}, ${workOrder.customers.city}, ${workOrder.customers.state} ${workOrder.customers.zip}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        {workOrder.customers.address}, {workOrder.customers.city}, {workOrder.customers.state} {workOrder.customers.zip}
                      </a>
                    </p>
                  </div>
                </div>
                
                <Link to={`/admin/customers/${workOrder.customers.id}`} className="btn btn-text">
                  View Customer Details
                </Link>
              </div>
            </div>
            
            {/* Work Order Details */}
            {editing ? (
              <form onSubmit={handleSubmit}>
                <div className="section">
                  <h3>Edit Work Order</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="title">Work Order Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="service_type">Service Type</label>
                      <select
                        id="service_type"
                        name="service_type"
                        className="form-control"
                        value={formData.service_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="repair">Repair</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="installation">Installation</option>
                        <option value="inspection">Inspection</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="service_date">Service Date</label>
                      <input
                        type="date"
                        id="service_date"
                        name="service_date"
                        className="form-control"
                        value={formData.service_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="time_preference">Preferred Time</label>
                      <select
                        id="time_preference"
                        name="time_preference"
                        className="form-control"
                        value={formData.time_preference}
                        onChange={handleChange}
                        required
                      >
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      className="form-control"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setFormData({
                          title: workOrder.title,
                          service_date: workOrder.service_date,
                          time_preference: workOrder.time_preference,
                          service_type: workOrder.service_type,
                          priority: workOrder.priority,
                          description: workOrder.description,
                          notes: workOrder.notes || ''
                        });
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
                </div>
              </form>
            ) : (
              <div className="section">
                <h3>Work Order Details</h3>
                
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Service Date:</div>
                    <div className="detail-value">{formatDate(workOrder.service_date)}</div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Preferred Time:</div>
                    <div className="detail-value">{getTimeDisplay(workOrder.time_preference)}</div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Service Type:</div>
                    <div className="detail-value">
                      {workOrder.service_type.charAt(0).toUpperCase() + workOrder.service_type.slice(1)}
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Priority:</div>
                    <div className="detail-value">
                      {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Description:</div>
                  <div className="detail-value">{workOrder.description}</div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setEditing(true)}
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            )}

            {/* Notes Section - Separate from main form */}
            <div className="section">
              <h3>Technical Notes</h3>
              {editingNotes ? (
                <div>
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows="6"
                      placeholder="Add technical notes, findings, parts used, etc..."
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setNotesValue(workOrder.notes || '');
                        setEditingNotes(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleNotesUpdate}
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="detail-item">
                    <div className="detail-value" style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      minHeight: '100px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {workOrder.notes || 'No notes added yet.'}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setEditingNotes(true)}
                    >
                      Edit Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Timeline */}
            <div className="section">
              <h3>Status</h3>
              
              <div className="status-timeline">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatTimestamp(workOrder.created_at)}</div>
                    <p>Work order created</p>
                  </div>
                </div>
                
                {workOrder.status !== 'pending' && (
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">{formatTimestamp(workOrder.updated_at)}</div>
                      <p>Status updated to {workOrder.status}</p>
                    </div>
                  </div>
                )}
                
                {workOrder.completed_at && (
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">{formatTimestamp(workOrder.completed_at)}</div>
                      <p>Work order completed</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="status-actions">
                {/* Status-specific buttons */}
                {workOrder.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => updateStatus('scheduled')}
                    >
                      Schedule
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={() => updateStatus('in-progress')}
                    >
                      Start Job
                    </button>
                  </>
                )}
                
                {workOrder.status === 'scheduled' && (
                  <button 
                    className="btn btn-success" 
                    onClick={() => updateStatus('in-progress')}
                  >
                    Start Job
                  </button>
                )}
                
                {workOrder.status === 'in-progress' && (
                  <button 
                    className="btn btn-success" 
                    onClick={() => updateStatus('completed')}
                  >
                    Complete
                  </button>
                )}
                
                {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                  <button 
                    className="btn btn-danger" 
                    onClick={() => updateStatus('cancelled')}
                  >
                    Cancel
                  </button>
                )}
                
                {workOrder.status === 'completed' && (
                  <button 
                    className="btn btn-success" 
                    disabled
                  >
                    Completed
                  </button>
                )}

                {/* Delete button - displayed regardless of status */}
                <button 
                  className="btn btn-danger" 
                  onClick={deleteWorkOrder}
                  style={{ marginLeft: 'auto' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p>Work order not found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetail;