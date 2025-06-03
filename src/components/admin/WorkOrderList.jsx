// components/admin/WorkOrderList.jsx - Updated to show work order numbers
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import '../admin/AdminStyles.css';

const WorkOrderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatusFilter = queryParams.get('status') || 'all';
  
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch work orders with customer info
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (
              id,
              name,
              phone,
              address
            )
          `)
          .order('service_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching work orders:', error);
          return;
        }
        
        setWorkOrders(data || []);
      } catch (error) {
        console.error('Error in fetchWorkOrders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrders();
  }, []);
  
  // Apply filters whenever workOrders, searchTerm, or statusFilter changes
  useEffect(() => {
    let filtered = [...workOrders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(order => 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customers.phone.includes(searchTerm) ||
        (order.work_order_number && order.work_order_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredWorkOrders(filtered);
  }, [workOrders, searchTerm, statusFilter]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
  
  // Update work order status
  const updateWorkOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}),
          ...(newStatus === 'in-progress' ? { started_at: new Date().toISOString() } : {})
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating work order status:', error);
        alert('Error updating status');
        return;
      }
      
      // Update local state
      setWorkOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      
    } catch (error) {
      console.error('Error in updateWorkOrderStatus:', error);
      alert('An unexpected error occurred');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Work Orders</h1>
        <Link to="/admin/workorders/new" className="btn btn-primary">
          + New Work Order
        </Link>
      </div>
      
      <div className="card">
        <div className="filters">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by work order #, customer, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="status-filter">
            <label htmlFor="statusFilter">Status Filter:</label>
            <select
              id="statusFilter"
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                // Update URL query params
                navigate(`/admin/workorders?status=${e.target.value}`);
              }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading work orders...</div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'No work orders match your filters' 
                : 'No work orders found. Create your first work order!'}
            </p>
          </div>
        ) : (
          <div className="work-order-list">
            {filteredWorkOrders.map(order => (
              <div key={order.id} className="work-order-item">
                <div className="work-order-header">
                  <div>
                    <h3>{order.title}</h3>
                    {order.work_order_number && (
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                        {order.work_order_number}
                      </p>
                    )}
                  </div>
                  <span className={`badge ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="work-order-details">
                  <div className="detail-row">
                    <div className="detail-label">Customer:</div>
                    <div className="detail-value">{order.customers.name}</div>
                  </div>
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
                    <div className="detail-label">Priority:</div>
                    <div className="detail-value">
                      <span className={`badge ${order.priority === 'emergency' ? 'badge-danger' : 
                        order.priority === 'high' ? 'badge-warning' : 'badge-secondary'}`}>
                        {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Description:</div>
                    <div className="detail-value">
                      {order.description.length > 100 ? 
                        `${order.description.substring(0, 100)}...` : 
                        order.description}
                    </div>
                  </div>
                </div>
                <div className="work-order-actions">
                  <Link to={`/admin/workorders/${order.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                  
                  {order.status === 'pending' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => updateWorkOrderStatus(order.id, 'in-progress')}
                    >
                      Start Job
                    </button>
                  )}
                  
                  {order.status === 'in-progress' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => updateWorkOrderStatus(order.id, 'completed')}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderList;