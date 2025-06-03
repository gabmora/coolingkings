import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './AIAgentDashboard.css';

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
      
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's conversations count
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

      // Get today's leads count
      const { data: todayLeads, error: leadsError } = await supabase
        .from('ai_leads')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      if (!leadsError && todayLeads) {
        setMetrics(prev => ({
          ...prev,
          todayLeads: todayLeads.length
        }));
      }

      // Fetch recent conversations with customer info
      const { data: recentConvs } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          customers (name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentConversations(recentConvs || []);

      // Fetch active AI leads with customer and work order info
      const { data: leads } = await supabase
        .from('ai_leads')
        .select(`
          *,
          customers (name, phone, address),
          work_orders (id, title, status, work_order_number)
        `)
        .in('status', ['new', 'contacted', 'qualified'])
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('Fetched AI leads:', leads);
      setActiveLeads(leads || []);

      // Calculate metrics
      if (leads && leads.length > 0) {
        const avgScore = leads.reduce((sum, lead) => sum + (lead.lead_score || 5), 0) / leads.length;
        const converted = leads.filter(lead => lead.work_order_id).length;
        const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0;
        
        setMetrics(prev => ({
          ...prev,
          avgLeadScore: Math.round(avgScore * 10) / 10,
          conversionRate: Math.round(conversionRate)
        }));
      }

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

    // Subscribe to new leads
    const leadsSubscription = supabase
      .channel('ai-leads')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ai_leads' 
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
      leadsSubscription.unsubscribe();
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

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('ai_leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'contacted' ? { contacted_at: new Date().toISOString() } : {})
        })
        .eq('id', leadId);

      if (!error) {
        // Update local state
        setActiveLeads(prev => 
          prev.map(lead => 
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          )
        );
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return time.toLocaleDateString();
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
                <h3>{metrics.todayLeads}</h3>
                <p>Today's Leads</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <h3>{metrics.conversionRate}%</h3>
                <p>Conversion Rate</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">⭐</div>
              <div className="metric-content">
                <h3>{metrics.avgLeadScore}</h3>
                <p>Avg Lead Score</p>
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
                <h3>📈 Total Leads</h3>
                <p>{activeLeads.length} active leads</p>
              </div>
              <div className="stat-item">
                <h3>🎯 Lead Quality</h3>
                <p>Average score: {metrics.avgLeadScore}/10</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="conversations-tab">
          <h2>💬 Recent AI Conversations</h2>
          {recentConversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet. Conversations will appear here when customers chat with the AI.</p>
            </div>
          ) : (
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
                      {formatTimeAgo(conversation.created_at)}
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
          )}
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
                      <h4>{lead.customers?.name || 'Unknown Customer'}</h4>
                      <span className="lead-phone">{lead.customers?.phone}</span>
                    </div>
                    <div className="lead-score">
                      Score: <span className={`score ${lead.lead_score >= 7 ? 'high' : lead.lead_score >= 4 ? 'medium' : 'low'}`}>
                        {lead.lead_score || 5}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="lead-details">
                    <p><strong>Service:</strong> {lead.service_type.charAt(0).toUpperCase() + lead.service_type.slice(1)}</p>
                    <p><strong>Urgency:</strong> 
                      <span className={`urgency ${lead.urgency}`}>{lead.urgency}</span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span className={`status ${lead.status}`}>{lead.status}</span>
                    </p>
                    <p><strong>Address:</strong> {lead.customers?.address}</p>
                    <p><strong>Created:</strong> {formatTimeAgo(lead.created_at)}</p>
                    {lead.work_orders && (
                      <p><strong>Work Order:</strong> 
                        <a href={`/admin/workorders/${lead.work_orders.id}`} target="_blank" rel="noopener noreferrer">
                          {lead.work_orders.work_order_number || `#${lead.work_orders.id}`}
                        </a>
                        ({lead.work_orders.status})
                      </p>
                    )}
                  </div>
                  
                  <div className="lead-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => window.open(`tel:${lead.customers?.phone}`)}
                    >
                      📞 Call Customer
                    </button>
                    {lead.status === 'new' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateLeadStatus(lead.id, 'contacted')}
                      >
                        ✓ Mark Contacted
                      </button>
                    )}
                    {!lead.work_order_id && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => window.open(`/admin/workorders/new?customer=${lead.customer_id}`)}
                      >
                        📝 Create Work Order
                      </button>
                    )}
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