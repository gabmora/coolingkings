// components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWorkOrdersByStatus } from '../../services/workOrderService';
import { supabase } from '../../services/supabase';
import './AdminStyles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pendingWorkOrders, setPendingWorkOrders] = useState([]);
  const [inProgressWorkOrders, setInProgressWorkOrders] = useState([]);
  const [todaysWorkOrders, setTodaysWorkOrders] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWorkOrders: 0,
    completedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch pending work orders
        const pending = await getWorkOrdersByStatus('pending');
        setPendingWorkOrders(pending);
        
        // Fetch in-progress work orders
        const inProgress = await getWorkOrdersByStatus('in-progress');
        setInProgressWorkOrders(inProgress);
        
        // Fetch today's work orders
        const today = new Date().toISOString().split('T')[0];
        const { data: todaysOrders } = await supabase
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
          .eq('service_date', today)
          .order('time_preference');
        
        setTodaysWorkOrders(todaysOrders || []);
        
        // Fetch general stats
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        const { count: workOrderCount } = await supabase
          .from('work_orders')
          .select('*', { count: 'exact', head: true });
        
        // Get current month data
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        
        const { count: completedThisMonth } = await supabase
          .from('work_orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', firstDayOfMonth)
          .lte('completed_at', lastDayOfMonth);
        
        setStats({
          totalCustomers: customerCount || 0,
          totalWorkOrders: workOrderCount || 0,
          completedThisMonth: completedThisMonth || 0,
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Function to get status badge class
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
  
  // Function to get time preference display
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
      <div className="admin-header">
        <h1>K&E HVAC Dashboard</h1>
        <div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/admin/workorders/new')}
          >
            Create Work Order
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{pendingWorkOrders.length}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{inProgressWorkOrders.length}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{todaysWorkOrders.length}</div>
              <div className="stat-label">Today's Schedule</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalCustomers}</div>
              <div className="stat-label">Total Customers</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="dashboard-actions">
            <Link to="/admin/workorders/new" className="action-button">
              <span className="action-icon">+</span>
              <span>New Work Order</span>
            </Link>
            <Link to="/admin/customers/new" className="action-button">
              <span className="action-icon">+</span>
              <span>New Customer</span>
            </Link>
            <Link to="/admin/workorders" className="action-button">
              <span className="action-icon">📋</span>
              <span>All Work Orders</span>
            </Link>
            <Link to="/admin/customers" className="action-button">
              <span className="action-icon">👥</span>
              <span>Customer List</span>
            </Link>
          </div>
          
          {/* Today's Schedule */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Today's Schedule</h2>
            </div>
            
            <div className="card">
              {todaysWorkOrders.length === 0 ? (
                <div className="empty-state">
                  <p>No work orders scheduled for today.</p>
                </div>
              ) : (
                <div className="work-order-list">
                  {todaysWorkOrders.map(order => (
                    <div key={order.id} className="work-order-item">
                      <div className="work-order-header">
                        <h3>{order.title}</h3>
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
                          <div className="detail-label">Time:</div>
                          <div className="detail-value">{getTimeDisplay(order.time_preference)}</div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-label">Address:</div>
                          <div className="detail-value">{order.customers.address}</div>
                        </div>
                      </div>
                      <div className="work-order-actions">
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => navigate(`/admin/workorders/${order.id}`)}
                        >
                          View Details
                        </button>
                        {order.status === 'pending' && (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              // This would update the status to in-progress
                              navigate(`/admin/workorders/${order.id}`);
                            }}
                          >
                            Start Job
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Pending Work Orders */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Pending Work Orders</h2>
              <Link to="/admin/workorders?status=pending" className="btn btn-text">
                View All
              </Link>
            </div>
            
            <div className="card">
              {pendingWorkOrders.length === 0 ? (
                <div className="empty-state">
                  <p>No pending work orders.</p>
                </div>
              ) : (
                <div className="work-order-list">
                  {pendingWorkOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="work-order-item">
                      <div className="work-order-header">
                        <h3>{order.title}</h3>
                        <div className="date-badge">{formatDate(order.service_date)}</div>
                      </div>
                      <div className="work-order-details">
                        <div className="detail-row">
                          <div className="detail-label">Customer:</div>
                          <div className="detail-value">{order.customers.name}</div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-label">Service Type:</div>
                          <div className="detail-value">{order.service_type.charAt(0).toUpperCase() + order.service_type.slice(1)}</div>
                        </div>
                      </div>
                      <div className="work-order-actions">
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => navigate(`/admin/workorders/${order.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;