// components/admin/WorkOrderDetail.jsx - Enhanced with clean design and smart scheduling
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { updateWorkOrderNotes } from '../../services/workOrderService';
import './WorkOrderDetail.css';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    technician: '',
    estimatedDuration: '2',
    specialInstructions: ''
  });

  
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
        
        // Pre-populate schedule data if available
        if (data.scheduled_date) {
          setScheduleData(prev => ({
            ...prev,
            scheduledDate: data.scheduled_date.split('T')[0],
            scheduledTime: data.scheduled_time || '',
            technician: data.assigned_technician || '',
            estimatedDuration: data.estimated_duration || '2',
            specialInstructions: data.special_instructions || ''
          }));
        }
        
      } catch (error) {
        console.error('Error in fetchWorkOrder:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrder();
  }, [id, navigate]);

  const handleScheduleSubmit = async () => {
  try {
    // Validate required fields
    if (!scheduleData.scheduledDate || !scheduleData.scheduledTime) {
      alert('Please select both date and time');
      return;
    }

    // Update work order with schedule details
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        status: 'scheduled',
        scheduled_date: `${scheduleData.scheduledDate}T${scheduleData.scheduledTime}:00`,
        scheduled_time: scheduleData.scheduledTime,
        assigned_technician: scheduleData.technician || null,
        estimated_duration: scheduleData.estimatedDuration || '2',
        special_instructions: scheduleData.specialInstructions || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error scheduling work order:', error);
      alert('Error scheduling work order: ' + error.message);
      return;
    }

    // Update local state
    setWorkOrder({ ...workOrder, ...data[0] });
    setShowScheduleModal(false);
    
    // Show success message
    alert('Work order scheduled successfully!');
    
  } catch (error) {
    console.error('Error scheduling work order:', error);
    alert('Error scheduling work order: ' + error.message);
  }
};

  

  const updateStatus = async (newStatus) => {
  try {
    const updateData = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Add started_at timestamp when starting job
    if (newStatus === 'in-progress') {
      updateData.started_at = new Date().toISOString();
    }
    
    // Add completed_at timestamp when completing
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating status:', error);
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

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      scheduled: 'status-scheduled',
      'in-progress': 'status-progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return classes[status] || 'status-default';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      normal: 'priority-normal',
      high: 'priority-high',
      emergency: 'priority-emergency'
    };
    return classes[priority] || 'priority-normal';
  };

  if (loading) {
    return (
      <div className="work-order-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="work-order-detail">
        <div className="empty-state">
          <h2>Work Order Not Found</h2>
          <p>The requested work order could not be located.</p>
          <Link to="/admin/workorders" className="btn btn-primary">
            Back to Work Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="work-order-detail">
      {/* Header Section */}
      <div className="detail-header">
        <div className="header-left">
          <div className="work-order-title">
            <h1>{workOrder.title}</h1>
            <div className="work-order-meta">
              <span className="work-order-number">
                Work Order #{workOrder.work_order_number || workOrder.id}
              </span>
              <span className={`status-badge ${getStatusClass(workOrder.status)}`}>
                {workOrder.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`priority-badge ${getPriorityClass(workOrder.priority)}`}>
                {workOrder.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            ✏️ Edit Details
          </button>
          <Link to="/admin/workorders" className="btn btn-secondary">
            ← Back to List
          </Link>
        </div>
      </div>

      <div className="detail-content">
        {/* Customer Card */}
        <div className="detail-card customer-card">
          <div className="card-header">
            <h2>👤 Customer Information</h2>
            <Link to={`/admin/customers/${workOrder.customers.id}`} className="btn btn-sm btn-outline">
              View Profile
            </Link>
          </div>
          <div className="card-content">
            <div className="customer-info">
              <div className="customer-name">
                <h3>{workOrder.customers.name}</h3>
                <span className="customer-type">
                  {workOrder.customers.type === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                </span>
              </div>
              
              <div className="contact-grid">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <label>Phone</label>
                    <a href={`tel:${workOrder.customers.phone}`} className="contact-value">
                      {workOrder.customers.phone}
                    </a>
                  </div>
                </div>
                
                {workOrder.customers.email && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <label>Email</label>
                      <a href={`mailto:${workOrder.customers.email}`} className="contact-value">
                        {workOrder.customers.email}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="contact-item address-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <label>Address</label>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${workOrder.customers.address}, ${workOrder.customers.city}, ${workOrder.customers.state} ${workOrder.customers.zip}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-value address-link"
                    >
                      {workOrder.customers.address}<br />
                      {workOrder.customers.city}, {workOrder.customers.state} {workOrder.customers.zip}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="detail-card service-card">
          <div className="card-header">
            <h2>🔧 Service Details</h2>
            <div className="service-dates">
              {workOrder.scheduled_date ? (
                <span className="scheduled-date">
                  📅 Scheduled: {formatDate(workOrder.scheduled_date)}
                </span>
              ) : (
                <span className="requested-date">
                  📋 Requested: {formatDate(workOrder.service_date)}
                </span>
              )}
            </div>
          </div>
          <div className="card-content">
            <div className="service-grid">
              <div className="service-item">
                <label>Service Type</label>
                <span className="service-value">
                  {workOrder.service_type.charAt(0).toUpperCase() + workOrder.service_type.slice(1)}
                </span>
              </div>
              
              <div className="service-item">
                <label>Original Request Date</label>
                <span className="service-value">
                  {formatDate(workOrder.service_date)}
                </span>
              </div>
              
              {workOrder.scheduled_date && (
                <div className="service-item">
                  <label>Scheduled Date & Time</label>
                  <span className="service-value">
                    {formatDate(workOrder.scheduled_date)}
                    {workOrder.scheduled_time && ` at ${workOrder.scheduled_time}`}
                  </span>
                </div>
              )}
              
              <div className="service-item">
                <label>Time Preference</label>
                <span className="service-value">
                  {workOrder.time_preference === 'morning' ? 'Morning (8AM - 12PM)' :
                  workOrder.time_preference === 'afternoon' ? 'Afternoon (12PM - 5PM)' : 'Anytime'}
                </span>
              </div>
              
              {workOrder.assigned_technician && (
                <div className="service-item">
                  <label>Assigned Technician</label>
                  <span className="service-value">{workOrder.assigned_technician}</span>
                </div>
              )}
              
              {workOrder.estimated_duration && (
                <div className="service-item">
                  <label>Estimated Duration</label>
                  <span className="service-value">{workOrder.estimated_duration} hours</span>
                </div>
              )}
            </div>
            
            <div className="description-section">
              <label>Description</label>
              <div className="description-content">
                {workOrder.description}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Notes Card */}
        <div className="detail-card notes-card">
          <div className="card-header">
            <h2>📝 Technical Notes</h2>
            <button 
              className="btn btn-sm btn-outline" 
              onClick={() => setEditingNotes(true)}
            >
              {workOrder.notes ? 'Edit Notes' : 'Add Notes'}
            </button>
          </div>
          <div className="card-content">
            {editingNotes ? (
              <div className="notes-editor">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add technical notes, findings, parts used, completion details..."
                  rows="6"
                  className="notes-textarea"
                />
                <div className="notes-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setNotesValue(workOrder.notes || '');
                      setEditingNotes(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('work_orders')
                          .update({ notes: notesValue })
                          .eq('id', id);
                        
                        if (error) throw error;
                        
                        setWorkOrder({ ...workOrder, notes: notesValue });
                        setEditingNotes(false);
                      } catch (error) {
                        alert('Error updating notes: ' + error.message);
                      }
                    }}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="notes-display">
                {workOrder.notes ? (
                  <pre className="notes-content">{workOrder.notes}</pre>
                ) : (
                  <div className="no-notes">
                    <span className="no-notes-icon">📄</span>
                    <p>No technical notes added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status & Actions Card */}
        <div className="detail-card status-card">
          <div className="card-header">
            <h2>⚡ Status & Actions</h2>
            <div className="status-info">
              <span>Created {formatTimestamp(workOrder.created_at)}</span>
            </div>
          </div>
          <div className="card-content">
            <div className="status-timeline">
              <div className="timeline-item completed">
                <div className="timeline-marker">✓</div>
                <div className="timeline-content">
                  <span className="timeline-label">Created: </span>
                  <span className="timeline-date">{formatTimestamp(workOrder.created_at)}</span>
                </div>
              </div>
              
              {workOrder.status !== 'pending' && (
                <div className={`timeline-item ${workOrder.status === 'scheduled' || workOrder.status === 'in-progress' || workOrder.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-marker">📅</div>
                  <div className="timeline-content">
                    <span className="timeline-label">Scheduled: </span>
                    <span className="timeline-date">
                      {workOrder.scheduled_date ? formatTimestamp(workOrder.scheduled_date) : 'Pending'}
                    </span>
                  </div>
                </div>
              )}
              
              {(workOrder.status === 'in-progress' || workOrder.status === 'completed') && (
                <div className={`timeline-item ${workOrder.status === 'in-progress' || workOrder.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-marker">🔧</div>
                  <div className="timeline-content">
                    <span className="timeline-label">In Progress: </span>
                    <span className="timeline-date">
                      {workOrder.started_at ? formatTimestamp(workOrder.started_at) : 'Not started'}
                    </span>
                  </div>
                </div>
              )}
              
              {workOrder.status === 'completed' && (
                <div className="timeline-item completed">
                  <div className="timeline-marker">✅</div>
                  <div className="timeline-content">
                    <span className="timeline-label">Completed</span>
                    <span className="timeline-date">{formatTimestamp(workOrder.completed_at)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="action-buttons">
              {workOrder.status === 'pending' && (
                <>
                  <button 
                    className="btn btn-primary action-btn"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    📅 Schedule Appointment
                  </button>
                  <button 
                    className="btn btn-success action-btn"
                    onClick={() => updateStatus('in-progress')}
                  >
                    🚀 Start Job Now
                  </button>
                </>
              )}
              
              {workOrder.status === 'scheduled' && (
                <button 
                  className="btn btn-success action-btn"
                  onClick={() => updateStatus('in-progress')}
                >
                  🚀 Start Job
                </button>
              )}
              
              {workOrder.status === 'in-progress' && (
                <button 
                  className="btn btn-success action-btn"
                  onClick={() => updateStatus('completed')}
                >
                  ✅ Mark Complete
                </button>
              )}
              
              {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                <button 
                  className="btn btn-danger action-btn"
                  onClick={() => updateStatus('cancelled')}
                >
                  ❌ Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Schedule Appointment</h2>
              <button 
                className="modal-close"
                onClick={() => setShowScheduleModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="schedule-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={scheduleData.scheduledDate}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Time</label>
                    <select
                      value={scheduleData.scheduledTime}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="form-control"
                    >
                      <option value="">Select time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned Technician</label>
                    <select
                      value={scheduleData.technician}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, technician: e.target.value }))}
                      className="form-control"
                    >
                      <option value="">Select technician</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                      <option value="Dave Wilson">Dave Wilson</option>
                      <option value="Tom Brown">Tom Brown</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Estimated Duration</label>
                    <select
                      value={scheduleData.estimatedDuration}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="form-control"
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="8">Full day</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    value={scheduleData.specialInstructions}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    placeholder="Any special instructions for the technician..."
                    rows="3"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleScheduleSubmit}
                disabled={!scheduleData.scheduledDate || !scheduleData.scheduledTime}
              >
                📅 Schedule & Create Calendar Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetail;