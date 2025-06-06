// src/components/admin/AdminCalendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../../services/supabase';
import './AdminCalendar.css';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const calendarRef = useRef(null);

  // Color coding for different statuses and techs
  const getEventColor = (workOrder) => {
    // Priority colors
    if (workOrder.priority === 'emergency') return '#dc3545'; // Red
    if (workOrder.priority === 'high') return '#fd7e14'; // Orange
    
    // Tech colors
        if (workOrder.technician_id) {
        const tech = technicians.find(t => t.id === workOrder.technician_id);
        if (tech?.name.toLowerCase().includes('keats')) return '#20c997'; // Teal/Green
        if (tech?.name.toLowerCase().includes('ell')) return '#007bff'; // Blue
        }

        // Status colors
        switch (workOrder.status) {
        case 'scheduled': return '#6f42c1'; // Purple
        case 'in-progress': return '#ffc107'; // Yellow
        case 'completed': return '#28a745'; // Green
        case 'cancelled': return '#6c757d'; // Gray
        default: return '#17a2b8'; // Teal for pending
        }
  };

// Create Work Order Modal Component
const CreateWorkOrderModal = ({ selectedDateInfo, technicians, onSave, onCancel }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    service_date: selectedDateInfo?.date || new Date().toISOString().split('T')[0],
    scheduled_start_time: selectedDateInfo?.startTime || '08:00:00',
    scheduled_end_time: selectedDateInfo?.endTime || '17:00:00',
    service_type: 'repair',
    priority: 'normal',
    description: '',
    technician_id: '',
    status: 'pending'
  });

  // Fetch customers for search
  useEffect(() => {
    const fetchCustomers = async () => {
      if (searchTerm.length >= 2) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .limit(10);
        setCustomers(data || []);
      }
    };
    fetchCustomers();
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
    onSave({
      ...formData,
      customer_id: selectedCustomer.id
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Appointment</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-content">
          {/* Customer Search */}
          <div className="form-group">
            <label>Customer *</label>
            <input
              type="text"
              placeholder="Search customer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
            {customers.length > 0 && (
              <div className="customer-results">
                {customers.map(customer => (
                  <div 
                    key={customer.id}
                    className={`customer-result-item ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <strong>{customer.name}</strong> - {customer.phone}
                  </div>
                ))}
              </div>
            )}
            {selectedCustomer && (
              <div className="selected-customer">
                Selected: <strong>{selectedCustomer.name}</strong> - {selectedCustomer.phone}
              </div>
            )}
          </div>

          {/* Work Order Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Service Type *</label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData(prev => ({...prev, service_type: e.target.value}))}
                className="form-control"
                required
              >
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
                <option value="ductwork">Ductwork</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData(prev => ({...prev, service_date: e.target.value}))}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                value={formData.scheduled_start_time}
                onChange={(e) => setFormData(prev => ({...prev, scheduled_start_time: e.target.value}))}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                value={formData.scheduled_end_time}
                onChange={(e) => setFormData(prev => ({...prev, scheduled_end_time: e.target.value}))}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value}))}
                className="form-control"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label>Technician</label>
              <select
                value={formData.technician_id}
                onChange={(e) => setFormData(prev => ({...prev, technician_id: e.target.value}))}
                className="form-control"
              >
                <option value="">Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              className="form-control"
              rows="3"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Work Order Modal Component
const EditWorkOrderModal = ({ workOrder, technicians, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: workOrder.title || '',
    service_date: workOrder.service_date || '',
    scheduled_start_time: workOrder.scheduled_start_time || '08:00:00',
    scheduled_end_time: workOrder.scheduled_end_time || '17:00:00',
    service_type: workOrder.service_type || 'repair',
    priority: workOrder.priority || 'normal',
    description: workOrder.description || '',
    technician_id: workOrder.technician_id || '',
    status: workOrder.status || 'pending',
    notes: workOrder.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Appointment</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Service Type *</label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData(prev => ({...prev, service_type: e.target.value}))}
                className="form-control"
                required
              >
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
                <option value="ductwork">Ductwork</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData(prev => ({...prev, service_date: e.target.value}))}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                value={formData.scheduled_start_time}
                onChange={(e) => setFormData(prev => ({...prev, scheduled_start_time: e.target.value}))}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                value={formData.scheduled_end_time}
                onChange={(e) => setFormData(prev => ({...prev, scheduled_end_time: e.target.value}))}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value}))}
                className="form-control"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                className="form-control"
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Technician</label>
              <select
                value={formData.technician_id}
                onChange={(e) => setFormData(prev => ({...prev, technician_id: e.target.value}))}
                className="form-control"
              >
                <option value="">Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              className="form-control"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              className="form-control"
              rows="2"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  // Fetch data
  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      // Fetch work orders with customer and tech info
      const { data: workOrderData, error: workOrderError } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            name,
            phone,
            address
          ),
          technicians (
            id,
            name
          )
        `)
        .order('service_date', { ascending: true });

      if (workOrderError) throw workOrderError;

      // Fetch technicians
      const { data: techData, error: techError } = await supabase
        .from('technicians')
        .select('*')
        .eq('active', true);

      if (techError) throw techError;

      setWorkOrders(workOrderData || []);
      setTechnicians(techData || []);

      // Convert work orders to FullCalendar events
      const calendarEvents = (workOrderData || []).map(wo => ({
        id: wo.id,
        title: `${wo.title} - ${wo.customers?.name}`,
        start: combineDateTime(wo.service_date, wo.scheduled_start_time),
        end: combineDateTime(wo.service_date, wo.scheduled_end_time),
        backgroundColor: getEventColor(wo),
        borderColor: getEventColor(wo),
        extendedProps: {
          workOrder: wo,
          customer: wo.customers,
          technician: wo.technicians
        }
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to combine date and time
  const combineDateTime = (date, time) => {
    if (!date) return null;
    if (!time) {
      // Default times if not set
      return `${date}T08:00:00`;
    }
    return `${date}T${time}`;
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = async (info) => {
    const { event } = info;
    const workOrderId = event.id;
    const newDate = info.event.start.toISOString().split('T')[0];
    const newStartTime = info.event.start.toTimeString().slice(0, 8);
    const newEndTime = info.event.end?.toTimeString().slice(0, 8) || '17:00:00';

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          service_date: newDate,
          scheduled_start_time: newStartTime,
          scheduled_end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrderId);

      if (error) throw error;

      // Refresh calendar data
      await fetchCalendarData();
      
      // Show success message
    //   alert('Work order rescheduled successfully!');
    } catch (error) {
      console.error('Error updating work order:', error);
      alert('Error rescheduling work order', error);
      info.revert(); // Revert the drag if update failed
    }
  };

  // Handle event resize
  const handleEventResize = async (info) => {
    const { event } = info;
    const workOrderId = event.id;
    const newEndTime = info.event.end?.toTimeString().slice(0, 8) || '17:00:00';

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          scheduled_end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrderId);

      if (error) throw error;

      await fetchCalendarData();
    } catch (error) {
      console.error('Error updating work order duration:', error);
      alert('Error updating work order duration', error);
      info.revert();
    }
  };

  // Handle event click
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEventModal(true);
  };

  // Handle date select (for creating new appointments)
  const handleDateSelect = (info) => {
    const selectedDate = info.start.toISOString().split('T')[0];
    const selectedTime = info.start.toTimeString().slice(0, 8);
    
    setSelectedDateInfo({
      date: selectedDate,
      startTime: selectedTime,
      endTime: info.end ? info.end.toTimeString().slice(0, 8) : '17:00:00'
    });
    setShowCreateModal(true);
  };

  // Handle calendar view changes
  const changeCalendarView = (newView) => {
    setCalendarView(newView);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(newView);
    }
  };

  // Create new work order
  const createWorkOrder = async (workOrderData) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([{
          ...workOrderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      await fetchCalendarData();
      setShowCreateModal(false);
    //   alert('Work order created successfully!');
    } catch (error) {
      console.error('Error creating work order:', error);
      alert('Error creating work order', error);
    }
  };

  // Edit existing work order
  const editWorkOrder = (workOrder) => {
    setEditingWorkOrder(workOrder);
    setShowEditModal(true);
  };

  // Update work order
  const updateWorkOrder = async (workOrderId, updates) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrderId);

      if (error) throw error;

      await fetchCalendarData();
      setShowEditModal(false);
    //   alert('Work order updated successfully!');
    } catch (error) {
      console.error('Error updating work order:', error);
      alert('Error updating work order', error);
    }
  };

  // Delete work order
  const deleteWorkOrder = async (workOrderId) => {
    if (!window.confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', workOrderId);

      if (error) throw error;

      await fetchCalendarData();
      setShowEventModal(false);
    //   alert('Work order deleted successfully!');
    } catch (error) {
      console.error('Error deleting work order:', error);
      alert('Error deleting work order', error);
    }
  };

  // Update work order status
  const updateWorkOrderStatus = async (workOrderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}),
          ...(newStatus === 'in-progress' ? { started_at: new Date().toISOString() } : {})
        })
        .eq('id', workOrderId);

      if (error) throw error;

      await fetchCalendarData();
      setShowEventModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating work order status', error);
    }
  };

  // Assign technician
  const assignTechnician = async (workOrderId, technicianId) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          technician_id: technicianId,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrderId);

      if (error) throw error;

      await fetchCalendarData();
      setShowEventModal(false);
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Error assigning technician', error);
    }
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="admin-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h1>📅 Service Calendar</h1>
          <p>Drag and drop to reschedule appointments</p>
        </div>
        
        <div className="calendar-controls">
          <div className="view-buttons">
            <button 
              className={`view-btn ${calendarView === 'dayGridMonth' ? 'active' : ''}`}
              onClick={() => changeCalendarView('dayGridMonth')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${calendarView === 'timeGridWeek' ? 'active' : ''}`}
              onClick={() => changeCalendarView('timeGridWeek')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${calendarView === 'timeGridDay' ? 'active' : ''}`}
              onClick={() => changeCalendarView('timeGridDay')}
            >
              Day
            </button>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#17a2b8'}}></div>
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#6f42c1'}}></div>
          <span>Scheduled</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#ffc107'}}></div>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#28a745'}}></div>
            <span>Completed</span>
           </div>
        <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#20c997'}}></div>
            <span>Keats</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#007bff'}}></div>
          <span>Ell</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#dc3545'}}></div>
          <span>Emergency</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={events}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          slotDuration="01:00:00"
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          select={handleDateSelect}
          height="auto"
          eventDisplay="block"
          displayEventTime={true}
          allDaySlot={false}
        />
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEvent.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEventModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="event-details">
                <div className="detail-item">
                  <strong>Customer:</strong> {selectedEvent.extendedProps.customer?.name}
                </div>
                <div className="detail-item">
                  <strong>Phone:</strong> {selectedEvent.extendedProps.customer?.phone}
                </div>
                <div className="detail-item">
                  <strong>Address:</strong> {selectedEvent.extendedProps.customer?.address}
                </div>
                <div className="detail-item">
                  <strong>Service:</strong> {selectedEvent.extendedProps.workOrder?.service_type}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${selectedEvent.extendedProps.workOrder?.status}`}>
                    {selectedEvent.extendedProps.workOrder?.status}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Technician:</strong> {selectedEvent.extendedProps.technician?.name || 'Unassigned'}
                </div>
              </div>

              <div className="modal-actions">
                <div className="action-group">
                  <h4>Assign Technician:</h4>
                  <div className="tech-buttons">
                    {technicians.map(tech => (
                      <button
                        key={tech.id}
                        className={`tech-btn ${selectedEvent.extendedProps.workOrder?.technician_id === tech.id ? 'assigned' : ''}`}
                        onClick={() => assignTechnician(selectedEvent.extendedProps.workOrder?.id, tech.id)}
                      >
                        {tech.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="action-group">
                  <h4>Update Status:</h4>
                  <div className="status-buttons">
                    <button 
                      className="status-btn pending"
                      onClick={() => updateWorkOrderStatus(selectedEvent.extendedProps.workOrder?.id, 'pending')}
                    >
                      Pending
                    </button>
                    <button 
                      className="status-btn scheduled"
                      onClick={() => updateWorkOrderStatus(selectedEvent.extendedProps.workOrder?.id, 'scheduled')}
                    >
                      Scheduled
                    </button>
                    <button 
                      className="status-btn in-progress"
                      onClick={() => updateWorkOrderStatus(selectedEvent.extendedProps.workOrder?.id, 'in-progress')}
                    >
                      Start Job
                    </button>
                    <button 
                      className="status-btn completed"
                      onClick={() => updateWorkOrderStatus(selectedEvent.extendedProps.workOrder?.id, 'completed')}
                    >
                      Complete
                    </button>
                  </div>
                </div>

                <div className="action-group">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => editWorkOrder(selectedEvent.extendedProps.workOrder)}
                  >
                    ✏️ Edit Details
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.open(`/admin/workorders/${selectedEvent.extendedProps.workOrder?.id}`)}
                  >
                    👁️ View Full Details
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteWorkOrder(selectedEvent.extendedProps.workOrder?.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <CreateWorkOrderModal 
          selectedDateInfo={selectedDateInfo}
          technicians={technicians}
          onSave={createWorkOrder}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Work Order Modal */}
      {showEditModal && editingWorkOrder && (
        <EditWorkOrderModal 
          workOrder={editingWorkOrder}
          technicians={technicians}
          onSave={(updates) => updateWorkOrder(editingWorkOrder.id, updates)}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCalendar;