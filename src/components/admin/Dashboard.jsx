// components/admin/Dashboard.jsx - Enhanced with AI metrics from n8n
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWorkOrdersByStatus } from '../../services/workOrderService';
import { supabase } from '../../services/supabase';
import './AdminDesignSystem.css';
import './AdminComponents.css';
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: 'var(--admin-space-4)'
        }}>
          <div className="admin-loading-spinner"></div>
          <p style={{ color: 'var(--admin-text-secondary)' }}>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div style={{ marginBottom: 'var(--admin-space-8)' }}>
            <h1 style={{
              fontSize: 'var(--admin-font-size-4xl)',
              fontWeight: 'var(--admin-font-weight-bold)',
              color: 'var(--admin-text-primary)',
              marginBottom: 'var(--admin-space-2)'
            }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--admin-text-secondary)' }}>
              Welcome back! Here's your business overview for today.
            </p>
          </div>

          {/* Main Business Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--admin-space-6)',
            marginBottom: 'var(--admin-space-8)'
          }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">📋</div>
              </div>
              <div className="admin-stat-card-value">{pendingWorkOrders.length}</div>
              <div className="admin-stat-card-label">Pending Orders</div>
            </div>
            <div
              className="admin-stat-card"
              onClick={toggleInProgressOrders}
              style={{ cursor: 'pointer' }}
            >
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">🔧</div>
              </div>
              <div className="admin-stat-card-value">{inProgressWorkOrders.length}</div>
              <div className="admin-stat-card-label">In Progress</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">📅</div>
              </div>
              <div className="admin-stat-card-value">{todaysWorkOrders.length}</div>
              <div className="admin-stat-card-label">Today's Schedule</div>
            </div>
            <div
              className="admin-stat-card"
              onClick={() => stats.urgentEstimates > 0 && navigate('/admin/estimates?filter=urgent')}
              style={{ cursor: stats.urgentEstimates > 0 ? 'pointer' : 'default' }}
            >
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon" style={{
                  background: stats.urgentEstimates > 0 ? 'linear-gradient(135deg, var(--admin-danger) 0%, var(--admin-status-urgent) 100%)' : undefined
                }}>
                  🚨
                </div>
              </div>
              <div className="admin-stat-card-value">{stats.urgentEstimates}</div>
              <div className="admin-stat-card-label">Urgent Estimates</div>
            </div>
          </div>

          {/* Lead Generation & AI Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--admin-space-6)',
            marginBottom: 'var(--admin-space-8)'
          }}>
            <div
              className="admin-stat-card"
              onClick={() => navigate('/admin/estimates')}
              style={{ cursor: 'pointer' }}
            >
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">💼</div>
              </div>
              <div className="admin-stat-card-value">{stats.pendingEstimates}</div>
              <div className="admin-stat-card-label">Pending Estimates</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">💬</div>
              </div>
              <div className="admin-stat-card-value">{stats.todayConversations}</div>
              <div className="admin-stat-card-label">AI Chats Today</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">📈</div>
              </div>
              <div className="admin-stat-card-value">{stats.weeklyLeads}</div>
              <div className="admin-stat-card-label">Leads This Week</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">✅</div>
              </div>
              <div className="admin-stat-card-value">{stats.completedThisMonth}</div>
              <div className="admin-stat-card-label">Completed This Month</div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--admin-space-6)',
            marginBottom: 'var(--admin-space-8)'
          }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">👥</div>
              </div>
              <div className="admin-stat-card-value">{stats.totalCustomers}</div>
              <div className="admin-stat-card-label">Total Customers</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">📊</div>
              </div>
              <div className="admin-stat-card-value">{stats.totalWorkOrders}</div>
              <div className="admin-stat-card-label">Total Work Orders</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">🎯</div>
              </div>
              <div className="admin-stat-card-value">
                {stats.weeklyLeads > 0 ? Math.round((stats.pendingEstimates / stats.weeklyLeads) * 100) : 0}%
              </div>
              <div className="admin-stat-card-label">Conversion Rate</div>
              <div className="admin-stat-card-change positive">
                {stats.weeklyLeads > 0 ? `${stats.pendingEstimates} of ${stats.weeklyLeads} leads` : 'No data'}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">💡</div>
              </div>
              <div className="admin-stat-card-value">
                {stats.todayConversations > 0 ? Math.round((stats.pendingEstimates / stats.todayConversations) * 100) : 0}%
              </div>
              <div className="admin-stat-card-label">Chat Conversion</div>
              <div className="admin-stat-card-change positive">
                {stats.todayConversations > 0 ? `${stats.pendingEstimates} of ${stats.todayConversations} chats` : 'No data'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--admin-space-4)',
            marginBottom: 'var(--admin-space-8)'
          }}>
            <Link to="/admin/calendar" className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.25rem' }}>📅</span>
              Schedule Jobs
            </Link>
            <Link to="/admin/estimates" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              Review Estimates
            </Link>
            <Link to="/admin/workorders/new" className="admin-btn admin-btn-outline" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.25rem' }}>+</span>
              New Work Order
            </Link>
            <Link to="/admin/customers/new" className="admin-btn admin-btn-outline" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.25rem' }}>+</span>
              New Customer
            </Link>
          </div>

          {/* In Progress Work Orders - Show only when clicked */}
          {showInProgressOrders && (
            <div style={{ marginBottom: 'var(--admin-space-8)' }}>
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">In Progress Work Orders</h3>
                  <Link to="/admin/workorders?status=in-progress" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ textDecoration: 'none' }}>
                    View All
                  </Link>
                </div>

                <div className="admin-card-body">
                  {inProgressWorkOrders.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: 'var(--admin-space-8)',
                      color: 'var(--admin-text-secondary)'
                    }}>
                      <p>No work orders in progress.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
                      {inProgressWorkOrders.slice(0, 5).map(order => (
                        <div key={order.id} style={{
                          padding: 'var(--admin-space-4)',
                          border: '1px solid var(--admin-border-light)',
                          borderRadius: 'var(--admin-radius-base)',
                          transition: 'all var(--admin-transition-fast)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 'var(--admin-space-3)'
                          }}>
                            <div>
                              <h4 style={{
                                fontSize: 'var(--admin-font-size-lg)',
                                fontWeight: 'var(--admin-font-weight-semibold)',
                                color: 'var(--admin-text-primary)',
                                margin: 0
                              }}>{order.title}</h4>
                              {order.work_order_number && (
                                <p style={{
                                  margin: 'var(--admin-space-1) 0 0 0',
                                  color: 'var(--admin-text-secondary)',
                                  fontSize: 'var(--admin-font-size-sm)'
                                }}>
                                  {order.work_order_number}
                                </p>
                              )}
                            </div>
                            <span className="admin-badge admin-badge-inprogress">
                              {formatDate(order.service_date)}
                            </span>
                          </div>
                          <div style={{
                            display: 'grid',
                            gap: 'var(--admin-space-2)',
                            marginBottom: 'var(--admin-space-4)',
                            fontSize: 'var(--admin-font-size-sm)'
                          }}>
                            <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                              <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Customer:</span>
                              <span style={{ color: 'var(--admin-text-primary)' }}>{order.customers.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                              <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Service Type:</span>
                              <span style={{ color: 'var(--admin-text-primary)' }}>{order.service_type.charAt(0).toUpperCase() + order.service_type.slice(1)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                              <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Started:</span>
                              <span style={{ color: 'var(--admin-text-primary)' }}>{order.started_at ? new Date(order.started_at).toLocaleString() : 'N/A'}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--admin-space-3)' }}>
                            <button
                              className="admin-btn admin-btn-primary admin-btn-sm"
                              onClick={() => navigate(`/admin/workorders/${order.id}`)}
                            >
                              View Details
                            </button>
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-sm"
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
            </div>
          )}

          {/* Today's Schedule */}
          <div style={{ marginBottom: 'var(--admin-space-8)' }}>
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Today's Schedule</h3>
                <Link to="/admin/calendar" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ textDecoration: 'none' }}>
                  View Calendar
                </Link>
              </div>

              <div className="admin-card-body">
                {todaysWorkOrders.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--admin-space-8)',
                    color: 'var(--admin-text-secondary)'
                  }}>
                    <p>No work orders scheduled for today.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
                    {todaysWorkOrders.map(order => (
                      <div key={order.id} style={{
                        padding: 'var(--admin-space-4)',
                        border: '1px solid var(--admin-border-light)',
                        borderRadius: 'var(--admin-radius-base)',
                        transition: 'all var(--admin-transition-fast)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 'var(--admin-space-3)'
                        }}>
                          <h4 style={{
                            fontSize: 'var(--admin-font-size-lg)',
                            fontWeight: 'var(--admin-font-weight-semibold)',
                            color: 'var(--admin-text-primary)',
                            margin: 0
                          }}>{order.title}</h4>
                          <span className={`admin-badge admin-badge-${order.status.toLowerCase().replace('-', '')}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gap: 'var(--admin-space-2)',
                          marginBottom: 'var(--admin-space-4)',
                          fontSize: 'var(--admin-font-size-sm)'
                        }}>
                          <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                            <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Customer:</span>
                            <span style={{ color: 'var(--admin-text-primary)' }}>{order.customers.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                            <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Time:</span>
                            <span style={{ color: 'var(--admin-text-primary)' }}>{getTimeDisplay(order.time_preference)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                            <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Address:</span>
                            <span style={{ color: 'var(--admin-text-primary)' }}>{order.customers.address}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--admin-space-3)' }}>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            onClick={() => navigate(`/admin/workorders/${order.id}`)}
                          >
                            View Details
                          </button>
                          {order.status === 'pending' && (
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-sm"
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
          </div>

          {/* Pending Work Orders */}
          <div style={{ marginBottom: 'var(--admin-space-8)' }}>
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Pending Work Orders</h3>
                <Link to="/admin/workorders?status=pending" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ textDecoration: 'none' }}>
                  View All
                </Link>
              </div>

              <div className="admin-card-body">
                {pendingWorkOrders.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--admin-space-8)',
                    color: 'var(--admin-text-secondary)'
                  }}>
                    <p>No pending work orders.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
                    {pendingWorkOrders.slice(0, 5).map(order => (
                      <div key={order.id} style={{
                        padding: 'var(--admin-space-4)',
                        border: '1px solid var(--admin-border-light)',
                        borderRadius: 'var(--admin-radius-base)',
                        transition: 'all var(--admin-transition-fast)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 'var(--admin-space-3)'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: 'var(--admin-font-size-lg)',
                              fontWeight: 'var(--admin-font-weight-semibold)',
                              color: 'var(--admin-text-primary)',
                              margin: 0
                            }}>{order.title}</h4>
                            {order.work_order_number && (
                              <p style={{
                                margin: 'var(--admin-space-1) 0 0 0',
                                color: 'var(--admin-text-secondary)',
                                fontSize: 'var(--admin-font-size-sm)'
                              }}>
                                {order.work_order_number}
                              </p>
                            )}
                          </div>
                          <span className="admin-badge admin-badge-pending">
                            {formatDate(order.service_date)}
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gap: 'var(--admin-space-2)',
                          marginBottom: 'var(--admin-space-4)',
                          fontSize: 'var(--admin-font-size-sm)'
                        }}>
                          <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                            <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Customer:</span>
                            <span style={{ color: 'var(--admin-text-primary)' }}>{order.customers.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                            <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'var(--admin-font-weight-semibold)' }}>Service Type:</span>
                            <span style={{ color: 'var(--admin-text-primary)' }}>{order.service_type.charAt(0).toUpperCase() + order.service_type.slice(1)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--admin-space-3)' }}>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
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
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;