import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './AdminEstimates.css';

const ProfessionalEstimates = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeFilter, setActiveFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQualificationModal, setShowQualificationModal] = useState(false);

  useEffect(() => {
    fetchLeads();
    setupRealtimeSubscription();
  }, [activeFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('estimate_requests')
        .select(`
          *,
          customers (id, name, phone, email, address, city, state, zip)
        `)
        .order('created_at', { ascending: false });

      // Filter logic
      if (activeFilter === 'active') {
        query = query.in('status', ['pending', 'contacted', 'quoted']);
      } else if (activeFilter === 'urgent') {
        query = query.eq('priority', 'urgent').in('status', ['pending', 'contacted']);
      } else if (activeFilter === 'converted') {
        query = query.eq('workflow_stage', 'converted_to_work_order');
      } else {
        query = query.eq('status', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('estimate-requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'estimate_requests' },
        () => fetchLeads()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('estimate_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update status');
    }
  };

  const getLeadScore = (lead) => {
    let score = 5;
    if (lead.priority === 'urgent') score += 3;
    if (lead.service_type && lead.service_type.includes('installation')) score += 2;
    if (lead.source === 'ai_chat') score += 1;
    return Math.min(score, 10);
  };

  const getSourceIcon = (source) => {
    const icons = {
      website: '🌐',
      ai_chat: '🤖',
      phone: '📞',
      walk_in: '🚶',
      angies_list: '📋',
      home_rely: '🏠',
      manual: '✍️'
    };
    return icons[source] || '📝';
  };

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm)
  );

  const stats = {
    total: leads.length,
    pending: leads.filter(l => l.status === 'pending').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    quoted: leads.filter(l => l.status === 'quoted').length,
    urgent: leads.filter(l => l.priority === 'urgent' && ['pending', 'contacted'].includes(l.status)).length,
    avgResponseTime: '2.4 hours',
    conversionRate: '34%'
  };

  if (loading) {
    return (
      <div className="professional-estimates">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-estimates">
      {/* Header */}
      <div className="professional-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Lead Management</h1>
            <p>Track and qualify customer inquiries</p>
          </div>
          <button 
            onClick={fetchLeads}
            className="btn btn-primary"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Leads</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card contacted">
            <div className="stat-number">{stats.contacted}</div>
            <div className="stat-label">Contacted</div>
          </div>
          <div className="stat-card quoted">
            <div className="stat-number">{stats.quoted}</div>
            <div className="stat-label">Quoted</div>
          </div>
          <div className="stat-card urgent">
            <div className="stat-number">{stats.urgent}</div>
            <div className="stat-label">Urgent</div>
          </div>
          <div className="stat-card response">
            <div className="stat-number">{stats.avgResponseTime}</div>
            <div className="stat-label">Avg Response</div>
          </div>
          <div className="stat-card conversion">
            <div className="stat-number">{stats.conversionRate}</div>
            <div className="stat-label">Conversion</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-panel">
        <div className="controls-content">
          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[
              { key: 'active', label: 'Active', count: stats.pending + stats.contacted + stats.quoted },
              { key: 'urgent', label: 'Urgent', count: stats.urgent },
              { key: 'pending', label: 'New', count: stats.pending },
              { key: 'contacted', label: 'Contacted', count: stats.contacted },
              { key: 'quoted', label: 'Quoted', count: stats.quoted },
              { key: 'converted', label: 'Converted', count: 0 }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className="filter-count">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-layout">
        {/* Leads List */}
        <div className="leads-section">
          <div className="leads-container">
            <div className="leads-header">
              <h2>Leads ({filteredLeads.length})</h2>
            </div>
            
            <div className="leads-list">
              {filteredLeads.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No leads found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                    className={`lead-card ${selectedLead?.id === lead.id ? 'selected' : ''} ${lead.priority === 'urgent' ? 'urgent' : ''}`}
                  >
                    <div className="lead-header">
                      <div className="lead-info">
                        <div className="lead-title">
                          <span className="source-icon">{getSourceIcon(lead.source)}</span>
                          <span className="lead-name">{lead.name}</span>
                          {lead.priority === 'urgent' && (
                            <span className="urgent-badge">URGENT</span>
                          )}
                          <div className="lead-score">
                            <span>Score: {getLeadScore(lead)}/10</span>
                          </div>
                        </div>
                        
                        <div className="lead-details">
                          <div>📧 {lead.email}</div>
                          <div>📞 {lead.phone}</div>
                          <div>🔧 {lead.service_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        </div>
                      </div>
                      
                      <div className="lead-meta">
                        <div className={`status-badge status-${lead.status}`}>
                          {lead.status?.toUpperCase()}
                        </div>
                        <div className="lead-date">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                        <div className="lead-time">
                          {new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>

                    {lead.description && (
                      <div className="lead-description">
                        {lead.description.length > 150 
                          ? `${lead.description.substring(0, 150)}...` 
                          : lead.description
                        }
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lead Details Panel */}
        <div className="details-section">
          {selectedLead ? (
            <div className="details-panel">
              <div className="panel-header">
                <h2>Lead Details</h2>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              
              <div className="panel-content">
                {/* Customer Info */}
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-grid">
                    <div><strong>Name:</strong> {selectedLead.name}</div>
                    <div><strong>Email:</strong> <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a></div>
                    <div><strong>Phone:</strong> <a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a></div>
                    {selectedLead.address && <div><strong>Address:</strong> {selectedLead.address}</div>}
                  </div>
                </div>

                {/* Service Details */}
                <div className="detail-section">
                  <h3>Service Request</h3>
                  <div className="detail-grid">
                    <div><strong>Type:</strong> {selectedLead.service_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div><strong>Priority:</strong> <span className={`priority-${selectedLead.priority}`}>{selectedLead.priority?.toUpperCase()}</span></div>
                    <div><strong>Source:</strong> {getSourceIcon(selectedLead.source)} {selectedLead.source?.replace('_', ' ')}</div>
                    <div><strong>Lead Score:</strong> {getLeadScore(selectedLead)}/10</div>
                  </div>
                  {selectedLead.description && (
                    <div className="description-content">
                      <strong>Description:</strong><br />
                      {selectedLead.description}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="detail-section">
                  <h3>Quick Actions</h3>
                  <div className="action-grid">
                    <button 
                      onClick={() => window.open(`mailto:${selectedLead.email}`)}
                      className="btn btn-primary btn-sm"
                    >
                      📧 Email
                    </button>
                    <button 
                      onClick={() => window.open(`tel:${selectedLead.phone}`)}
                      className="btn btn-success btn-sm"
                    >
                      📞 Call
                    </button>
                  </div>
                </div>

                {/* Status Update */}
                <div className="detail-section">
                  <h3>Update Status</h3>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Qualification Button */}
                <div className="detail-section">
                  <button
                    onClick={() => setShowQualificationModal(true)}
                    className="btn btn-primary btn-full qualification-btn"
                  >
                    🎯 Qualify & Convert to Work Order
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="details-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">👆</div>
                <h3>Select a Lead</h3>
                <p>Choose a lead from the list to view details and take actions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Qualification Modal Placeholder */}
      {showQualificationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Lead Qualification</h2>
              <button 
                onClick={() => setShowQualificationModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="qualification-placeholder">
                <div className="placeholder-icon">🚧</div>
                <h3>Qualification Process</h3>
                <p>This is where the work order qualification questions will go.</p>
                <p className="placeholder-note">Coming next: Service type classification, customer readiness, resource requirements, etc.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalEstimates;