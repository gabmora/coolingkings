// components/admin/GeocodingSetup.jsx - Simple setup component
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const GeocodingSetup = () => {
  const [stats, setStats] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Simple geocoding function without external dependencies
  const geocodeAddress = async (address) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not found. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results[0]) {
      const location = data.results[0].geometry.location;
      return {
        success: true,
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: data.results[0].formatted_address
      };
    } else {
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
  };

  // Load initial statistics
  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, city, state, zip, latitude, longitude, geocoding_status')
        .neq('address', '')
        .not('address', 'is', null);

      if (error) throw error;

      const statsData = {
        total: data.length,
        success: data.filter(c => c.latitude && c.longitude).length,
        failed: data.filter(c => c.geocoding_status === 'failed').length,
        pending: data.filter(c => !c.latitude && (!c.geocoding_status || c.geocoding_status === 'pending')).length
      };

      statsData.percentage = statsData.total > 0 ? Math.round((statsData.success / statsData.total) * 100) : 0;
      
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(error.message);
    }
  };

  // Get customers that need geocoding
  const getCustomersNeedingGeocoding = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, city, state, zip')
        .is('latitude', null)
        .neq('address', '')
        .not('address', 'is', null)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting customers for geocoding:', error);
      return [];
    }
  };

  // Update customer with geocoding results
  const updateCustomerGeocoding = async (customerId, result) => {
    try {
      if (result.success) {
        const { error } = await supabase
          .from('customers')
          .update({
            latitude: result.latitude,
            longitude: result.longitude,
            geocoding_status: 'success',
            geocoded_at: new Date().toISOString()
          })
          .eq('id', customerId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .update({
            geocoding_status: 'failed',
            geocoded_at: new Date().toISOString()
          })
          .eq('id', customerId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating customer geocoding:', error);
      throw error;
    }
  };

  // Process geocoding batch

// Replace lines around 120-180 with this corrected version:
  const processGeocodingBatch = async (batchSize = 5) => {
    try {
      setProcessing(true);
      setError(null);
      
      const customers = await getCustomersNeedingGeocoding(batchSize);
      
      if (customers.length === 0) {
        setProgress({ message: 'No customers need geocoding!', complete: true });
        return;
      }

      const batchResults = [];
      
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        setProgress({
          current: i + 1,
          total: customers.length,
          message: `Geocoding ${customer.name}...`
        });

        // FIXED: Declare fullAddress outside of try-catch so it's accessible in both blocks
        const fullAddress = [
          customer.address,
          customer.city,
          customer.state,
          customer.zip
        ].filter(Boolean).join(', ');

        try {
          console.log(`Geocoding: ${customer.name} - ${fullAddress}`);

          // Geocode the address
          const result = await geocodeAddress(fullAddress);
          
          // Update database
          await updateCustomerGeocoding(customer.id, result);
          
          batchResults.push({
            customer: customer.name,
            address: fullAddress,
            success: true,
            coordinates: `${result.latitude}, ${result.longitude}`
          });

          console.log(`✅ Success: ${customer.name}`);

        } catch (error) {
          console.error(`❌ Failed: ${customer.name} - ${error.message}`);
          
          // Mark as failed in database
          await updateCustomerGeocoding(customer.id, { success: false });
          
          batchResults.push({
            customer: customer.name,
            address: fullAddress, // FIXED: Now fullAddress is accessible here
            success: false,
            error: error.message
          });
        }

        // Add delay between requests to avoid rate limiting
        if (i < customers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      setResults(batchResults);
      setProgress({
        complete: true,
        message: `Completed batch: ${batchResults.filter(r => r.success).length}/${batchResults.length} successful`
      });

      // Reload stats
      await loadStats();

    } catch (error) {
      console.error('Geocoding batch error:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
          🗺️ Geocoding Setup
        </h1>
        <p style={{ margin: '0 0 32px 0', color: '#6b7280' }}>
          This will convert customer addresses to map coordinates for the map dashboard.
        </p>

        {/* Stats Display */}
        {stats && (
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Current Status
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  TOTAL CUSTOMERS
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {stats.success}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  GEOCODED
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                  {stats.failed}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  FAILED
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                  {stats.pending}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  PENDING
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                  {stats.percentage}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  SUCCESS RATE
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Progress Display */}
        {progress && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            {!progress.complete && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  background: '#e5e7eb',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#3b82f6',
                    height: '100%',
                    width: `${(progress.current / progress.total) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {progress.current} / {progress.total}
                </div>
              </div>
            )}
            <div style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '500' }}>
              {progress.message}
            </div>
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
              Batch Results:
            </h4>
            {results.map((result, index) => (
              <div key={index} style={{
                fontSize: '12px',
                padding: '4px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ 
                  color: result.success ? '#059669' : '#dc2626',
                  marginRight: '8px'
                }}>
                  {result.success ? '✅' : '❌'}
                </span>
                <strong>{result.customer}</strong>
                {result.success ? (
                  <span style={{ color: '#6b7280' }}> → {result.coordinates}</span>
                ) : (
                  <span style={{ color: '#dc2626' }}> → {result.error}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {stats && stats.pending > 0 && (
            <button
              onClick={() => processGeocodingBatch(5)}
              disabled={processing}
              style={{
                background: processing ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {processing ? '🔄 Processing...' : `🚀 Geocode Next ${Math.min(5, stats.pending)} Addresses`}
            </button>
          )}

          <button
            onClick={loadStats}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh Stats
          </button>

          {stats && stats.pending === 0 && (
            <button
              onClick={() => window.location.href = '/admin/map'}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗺️ Go to Map Dashboard
            </button>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
            💡 Instructions:
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', color: '#92400e' }}>
            <li>Process addresses in small batches to avoid API rate limits</li>
            <li>Failed addresses can be manually geocoded later</li>
            <li>Make sure your Google Maps API key is configured correctly</li>
            <li>The process may take several minutes for large customer lists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeocodingSetup;