// components/admin/MapDashboard.jsx - Enhanced with customer/work order view toggle
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { geocodingService } from '../../services/geocodingService';
import './MapDashboard.css';

const MapDashboard = () => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [geocodingStats, setGeocodingStats] = useState(null);
  const [viewMode, setViewMode] = useState('work_orders'); // 'customers' or 'work_orders'
  const [filters, setFilters] = useState({
    // Work order filters
    activeOnly: true,
    status: 'all',
    priority: 'all',
    dateRange: 'all', // 'today', 'week', 'month', 'all'
    serviceType: 'all',
    // Customer filters
    customerType: 'all', // 'residential', 'commercial', 'all'
    hasActiveWorkOrders: false
  });

  // Map configuration
  const defaultCenter = { lat: 32.2319, lng: -80.7906 }; // Bluffton, SC
  const defaultZoom = 12;

  // Load map data based on current view mode
  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      if (viewMode === 'work_orders') {
        data = await geocodingService.getMapDashboardData(filters);
      } else {
        data = await geocodingService.getCustomersMapData(filters);
      }
      
      setMapData(data);
      
      // Update map markers
      if (googleMapRef.current) {
        updateMapMarkers(data);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, viewMode]);

  // Load geocoding statistics
  const loadGeocodingStats = useCallback(async () => {
    try {
      const stats = await geocodingService.getGeocodingStats();
      setGeocodingStats(stats);
    } catch (error) {
      console.error('Error loading geocoding stats:', error);
    }
  }, []);

  // Initialize Google Map
  useEffect(() => {
    const initMap = async () => {
      try {
        await geocodingService.loadGoogleMaps();
        
        if (mapRef.current && !googleMapRef.current) {
          googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: defaultZoom,
            mapTypeId: 'roadmap',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          // Initialize info window
          infoWindowRef.current = new window.google.maps.InfoWindow();
          
          console.log('✅ Google Map initialized');
        }
      } catch (error) {
        console.error('❌ Failed to initialize map:', error);
      }
    };

    initMap();
  }, []);

  // Load initial data
  useEffect(() => {
    loadMapData();
    loadGeocodingStats();
  }, [loadMapData, loadGeocodingStats]);

  // Get marker color based on view mode and data
  const getMarkerColor = (item) => {
    if (viewMode === 'work_orders') {
      // Work order view - color by priority and status
      if (item.in_progress_count > 0) return '#3b82f6'; // Blue for in-progress
      if (item.highest_priority === 'emergency') return '#ef4444'; // Red for emergency
      if (item.highest_priority === 'urgent') return '#f59e0b'; // Orange for urgent
      if (item.pending_count > 0) return '#eab308'; // Yellow for pending
      if (item.scheduled_count > 0) return '#8b5cf6'; // Purple for scheduled
      return '#6b7280'; // Gray for completed/low priority
    } else {
      // Customer view - color by customer type and activity
      if (item.active_work_orders > 0) {
        return item.type === 'commercial' ? '#dc2626' : '#3b82f6'; // Red for commercial, blue for residential with work orders
      }
      return item.type === 'commercial' ? '#f59e0b' : '#10b981'; // Orange for commercial, green for residential
    }
  };

  // Create marker icon
  const createMarkerIcon = (item) => {
    const color = getMarkerColor(item);
    let size;
    
    if (viewMode === 'work_orders') {
      size = Math.min(Math.max(item.active_work_orders * 8 + 20, 20), 40);
    } else {
      size = Math.min(Math.max((item.active_work_orders || 0) * 6 + 15, 15), 35);
    }
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: size / 4
    };
  };

  // Create info window content based on view mode
  const createInfoWindowContent = (item) => {
    if (viewMode === 'work_orders') {
      return createWorkOrderInfoWindow(item);
    } else {
      return createCustomerInfoWindow(item);
    }
  };

  // Work order info window
  const createWorkOrderInfoWindow = (property) => {
    const workOrders = property.active_work_order_details?.filter(wo => wo) || [];
    
    return `
      <div style="max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
          🏢 ${property.address}
        </div>
        <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
          ${property.city}, ${property.state} ${property.zip || ''}
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px; color: #374151;">
            <strong>🏠 Property Type:</strong> ${property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
          </div>
          <div style="font-size: 13px; color: #374151;">
            <strong>👥 Customers:</strong> ${property.customer_count}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          ${property.pending_count > 0 ? `<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">⏳ ${property.pending_count} Pending</span>` : ''}
          ${property.scheduled_count > 0 ? `<span style="background: #e9d5ff; color: #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">📅 ${property.scheduled_count} Scheduled</span>` : ''}
          ${property.in_progress_count > 0 ? `<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">🔧 ${property.in_progress_count} In Progress</span>` : ''}
        </div>

        ${workOrders.length > 0 ? `
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #374151;">Active Work Orders:</div>
            ${workOrders.slice(0, 3).map(wo => `
              <div style="font-size: 12px; margin-bottom: 4px; padding: 4px; background: #f8fafc; border-radius: 4px;">
                <strong>${wo.work_order_number || wo.id.toString().slice(0, 8)}</strong> - ${wo.title}
                <br><span style="color: #6b7280;">${wo.service_type} • ${wo.status}</span>
              </div>
            `).join('')}
            ${workOrders.length > 3 ? `<div style="font-size: 11px; color: #6b7280;">+${workOrders.length - 3} more...</div>` : ''}
          </div>
        ` : ''}

        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <button 
            onclick="window.selectProperty('${property.property_id}')" 
            style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 8px;"
          >
            📋 View Details
          </button>
          <button 
            onclick="window.createWorkOrder('${property.address}')" 
            style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;"
          >
            ➕ New Work Order
          </button>
        </div>
      </div>
    `;
  };

  // Customer info window
  const createCustomerInfoWindow = (customer) => {
    return `
      <div style="max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
          👤 ${customer.name}
        </div>
        <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
          📍 ${customer.address}, ${customer.city}, ${customer.state} ${customer.zip || ''}
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px; color: #374151;">
            <strong>🏢 Type:</strong> 
            <span style="background: ${customer.type === 'commercial' ? '#fef3c7' : '#dbeafe'}; color: ${customer.type === 'commercial' ? '#92400e' : '#1d4ed8'}; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-left: 4px;">
              ${customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
            </span>
          </div>
          <div style="font-size: 13px; color: #374151; margin-top: 4px;">
            <strong>📞 Phone:</strong> ${customer.phone}
          </div>
          ${customer.email ? `
            <div style="font-size: 13px; color: #374151; margin-top: 4px;">
              <strong>✉️ Email:</strong> ${customer.email}
            </div>
          ` : ''}
        </div>

        ${customer.active_work_orders > 0 ? `
          <div style="background: #fef3c7; padding: 8px; border-radius: 6px; margin-bottom: 12px;">
            <div style="font-size: 12px; color: #92400e; font-weight: 500;">
              🔧 ${customer.active_work_orders} Active Work Order${customer.active_work_orders > 1 ? 's' : ''}
            </div>
          </div>
        ` : `
          <div style="background: #d1fae5; padding: 8px; border-radius: 6px; margin-bottom: 12px;">
            <div style="font-size: 12px; color: #065f46; font-weight: 500;">
              ✅ No Active Work Orders
            </div>
          </div>
        `}

        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <button 
            onclick="window.selectCustomer('${customer.id}')" 
            style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 8px;"
          >
            👤 View Customer
          </button>
          <button 
            onclick="window.createWorkOrder('${customer.address}')" 
            style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;"
          >
            ➕ New Work Order
          </button>
        </div>
      </div>
    `;
  };

  // Update map markers
  const updateMapMarkers = (data) => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    data.forEach(item => {
      if (!item.latitude || !item.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: item.latitude, lng: item.longitude },
        map: googleMapRef.current,
        icon: createMarkerIcon(item),
        title: viewMode === 'work_orders' 
          ? `${item.address} - ${item.active_work_orders} active work orders`
          : `${item.name} - ${item.address}`
      });

      // Add click listener
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(createInfoWindowContent(item));
        infoWindowRef.current.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      googleMapRef.current.fitBounds(bounds);
      
      // Don't zoom in too much
      window.google.maps.event.addListenerOnce(googleMapRef.current, 'bounds_changed', () => {
        if (googleMapRef.current.getZoom() > 16) {
          googleMapRef.current.setZoom(16);
        }
      });
    }
  };

  // Handle property selection from info window
  const selectProperty = async (propertyId) => {
    const property = mapData.find(p => p.property_id === parseInt(propertyId));
    if (property) {
      try {
        const details = await geocodingService.getPropertyDetails(
          property.address, 
          property.city, 
          property.state
        );
        setSelectedProperty({ ...property, customers: details });
        setShowSidebar(true);
      } catch (error) {
        console.error('Error loading property details:', error);
      }
    }
  };

  // Handle customer selection from info window
  const selectCustomer = async (customerId) => {
    const customer = mapData.find(c => c.id === customerId);
    if (customer) {
      try {
        const details = await geocodingService.getCustomerDetails(customerId);
        setSelectedProperty(details);
        setShowSidebar(true);
      } catch (error) {
        console.error('Error loading customer details:', error);
      }
    }
  };

  // Handle view mode change
  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    setSelectedProperty(null);
    setShowSidebar(false);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Run geocoding batch
  const runGeocodingBatch = async () => {
    try {
      setLoading(true);
      await geocodingService.batchGeocodeCustomers(20);
      await loadMapData();
      await loadGeocodingStats();
    } catch (error) {
      console.error('Error running geocoding batch:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose functions to window for info window buttons
  useEffect(() => {
    window.selectProperty = selectProperty;
    window.selectCustomer = selectCustomer;
    window.createWorkOrder = (address) => {
      console.log(`Create work order for ${address}`);
    };

    return () => {
      delete window.selectProperty;
      delete window.selectCustomer;
      delete window.createWorkOrder;
    };
  }, [mapData]);

  // Get filter summary
  const getFilterSummary = () => {
    const total = mapData.length;
    
    if (viewMode === 'work_orders') {
      const withWorkOrders = mapData.filter(p => p.active_work_orders > 0).length;
      return `${withWorkOrders} properties with active work orders (${total} total)`;
    } else {
      const withWorkOrders = mapData.filter(c => c.active_work_orders > 0).length;
      return `${total} customers (${withWorkOrders} with active work orders)`;
    }
  };

  return (
    <div className="map-dashboard">
      {/* Header */}
      <div className="map-header">
        <div className="header-left">
          <h1>🗺️ Service Map</h1>
          <p>{getFilterSummary()}</p>
        </div>
        
        <div className="header-controls">
          {geocodingStats && (
            <div className="geocoding-stats">
              <span className="stat-item">
                📍 {geocodingStats.success}/{geocodingStats.total} geocoded ({geocodingStats.percentage}%)
              </span>
              {geocodingStats.pending > 0 && (
                <button className="btn btn-sm btn-primary" onClick={runGeocodingBatch}>
                  🔄 Geocode {geocodingStats.pending} addresses
                </button>
              )}
            </div>
          )}
          
          <Link to="/admin/workorders/new" className="btn btn-primary">
            ➕ New Work Order
          </Link>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <div className="toggle-buttons">
          <button 
            className={`toggle-btn ${viewMode === 'work_orders' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('work_orders')}
          >
            🔧 Work Orders View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'customers' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('customers')}
          >
            👥 Customers View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="map-filters">
        {viewMode === 'work_orders' ? (
          <>
            {/* Work Order Filters */}
            <div className="filter-group">
              <label>View:</label>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filters.activeOnly ? 'active' : ''}`}
                  onClick={() => handleFilterChange('activeOnly', !filters.activeOnly)}
                >
                  Active Only
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Priority:</label>
              <select 
                value={filters.priority} 
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priorities</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Service Type:</label>
              <select 
                value={filters.serviceType} 
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Customer Filters */}
            <div className="filter-group">
              <label>Customer Type:</label>
              <select 
                value={filters.customerType} 
                onChange={(e) => handleFilterChange('customerType', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Work Orders:</label>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filters.hasActiveWorkOrders ? 'active' : ''}`}
                  onClick={() => handleFilterChange('hasActiveWorkOrders', !filters.hasActiveWorkOrders)}
                >
                  Has Active Work Orders
                </button>
              </div>
            </div>
          </>
        )}

        {/* Legend */}
        <div className="legend">
          {viewMode === 'work_orders' ? (
            <>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#ef4444'}}></span>
                Emergency
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#f59e0b'}}></span>
                Urgent
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#eab308'}}></span>
                Pending
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#3b82f6'}}></span>
                In Progress
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#8b5cf6'}}></span>
                Scheduled
              </span>
            </>
          ) : (
            <>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#dc2626'}}></span>
                Commercial (Active)
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#f59e0b'}}></span>
                Commercial
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#3b82f6'}}></span>
                Residential (Active)
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{backgroundColor: '#10b981'}}></span>
                Residential
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="map-content">
        {/* Map Container */}
        <div className="map-container">
          <div ref={mapRef} className="google-map" />
          
          {loading && (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <p>Loading {viewMode === 'work_orders' ? 'properties' : 'customers'}...</p>
            </div>
          )}
        </div>

        {/* Sidebar - content varies by view mode */}
        {showSidebar && selectedProperty && (
          <div className="map-sidebar">
            <div className="sidebar-header">
              <h3>{viewMode === 'work_orders' ? '📍 Property Details' : '👤 Customer Details'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowSidebar(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="sidebar-content">
              {/* Sidebar content will vary based on view mode and selected item */}
              <div className="property-info">
                <h4>{selectedProperty.name || selectedProperty.address}</h4>
                {viewMode === 'work_orders' ? (
                  <p>{selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}</p>
                ) : (
                  <p>{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}</p>
                )}
                
                <div className="property-stats">
                  {viewMode === 'work_orders' ? (
                    <>
                      <div className="stat">
                        <span className="stat-label">Property Type:</span>
                        <span className="stat-value">{selectedProperty.property_type}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Customers:</span>
                        <span className="stat-value">{selectedProperty.customer_count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Active Work Orders:</span>
                        <span className="stat-value">{selectedProperty.active_work_orders}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="stat">
                        <span className="stat-label">Customer Type:</span>
                        <span className="stat-value">{selectedProperty.type}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Phone:</span>
                        <span className="stat-value">{selectedProperty.phone}</span>
                      </div>
                      {selectedProperty.email && (
                        <div className="stat">
                          <span className="stat-label">Email:</span>
                          <span className="stat-value">{selectedProperty.email}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="sidebar-actions">
                <Link 
                  to={`/admin/workorders/new?address=${encodeURIComponent(selectedProperty.address || selectedProperty.name)}`}
                  className="btn btn-primary btn-full"
                >
                  ➕ Create Work Order
                </Link>
                
                <button 
                  className="btn btn-secondary btn-full"
                  onClick={() => {
                    const address = selectedProperty.address || selectedProperty.name;
                    const city = selectedProperty.city;
                    const state = selectedProperty.state;
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${state}`)}`;
                    window.open(url, '_blank');
                  }}
                >
                  🗺️ Open in Google Maps
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDashboard;