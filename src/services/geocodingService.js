// services/geocodingService.js - Updated to support both customer and work order views
import { supabase } from './supabase';

class GeocodingService {
  constructor() {
    this.googleMapsLoaded = false;
    this.loadingPromise = null;
    this.useMockData = false;
  }

  // Load Google Maps API
  async loadGoogleMaps() {
    if (this.googleMapsLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.maps) {
        this.googleMapsLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.googleMapsLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  // Get customers map data
  async getCustomersMapData(filters = {}) {
    console.log('🔍 Fetching customers map data with filters:', filters);
    
    if (this.useMockData) {
      return this.getMockCustomersData(filters);
    }

    try {
      // Build customer query
      let customersQuery = supabase
        .from('customers')
        .select(`
          id,
          name,
          address,
          city,
          state,
          zip,
          type,
          phone,
          email,
          latitude,
          longitude
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Apply customer type filter
      if (filters.customerType && filters.customerType !== 'all') {
        customersQuery = customersQuery.eq('type', filters.customerType);
      }

      const { data: customers, error: customersError } = await customersQuery;

      if (customersError) {
        throw customersError;
      }

      // Get work order counts for each customer
      const customerIds = customers.map(c => c.id);
      
      let workOrdersQuery = supabase
        .from('work_orders')
        .select(`
          customer_id,
          status,
          created_at
        `)
        .in('customer_id', customerIds);

      // Apply date filters for work orders if specified
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          workOrdersQuery = workOrdersQuery.gte('created_at', startDate.toISOString());
        }
      }

      const { data: workOrders, error: workOrdersError } = await workOrdersQuery;

      if (workOrdersError) {
        throw workOrdersError;
      }

      // Calculate work order counts for each customer
      const workOrderCounts = {};
      workOrders.forEach(wo => {
        if (!workOrderCounts[wo.customer_id]) {
          workOrderCounts[wo.customer_id] = {
            total: 0,
            active: 0
          };
        }
        workOrderCounts[wo.customer_id].total++;
        if (['pending', 'scheduled', 'in-progress'].includes(wo.status)) {
          workOrderCounts[wo.customer_id].active++;
        }
      });

      // Add work order counts to customers and apply filters
      let customersWithWorkOrders = customers.map(customer => ({
        ...customer,
        latitude: parseFloat(customer.latitude),
        longitude: parseFloat(customer.longitude),
        total_work_orders: workOrderCounts[customer.id]?.total || 0,
        active_work_orders: workOrderCounts[customer.id]?.active || 0
      }));

      // Apply hasActiveWorkOrders filter
      if (filters.hasActiveWorkOrders) {
        customersWithWorkOrders = customersWithWorkOrders.filter(c => c.active_work_orders > 0);
      }

      console.log(`📊 Loaded ${customersWithWorkOrders.length} customers for map`);
      return customersWithWorkOrders;

    } catch (error) {
      console.error('❌ Error fetching customers map data:', error);
      console.log('📊 Falling back to mock data');
      return this.getMockCustomersData(filters);
    }
  }

  // Get map dashboard data from Supabase (work orders view)
  async getMapDashboardData(filters = {}) {
    console.log('🔍 Fetching work orders map data with filters:', filters);
    
    if (this.useMockData) {
      console.log('📊 Using mock data for development');
      const mockData = this.getMockMapData(filters);
      console.log(`📊 Loaded ${mockData.length} properties for map`);
      return mockData;
    }

    try {
      // Get all customers with geocoded addresses
      let customersQuery = supabase
        .from('customers')
        .select(`
          id,
          name,
          address,
          city,
          state,
          zip,
          type,
          phone,
          email,
          latitude,
          longitude
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      const { data: customers, error: customersError } = await customersQuery;

      if (customersError) {
        throw customersError;
      }

      // Get work orders for customers
      const customerIds = customers.map(c => c.id);
      
      let workOrdersQuery = supabase
        .from('work_orders')
        .select(`
          id,
          customer_id,
          title,
          description,
          work_order_number,
          service_date,
          status,
          priority,
          service_type,
          created_at
        `)
        .in('customer_id', customerIds);

      // Apply status filter if specified
      if (filters.status && filters.status !== 'all') {
        workOrdersQuery = workOrdersQuery.eq('status', filters.status);
      }

      // Apply service type filter if specified
      if (filters.serviceType && filters.serviceType !== 'all') {
        workOrdersQuery = workOrdersQuery.eq('service_type', filters.serviceType);
      }

      // Apply date filters
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          workOrdersQuery = workOrdersQuery.gte('service_date', startDate.toISOString().split('T')[0]);
        }
      }

      // Only get active work orders for map display if activeOnly is true
      if (filters.activeOnly) {
        workOrdersQuery = workOrdersQuery.in('status', ['pending', 'scheduled', 'in-progress']);
      }

      const { data: workOrders, error: workOrdersError } = await workOrdersQuery;

      if (workOrdersError) {
        throw workOrdersError;
      }

      // Group work orders by customer and create property objects
      const workOrdersByCustomer = {};
      workOrders.forEach(wo => {
        if (!workOrdersByCustomer[wo.customer_id]) {
          workOrdersByCustomer[wo.customer_id] = [];
        }
        workOrdersByCustomer[wo.customer_id].push(wo);
      });

      // Group customers by address to create properties
      const propertiesByAddress = {};
      
      customers.forEach(customer => {
        const addressKey = `${customer.address}-${customer.city}-${customer.state}`;
        
        if (!propertiesByAddress[addressKey]) {
          propertiesByAddress[addressKey] = {
            property_id: customer.id,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zip: customer.zip,
            latitude: parseFloat(customer.latitude),
            longitude: parseFloat(customer.longitude),
            property_type: customer.type,
            customers: [],
            all_work_orders: []
          };
        }

        propertiesByAddress[addressKey].customers.push(customer);
        
        // Add work orders for this customer
        const customerWorkOrders = workOrdersByCustomer[customer.id] || [];
        propertiesByAddress[addressKey].all_work_orders.push(...customerWorkOrders);
      });

      // Convert to array and calculate work order statistics
      const properties = Object.values(propertiesByAddress).map(property => {
        const workOrders = property.all_work_orders;
        
        // Count work orders by status
        const pending_count = workOrders.filter(wo => wo.status === 'pending').length;
        const scheduled_count = workOrders.filter(wo => wo.status === 'scheduled').length;
        const in_progress_count = workOrders.filter(wo => wo.status === 'in-progress').length;
        const completed_count = workOrders.filter(wo => wo.status === 'completed').length;
        
        // Find highest priority
        const priorityOrder = { emergency: 5, urgent: 4, high: 3, normal: 2, low: 1 };
        const highest_priority = workOrders.reduce((highest, wo) => {
          const woPriority = priorityOrder[wo.priority] || 0;
          const currentHighest = priorityOrder[highest] || 0;
          return woPriority > currentHighest ? wo.priority : highest;
        }, 'low');

        // Apply priority filter
        if (filters.priority && filters.priority !== 'all') {
          if (highest_priority !== filters.priority) {
            return null;
          }
        }

        // Filter active work orders for details
        const activeWorkOrders = workOrders.filter(wo => 
          ['pending', 'scheduled', 'in-progress'].includes(wo.status)
        );

        // Apply activeOnly filter
        if (filters.activeOnly && activeWorkOrders.length === 0) {
          return null;
        }

        return {
          property_id: property.property_id,
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
          property_type: property.property_type,
          latitude: property.latitude,
          longitude: property.longitude,
          customer_count: property.customers.length,
          active_work_orders: activeWorkOrders.length,
          pending_count,
          scheduled_count,
          in_progress_count,
          completed_count,
          highest_priority: activeWorkOrders.length > 0 ? highest_priority : null,
          active_work_order_details: activeWorkOrders.map(wo => ({
            id: wo.id,
            work_order_number: wo.work_order_number,
            title: wo.title,
            service_type: wo.service_type,
            status: wo.status,
            priority: wo.priority
          }))
        };
      }).filter(property => property !== null);

      console.log(`📊 Loaded ${properties.length} properties for map`);
      return properties;

    } catch (error) {
      console.error('❌ Error fetching work orders map data:', error);
      console.log('📊 Falling back to mock data');
      const mockData = this.getMockMapData(filters);
      console.log(`📊 Loaded ${mockData.length} properties for map`);
      return mockData;
    }
  }

  // Get customer details
  async getCustomerDetails(customerId) {
    try {
      // Get customer info
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      // Get work orders for this customer
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (workOrdersError) throw workOrdersError;

      return {
        ...customer,
        work_orders: workOrders
      };

    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  }

  // Get geocoding statistics from Supabase
  async getGeocodingStats() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('latitude, longitude, geocoding_status')
        .neq('address', '')
        .not('address', 'is', null);

      if (error) throw error;

      const stats = {
        total: data.length,
        success: data.filter(c => c.latitude && c.longitude).length,
        failed: data.filter(c => c.geocoding_status === 'failed').length,
        pending: data.filter(c => !c.latitude && (!c.geocoding_status || c.geocoding_status === 'pending')).length
      };

      stats.percentage = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;
      
      return stats;
    } catch (error) {
      console.error('Error fetching geocoding stats:', error);
      return {
        total: 0,
        success: 0,
        pending: 0,
        failed: 0,
        percentage: 0
      };
    }
  }

  // Get property details from Supabase
  async getPropertyDetails(address, city, state) {
    try {
      // Get customers at this address
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          type,
          phone,
          email
        `)
        .eq('address', address)
        .eq('city', city)
        .eq('state', state);

      if (customersError) throw customersError;

      // Get work orders for these customers
      const customerIds = customers.map(c => c.id);
      
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select(`
          id,
          customer_id,
          title,
          work_order_number,
          service_date,
          status,
          service_type,
          priority
        `)
        .in('customer_id', customerIds)
        .order('created_at', { ascending: false });

      if (workOrdersError) throw workOrdersError;

      // Group work orders by customer
      const workOrdersByCustomer = {};
      workOrders.forEach(wo => {
        if (!workOrdersByCustomer[wo.customer_id]) {
          workOrdersByCustomer[wo.customer_id] = [];
        }
        workOrdersByCustomer[wo.customer_id].push(wo);
      });

      // Add work orders to customers
      const customersWithWorkOrders = customers.map(customer => ({
        ...customer,
        work_orders: workOrdersByCustomer[customer.id] || []
      }));

      return customersWithWorkOrders;

    } catch (error) {
      console.error('Error fetching property details:', error);
      return this.getMockPropertyDetails(address);
    }
  }

  // Batch geocode customers using Supabase
  async batchGeocodeCustomers(batchSize = 20) {
    try {
      // Get customers that need geocoding
      const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name, address, city, state, zip')
        .is('latitude', null)
        .neq('address', '')
        .not('address', 'is', null)
        .limit(batchSize);

      if (error) throw error;

      if (customers.length === 0) {
        return { processed: 0, successful: 0, failed: 0, message: 'No customers need geocoding' };
      }

      let successful = 0;
      let failed = 0;

      // Process each customer
      for (const customer of customers) {
        try {
          const result = await this.geocodeAddress(
            customer.address,
            customer.city,
            customer.state,
            customer.zip
          );

          // Update customer with geocoding results
          const { error: updateError } = await supabase
            .from('customers')
            .update({
              latitude: result.latitude,
              longitude: result.longitude,
              geocoding_status: 'success',
              geocoded_at: new Date().toISOString()
            })
            .eq('id', customer.id);

          if (updateError) throw updateError;

          successful++;
          console.log(`✅ Geocoded: ${customer.name} - ${customer.address}`);

        } catch (error) {
          console.error(`❌ Failed: ${customer.name} - ${error.message}`);
          
          // Mark as failed
          await supabase
            .from('customers')
            .update({
              geocoding_status: 'failed',
              geocoded_at: new Date().toISOString()
            })
            .eq('id', customer.id);

          failed++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return {
        processed: customers.length,
        successful,
        failed,
        message: `Processed ${customers.length} customers: ${successful} successful, ${failed} failed`
      };

    } catch (error) {
      console.error('Error running geocoding batch:', error);
      throw error;
    }
  }

  // Geocode a single address
  async geocodeAddress(address, city, state, zip) {
    await this.loadGoogleMaps();
    
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      const fullAddress = `${address}, ${city}, ${state} ${zip || ''}`.trim();
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            formatted_address: results[0].formatted_address,
            place_id: results[0].place_id
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }


  // Enhanced geocoding with better address formatting and validation
// Add these methods to your geocodingService.js

// Enhanced geocode address with better formatting and validation
async geocodeAddress(address, city, state, zip) {
  await this.loadGoogleMaps();
  
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    
    // Clean and format the address for better accuracy
    const cleanAddress = this.formatAddressForGeocoding(address, city, state, zip);
    console.log(`🔍 Geocoding formatted address: "${cleanAddress}"`);
    
    const geocodeOptions = {
      address: cleanAddress,
      region: 'US', // Bias towards US addresses
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(32.0, -81.0), // Southwest bounds for SC area
        new window.google.maps.LatLng(32.5, -80.0)  // Northeast bounds for SC area
      ),
      componentRestrictions: {
        country: 'US',
        administrativeArea: state // Restrict to the state
      }
    };
    
    geocoder.geocode(geocodeOptions, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        // Sort results by accuracy and location type
        const bestResult = this.selectBestGeocodingResult(results, city, state);
        const location = bestResult.geometry.location;
        
        console.log(`✅ Geocoded "${cleanAddress}" to:`, {
          lat: location.lat(),
          lng: location.lng(),
          accuracy: bestResult.geometry.location_type,
          formatted: bestResult.formatted_address
        });
        
        resolve({
          latitude: location.lat(),
          longitude: location.lng(),
          formatted_address: bestResult.formatted_address,
          place_id: bestResult.place_id,
          accuracy: bestResult.geometry.location_type,
          address_components: bestResult.address_components
        });
      } else {
        console.error(`❌ Geocoding failed for "${cleanAddress}": ${status}`);
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

// Format address for better geocoding accuracy
formatAddressForGeocoding(address, city, state, zip) {
  // Clean up common address issues
  let cleanAddress = address.trim();
  let cleanCity = city.trim();
  let cleanState = state.trim().toUpperCase();
  let cleanZip = zip ? zip.trim() : '';
  
  // Standardize apartment/unit formats
  cleanAddress = cleanAddress
    .replace(/\b(apt|apartment|unit|ste|suite|#)\s*\.?\s*/gi, 'Unit ')
    .replace(/\bunit\s+(\d+)/gi, 'Unit $1')
    .trim();
  
  // Remove extra spaces and normalize
  cleanAddress = cleanAddress.replace(/\s+/g, ' ');
  
  // Handle common abbreviations and expand them
  const streetAbbreviations = {
    'St': 'Street',
    'Ave': 'Avenue', 
    'Blvd': 'Boulevard',
    'Dr': 'Drive',
    'Rd': 'Road',
    'Ln': 'Lane',
    'Ct': 'Court',
    'Pl': 'Place',
    'Cir': 'Circle',
    'Way': 'Way'
  };
  
  // Replace abbreviations at the end of street names
  Object.entries(streetAbbreviations).forEach(([abbrev, full]) => {
    const regex = new RegExp(`\\b${abbrev}\\b(?=\\s|$)`, 'gi');
    cleanAddress = cleanAddress.replace(regex, full);
  });
  
  // Build the full address string
  const addressParts = [cleanAddress, cleanCity, cleanState];
  if (cleanZip) {
    addressParts.push(cleanZip);
  }
  
  return addressParts.join(', ');
}

// Select the best geocoding result from multiple options
selectBestGeocodingResult(results, expectedCity, expectedState) {
  // Scoring system for result quality
  const scoreResult = (result) => {
    let score = 0;
    
    // Location type scoring (higher is better)
    const locationTypeScores = {
      'ROOFTOP': 100,          // Most accurate
      'RANGE_INTERPOLATED': 80, // Very good
      'GEOMETRIC_CENTER': 60,   // Good
      'APPROXIMATE': 20         // Least accurate
    };
    
    score += locationTypeScores[result.geometry.location_type] || 0;
    
    // Check if city and state match what we expect
    const addressComponents = result.address_components || [];
    let cityMatch = false;
    let stateMatch = false;
    
    addressComponents.forEach(component => {
      const types = component.types || [];
      
      if (types.includes('locality') || types.includes('administrative_area_level_3')) {
        if (component.long_name.toLowerCase().includes(expectedCity.toLowerCase())) {
          cityMatch = true;
          score += 50;
        }
      }
      
      if (types.includes('administrative_area_level_1')) {
        if (component.short_name.toUpperCase() === expectedState.toUpperCase()) {
          stateMatch = true;
          score += 30;
        }
      }
    });
    
    // Bonus for having street number (more specific)
    const hasStreetNumber = addressComponents.some(comp => 
      comp.types.includes('street_number')
    );
    if (hasStreetNumber) score += 20;
    
    // Penalty for results that are too generic
    const isGeneric = result.types.some(type => 
      ['country', 'administrative_area_level_1', 'administrative_area_level_2'].includes(type)
    );
    if (isGeneric) score -= 50;
    
    return { result, score, cityMatch, stateMatch };
  };
  
  // Score all results
  const scoredResults = results.map(scoreResult);
  
  // Sort by score (highest first)
  scoredResults.sort((a, b) => b.score - a.score);
  
  // Log the scoring for debugging
  console.log('🎯 Geocoding result scoring:', scoredResults.map(sr => ({
    address: sr.result.formatted_address,
    score: sr.score,
    accuracy: sr.result.geometry.location_type,
    cityMatch: sr.cityMatch,
    stateMatch: sr.stateMatch
  })));
  
  return scoredResults[0].result;
}

// Validate geocoding result accuracy
validateGeocodingResult(result, originalAddress, city, state) {
  const warnings = [];
  const errors = [];
  
  // Check accuracy level
  const accuracy = result.accuracy || result.geometry?.location_type;
  if (accuracy === 'APPROXIMATE') {
    warnings.push('Low accuracy geocoding - result may not be precise');
  }
  
  // Check if result is in expected area (rough bounds check for SC)
  const lat = result.latitude;
  const lng = result.longitude;
  
  if (state.toUpperCase() === 'SC') {
    if (lat < 32.0 || lat > 35.2 || lng < -83.4 || lng > -78.5) {
      errors.push('Geocoded location appears to be outside South Carolina');
    }
  }
  
  // Check city match
  const formattedAddress = result.formatted_address || '';
  if (!formattedAddress.toLowerCase().includes(city.toLowerCase())) {
    warnings.push(`Geocoded address may not match expected city: ${city}`);
  }
  
  return { warnings, errors, isValid: errors.length === 0 };
}

// Enhanced batch geocoding with validation and retry logic
async batchGeocodeCustomers(batchSize = 10) { // Reduced batch size for better accuracy
  try {
    // Get customers that need geocoding
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, address, city, state, zip')
      .is('latitude', null)
      .neq('address', '')
      .not('address', 'is', null)
      .limit(batchSize);

    if (error) throw error;

    if (customers.length === 0) {
      return { processed: 0, successful: 0, failed: 0, message: 'No customers need geocoding' };
    }

    let successful = 0;
    let failed = 0;
    const results = [];

    // Process each customer with enhanced validation
    for (const customer of customers) {
      try {
        console.log(`🔍 Processing: ${customer.name} at ${customer.address}, ${customer.city}, ${customer.state}`);
        
        const result = await this.geocodeAddress(
          customer.address,
          customer.city,
          customer.state,
          customer.zip
        );

        // Validate the result
        const validation = this.validateGeocodingResult(result, customer.address, customer.city, customer.state);
        
        if (!validation.isValid) {
          console.error(`❌ Validation failed for ${customer.name}:`, validation.errors);
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        if (validation.warnings.length > 0) {
          console.warn(`⚠️ Warnings for ${customer.name}:`, validation.warnings);
        }

        // Update customer with geocoding results
        const updateData = {
          latitude: result.latitude,
          longitude: result.longitude,
          geocoding_status: 'success',
          geocoded_at: new Date().toISOString()
        };

        // Store additional geocoding metadata if needed
        if (result.formatted_address) {
          updateData.formatted_address = result.formatted_address;
        }

        const { error: updateError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', customer.id);

        if (updateError) throw updateError;

        successful++;
        results.push({
          customer: customer.name,
          address: `${customer.address}, ${customer.city}, ${customer.state}`,
          success: true,
          coordinates: `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`,
          accuracy: result.accuracy,
          warnings: validation.warnings
        });

        console.log(`✅ Successfully geocoded: ${customer.name}`);

      } catch (error) {
        console.error(`❌ Failed: ${customer.name} - ${error.message}`);
        
        // Mark as failed with error details
        await supabase
          .from('customers')
          .update({
            geocoding_status: 'failed',
            geocoded_at: new Date().toISOString(),
            geocoding_error: error.message
          })
          .eq('id', customer.id);

        failed++;
        results.push({
          customer: customer.name,
          address: `${customer.address}, ${customer.city}, ${customer.state}`,
          success: false,
          error: error.message
        });
      }

      // Add delay to avoid rate limiting and improve accuracy
      await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
    }

    return {
      processed: customers.length,
      successful,
      failed,
      results,
      message: `Processed ${customers.length} customers: ${successful} successful, ${failed} failed`
    };

  } catch (error) {
    console.error('Error running geocoding batch:', error);
    throw error;
  }
}
  

  

  
}

// Export singleton instance
export const geocodingService = new GeocodingService();
export default geocodingService;