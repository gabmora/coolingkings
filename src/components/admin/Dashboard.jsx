// components/admin/Dashboard.jsx - Enhanced with AI metrics from n8n
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
    // AI/Lead metrics
    todayConversations: 0,
    pendingEstimates: 0,
    urgentEstimates: 0,
    weeklyLeads: 0
  });
  const [loading, setLoading] = useState(true);
  const [showInProgressOrders, setShowInProgressOrders] = useState(false);

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
        
        if (todaysOrders && Array.isArray(todaysOrders)) {
          setTodaysWorkOrders(todaysOrders);
        } else {
          setTodaysWorkOrders([]);
        }
        
        // Fetch general stats
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        const { count: workOrderCount } = await supabase
          .from('work_orders')
          .select('*', { count: 'exact', head: true });
        
        // Get current month completed work orders
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        
        const { count: completedThisMonth } = await supabase
          .from('work_orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', firstDayOfMonth)
          .lte('completed_at', lastDayOfMonth);

        // AI/Lead generation metrics
        const { count: todayConversations } = await supabase
          .from('ai_conversations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lte('created_at', `${today}T23:59:59.999Z`);

        const { count: pendingEstimates } = await supabase
          .from('estimate_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: urgentEstimates } = await supabase
          .from('estimate_requests')
          .select('*', { count: 'exact', head: true })
          .eq('priority', 'urgent')
          .in('status', ['pending', 'contacted']);

        // Weekly leads (past 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: weeklyLeads } = await supabase
          .from('estimate_requests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo);
        
        setStats({
          totalCustomers: customerCount || 0,
          totalWorkOrders: workOrderCount || 0,
          completedThisMonth: completedThisMonth || 0,
          todayConversations: todayConversations || 0,
          pendingEstimates: pendingEstimates || 0,
          urgentEstimates: urgentEstimates || 0,
          weeklyLeads: weeklyLeads || 0
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper functions
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
  
  const getTimeDisplay = (timePreference) => {
    switch (timePreference) {
      case 'morning': return 'Morning (8AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 5PM)';
      case 'anytime': return 'Anytime';
      default: return timePreference;
    }
  };

  const toggleInProgressOrders = () => {
    setShowInProgressOrders(!showInProgressOrders);
  };

  return (
    <div className="admin-container">
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          {/* Main Business Metrics */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{pendingWorkOrders.length}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
            <div 
              className="stat-card clickable" 
              onClick={toggleInProgressOrders}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-value">{inProgressWorkOrders.length}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{todaysWorkOrders.length}</div>
              <div className="stat-label">Today's Schedule</div>
            </div>
            <div 
              className={`stat-card ${stats.urgentEstimates > 0 ? 'clickable urgent' : ''}`}
              onClick={() => stats.urgentEstimates > 0 && navigate('/admin/estimates?filter=urgent')}
              style={{ cursor: stats.urgentEstimates > 0 ? 'pointer' : 'default' }}
            >
              <div className="stat-value">{stats.urgentEstimates}</div>
              <div className="stat-label">Urgent Estimates</div>
            </div>
          </div>

          {/* Lead Generation & AI Metrics */}
          <div className="dashboard-stats">
            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/estimates')}
            >
              <div className="stat-value">{stats.pendingEstimates}</div>
              <div className="stat-label">Pending Estimates</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.todayConversations}</div>
              <div className="stat-label">AI Chats Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.weeklyLeads}</div>
              <div className="stat-label">Leads This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.completedThisMonth}</div>
              <div className="stat-label">Completed This Month</div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.totalCustomers}</div>
              <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalWorkOrders}</div>
              <div className="stat-label">Total Work Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.weeklyLeads > 0 ? Math.round((stats.pendingEstimates / stats.weeklyLeads) * 100) : 0}%
              </div>
              <div className="stat-label">Conversion Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.todayConversations > 0 ? Math.round((stats.pendingEstimates / stats.todayConversations) * 100) : 0}%
              </div>
              <div className="stat-label">Chat Conversion</div>
            </div>
          </div>
          
          {/* Quick Actions - Updated with AI focus */}
          <div className="dashboard-actions">
            <Link to="/admin/calendar" className="action-button">
              <span className="action-icon">📅</span>
              <span>Schedule Jobs</span>
            </Link>
            <Link to="/admin/estimates" className="action-button">
              <span className="action-icon">📋</span>
              <span>Review Estimates</span>
            </Link>
            <Link to="/admin/workorders/new" className="action-button">
              <span className="action-icon">+</span>
              <span>New Work Order</span>
            </Link>
            <Link to="/admin/customers/new" className="action-button">
              <span className="action-icon">+</span>
              <span>New Customer</span>
            </Link>
          </div>

          {/* In Progress Work Orders - Show only when clicked */}
          {showInProgressOrders && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>In Progress Work Orders</h2>
                <Link to="/admin/workorders?status=in-progress" className="btn btn-text">
                  View All
                </Link>
              </div>
              
              <div className="card">
                {inProgressWorkOrders.length === 0 ? (
                  <div className="empty-state">
                    <p>No work orders in progress.</p>
                  </div>
                ) : (
                  <div className="work-order-list">
                    {inProgressWorkOrders.slice(0, 5).map(order => (
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
                          <div className="detail-row">
                            <div className="detail-label">Started:</div>
                            <div className="detail-value">{order.started_at ? new Date(order.started_at).toLocaleString() : 'N/A'}</div>
                          </div>
                        </div>
                        <div className="work-order-actions">
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => navigate(`/admin/workorders/${order.id}`)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => navigate(`/admin/workorders/${order.id}`)}
                          >
                            Complete Job
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Today's Schedule */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Today's Schedule</h2>
              <Link to="/admin/calendar" className="btn btn-text">
                View Calendar
              </Link>
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
                            onClick={() => navigate(`/admin/workorders/${order.id}`)}
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
                        <div>
                          <h3>{order.title}</h3>
                          {order.work_order_number && (
                            <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                              {order.work_order_number}
                            </p>
                          )}
                        </div>
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