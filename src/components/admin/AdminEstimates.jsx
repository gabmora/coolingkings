import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './AdminEstimates.css';

const AdminEstimates = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEstimates();
    setupRealtimeSubscription();
  }, []);

  const fetchEstimates = async () => {
    try {
      let query = supabase
        .from('estimate_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setEstimates(data || []);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('estimate-requests')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'estimate_requests' },
        (payload) => {
          setEstimates(prev => [payload.new, ...prev]);
          showBrowserNotification(payload.new);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const showBrowserNotification = (newEstimate) => {
    if (Notification.permission === 'granted') {
      new Notification(`New ${newEstimate.priority === 'urgent' ? 'URGENT ' : ''}Estimate Request`, {
        body: `${newEstimate.name} - ${newEstimate.service_type}`,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const updateEstimateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('estimate_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setEstimates(prev => 
        prev.map(est => 
          est.id === id ? { ...est, status: newStatus } : est
        )
      );

      if (selectedEstimate?.id === id) {
        setSelectedEstimate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating estimate status:', error);
      alert('Failed to update status');
    }
  };

  const addNotes = async (id, notes) => {
    try {
      const { error } = await supabase
        .from('estimate_requests')
        .update({ notes })
        .eq('id', id);

      if (error) throw error;

      setEstimates(prev => 
        prev.map(est => est.id === id ? { ...est, notes } : est)
      );

      if (selectedEstimate?.id === id) {
        setSelectedEstimate(prev => ({ ...prev, notes }));
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes');
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [filter]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      contacted: '#3b82f6',
      quoted: '#8b5cf6',
      scheduled: '#10b981',
      completed: '#059669',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'ac-installation': '❄️',
      'ac-repair': '🔧',
      'heating-installation': '🔥',
      'heating-repair': '🛠️',
      'maintenance': '⚙️',
      'ductwork': '🏭',
      'other': '📝'
    };
    return icons[serviceType] || '📝';
  };

  const filteredEstimates = estimates.filter(estimate =>
    estimate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: estimates.length,
    pending: estimates.filter(e => e.status === 'pending').length,
    urgent: estimates.filter(e => e.priority === 'urgent').length,
    scheduled: estimates.filter(e => e.status === 'scheduled').length,
    completed: estimates.filter(e => e.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading estimate requests...</p>
      </div>
    );
  }

  return (
    <div className="admin-estimates">
      {/* Header */}
      <header className="estimates-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📋 Estimate Requests</h1>
            <p>Manage customer estimate requests and track progress</p>
          </div>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={fetchEstimates}
              title="Refresh data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card urgent">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <h3>{stats.urgent}</h3>
              <p>Urgent</p>
            </div>
          </div>
          <div className="stat-card scheduled">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.scheduled}</h3>
              <p>Scheduled</p>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="controls-section">
        <div className="controls-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, email, or service type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Estimates Table */}
        <section className="estimates-section">
          {filteredEstimates.length === 0 ? (
            <div className="no-estimates">
              <h3>No estimate requests found</h3>
              <p>{searchTerm ? 'Try adjusting your search terms' : 'New requests will appear here when submitted'}</p>
            </div>
          ) : (
            <table className="estimates-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstimates.map(estimate => (
                  <tr 
                    key={estimate.id} 
                    className={`
                      ${estimate.priority === 'urgent' ? 'urgent' : ''} 
                      ${selectedEstimate?.id === estimate.id ? 'selected' : ''}
                    `}
                    onClick={() => setSelectedEstimate(selectedEstimate?.id === estimate.id ? null : estimate)}
                  >
                    <td>
                      <div className="customer-info">
                        <span className="service-icon">{getServiceIcon(estimate.service_type)}</span>
                        <div>
                          <div className="customer-name">
                            {estimate.name}
                            {estimate.priority === 'urgent' && <span className="urgent-badge">🚨</span>}
                          </div>
                          <div className="customer-email">{estimate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="service-info">
                        <div className="service-type">
                          {estimate.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {estimate.address && <div className="service-address">{estimate.address}</div>}
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <div>{new Date(estimate.created_at).toLocaleDateString()}</div>
                        <div className="time">{new Date(estimate.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(estimate.status) }}
                      >
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <select
                        value={estimate.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateEstimateStatus(estimate.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Details Panel */}
        {selectedEstimate && (
          <aside className="details-panel">
            <div className="panel-header">
              <h2>Request Details</h2>
              <button 
                onClick={() => setSelectedEstimate(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="panel-content">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedEstimate.name}</p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedEstimate.email}`}>{selectedEstimate.email}</a></p>
                <p><strong>Phone:</strong> <a href={`tel:${selectedEstimate.phone}`}>{selectedEstimate.phone}</a></p>
                {selectedEstimate.address && <p><strong>Address:</strong> {selectedEstimate.address}</p>}
              </div>

              <div className="detail-section">
                <h3>Service Details</h3>
                <p><strong>Service Type:</strong> {selectedEstimate.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                <p><strong>Priority:</strong> {selectedEstimate.priority}</p>
                <p><strong>Status:</strong> {selectedEstimate.status}</p>
                {selectedEstimate.preferred_date && <p><strong>Preferred Date:</strong> {new Date(selectedEstimate.preferred_date).toLocaleDateString()}</p>}
                {selectedEstimate.preferred_time && <p><strong>Preferred Time:</strong> {selectedEstimate.preferred_time}</p>}
                <p><strong>Submitted:</strong> {new Date(selectedEstimate.created_at).toLocaleString()}</p>
              </div>

              {selectedEstimate.description && (
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedEstimate.description}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Internal Notes</h3>
                <textarea
                  value={selectedEstimate.notes || ''}
                  onChange={(e) => setSelectedEstimate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add internal notes..."
                  rows="4"
                  className="notes-textarea"
                />
                <button 
                  onClick={() => addNotes(selectedEstimate.id, selectedEstimate.notes)}
                  className="save-notes-btn"
                >
                  Save Notes
                </button>
              </div>

              <div className="detail-section">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    onClick={() => window.open(`mailto:${selectedEstimate.email}?subject=K&E HVAC - Your Estimate Request`)}
                    className="action-btn"
                  >
                    📧 Email
                  </button>
                  <button 
                    onClick={() => window.open(`tel:${selectedEstimate.phone}`)}
                    className="action-btn"
                  >
                    📞 Call
                  </button>
                  <button 
                    onClick={() => updateEstimateStatus(selectedEstimate.id, 'contacted')}
                    className="action-btn"
                    disabled={selectedEstimate.status === 'contacted'}
                  >
                    ✓ Mark Contacted
                  </button>
                  <button 
                    onClick={() => updateEstimateStatus(selectedEstimate.id, 'scheduled')}
                    className="action-btn"
                    disabled={selectedEstimate.status === 'scheduled'}
                  >
                    📅 Mark Scheduled
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AdminEstimates;