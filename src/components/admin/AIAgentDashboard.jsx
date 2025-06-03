import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './AIAgentDashboard.css'; // We'll create separate CSS file

const AIAgentDashboard = () => {
  const [metrics, setMetrics] = useState({
    todayConversations: 0,
    todayLeads: 0,
    conversionRate: 0,
    avgLeadScore: 0
  });
  const [recentConversations, setRecentConversations] = useState([]);
  const [activeLeads, setActiveLeads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's conversations count
      const today = new Date().toISOString().split('T')[0];
      const { data: conversations, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      if (!convError && conversations) {
        setMetrics(prev => ({
          ...prev,
          todayConversations: conversations.length
        }));
      }

      // Fetch recent conversations
      const { data: recentConvs } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          customers (name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentConversations(recentConvs || []);

      // Fetch active leads (if ai_leads table exists)
      const { data: leads } = await supabase
        .from('ai_leads')
        .select(`
          *,
          customers (name, phone, address),
          work_orders (title, status)
        `)
        .in('status', ['new', 'contacted'])
        .order('created_at', { ascending: false })
        .limit(10);

      setActiveLeads(leads || []);

      // Fetch unread notifications
      const { data: notifs } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(notifs || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to new conversations
    const conversationsSubscription = supabase
      .channel('ai-conversations')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ai_conversations' 
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
    };
  };

  const markNotificationRead = async (id) => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="ai-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Agent Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ai-dashboard">
      <div className="dashboard-header">
        <h1>🤖 AI Agent Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          💬 Conversations
        </button>
        <button 
          className={`tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          🎯 Leads
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-content">
                <h3>{metrics.todayConversations}</h3>
                <p>Today's Conversations</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <h3>{activeLeads.length}</h3>
                <p>Active Leads</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <h3>{recentConversations.length}</h3>
                <p>Total Conversations</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🔔</div>
              <div className="metric-content">
                <h3>{notifications.length}</h3>
                <p>New Notifications</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-section">
              <h2>🔔 Recent Notifications</h2>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button 
                      className="mark-read-btn"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="quick-stats">
            <h2>📊 Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>🚀 AI Status</h3>
                <p className="status-good">Fully Operational</p>
              </div>
              <div className="stat-item">
                <h3>📈 Performance</h3>
                <p>Conversations logged: {recentConversations.length}</p>
              </div>
              <div className="stat-item">
                <h3>🎯 Lead Generation</h3>
                <p>Active leads: {activeLeads.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="conversations-tab">
          <h2>💬 Recent AI Conversations</h2>
          <div className="conversations-list">
            {recentConversations.map(conversation => (
              <div key={conversation.id} className="conversation-item">
                <div className="conversation-header">
                  <div className="customer-info">
                    <strong>
                      {conversation.customers?.name || 'Anonymous'}
                    </strong>
                    <span className="phone">
                      {conversation.customers?.phone}
                    </span>
                  </div>
                  <span className="conversation-time">
                    {new Date(conversation.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="conversation-messages">
                  <div className="user-message">
                    <strong>Customer:</strong> {conversation.user_message}
                  </div>
                  <div className="ai-message">
                    <strong>AI:</strong> {conversation.ai_response}
                  </div>
                </div>
                
                {conversation.intent && (
                  <div className="conversation-intent">
                    Intent: <span className="intent-badge">{conversation.intent}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <div className="leads-tab">
          <h2>🎯 AI Generated Leads</h2>
          {activeLeads.length === 0 ? (
            <div className="empty-state">
              <p>No active leads yet. Leads will appear here when customers schedule service through the AI chat.</p>
            </div>
          ) : (
            <div className="leads-list">
              {activeLeads.map(lead => (
                <div key={lead.id} className="lead-item">
                  <div className="lead-header">
                    <div className="lead-info">
                      <h4>{lead.customers?.name}</h4>
                      <span className="lead-phone">{lead.customers?.phone}</span>
                    </div>
                    <div className="lead-score">
                      Score: <span className="score high">
                        {lead.lead_score || 8}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="lead-details">
                    <p><strong>Service:</strong> {lead.service_type}</p>
                    <p><strong>Urgency:</strong> 
                      <span className={`urgency ${lead.urgency || 'medium'}`}>{lead.urgency || 'medium'}</span>
                    </p>
                    <p><strong>Address:</strong> {lead.customers?.address}</p>
                    {lead.work_orders && (
                      <p><strong>Work Order:</strong> {lead.work_orders.title} ({lead.work_orders.status})</p>
                    )}
                  </div>
                  
                  <div className="lead-actions">
                    <button className="btn btn-primary btn-sm">
                      📞 Call Customer
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      📝 Add Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAgentDashboard;