// components/admin/ChecklistWorkOrderForm.jsx - Complete HVAC Checklist Form
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCustomers } from '../../services/customerService';
import { supabase } from '../../services/supabase';
import './AdminDesignSystem.css';
import './AdminComponents.css';
import './AdminStyles.css';

const ChecklistWorkOrderForm = () => {
  const navigate = useNavigate();

  // Customer selection state
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [customerEquipment, setCustomerEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'SC',
    zip: ''
  });
  const [newCustomerEquipment, setNewCustomerEquipment] = useState([]);
  const searchResultsRef = useRef(null);

  // System Type Selection
  const [systemType, setSystemType] = useState('air_handler');

  // System Information
  const [systemInfo, setSystemInfo] = useState({
    area_zone: '',
    brand: '',
    model_number: '',
    serial_number: '',
    warranty_status: '',
    system_location: '',
    mca: '',
    mocp: '',
    breaker_size: '',
    wire_gauge: ''
  });

  // Air Handler Checklist State
  const [airHandlerChecklist, setAirHandlerChecklist] = useState({
    disconnect_condition: [],
    electrical_connections: [],
    control_board_condition: [],
    blower_motor_type: '',
    blower_motor_amps: '',
    blower_wheel_condition: [],
    heat_kit_installed: false,
    heat_kit_amps: '',
    heat_kit_condition: [],
    evaporator_coil_condition: [],
    refrigerant_line_condition: [],
    line_insulation_condition: [],
    primary_drain_line: [],
    float_switches_present: '',
    float_switch_operational: '',
    primary_pan_condition: [],
    secondary_pan_condition: [],
    cabinet_condition: [],
    cabinet_insulation: [],
    filter_size_location: '',
    filter_condition: [],
    return_plenum_condition: [],
    supply_plenum_condition: [],
    ductwork_condition: [],
    supply_registers: [],
    return_grilles: [],
    temperature_split: '',
    static_pressure: '',
    uv_light_installed: false,
    uv_light_operational: false,
    ionizer_installed: false,
    ionizer_condition: []
  });

  // Heat Pump Checklist State
  const [heatPumpChecklist, setHeatPumpChecklist] = useState({
    disconnect_condition: [],
    electrical_connections: [],
    contactor_condition: [],
    capacitor_condition: [],
    compressor_amps: '',
    fan_motor_amps: '',
    fan_motor_condition: [],
    fan_blade_condition: [],
    compressor_condition: [],
    thermostat_wire_condition: [],
    suction_pressure: '',
    liquid_pressure: '',
    superheat: '',
    subcooling: '',
    manufacturer_spec: '',
    metering_device: [],
    piston_size: '',
    low_pressure_switch: [],
    high_pressure_switch: [],
    ambient_sensor: [],
    defrost_sensor: [],
    defrost_board_condition: [],
    condenser_coil: [],
    cabinet_condition: [],
    refrigerant_line_condition: [],
    line_insulation_condition: []
  });

  // Work Order Info
  const [workOrderInfo, setWorkOrderInfo] = useState({
    service_date: formatDate(new Date()),
    time_preference: 'morning',
    service_type: 'maintenance',
    priority: 'normal',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerSearchChange = async (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setShowNewCustomerForm(false);

    if (value.length >= 2) {
      try {
        const results = await searchCustomers(value);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching customers:', error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleCreateNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      setError('Customer name and phone are required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) throw error;

      // If equipment was added for the new customer, save it
      if (newCustomerEquipment.length > 0) {
        const equipmentToInsert = newCustomerEquipment.map(eq => ({
          ...eq,
          customer_id: data.id
        }));

        const { error: eqError } = await supabase
          .from('equipment')
          .insert(equipmentToInsert);

        if (eqError) throw eqError;

        // Fetch the newly created equipment
        const { data: fetchedEquipment, error: fetchError } = await supabase
          .from('equipment')
          .select('*')
          .eq('customer_id', data.id);

        if (fetchError) throw fetchError;
        setCustomerEquipment(fetchedEquipment || []);
      }

      setSelectedCustomer(data);
      setCustomerSearch(data.name);
      setShowNewCustomerForm(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: 'SC',
        zip: ''
      });
      setNewCustomerEquipment([]);
    } catch (error) {
      console.error('Error creating customer:', error);
      setError(error.message);
    }
  };

  const handleAddEquipmentToNewCustomer = () => {
    setNewCustomerEquipment([
      ...newCustomerEquipment,
      {
        equipment_type: '',
        brand: '',
        model: '',
        serial_number: '',
        location: ''
      }
    ]);
  };

  const handleRemoveEquipmentFromNewCustomer = (index) => {
    setNewCustomerEquipment(newCustomerEquipment.filter((_, i) => i !== index));
  };

  const handleUpdateNewCustomerEquipment = (index, field, value) => {
    const updated = [...newCustomerEquipment];
    updated[index] = { ...updated[index], [field]: value };
    setNewCustomerEquipment(updated);
  };

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowResults(false);

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('customer_id', customer.id);

      if (error) throw error;
      setCustomerEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleSelectEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    if (equipment) {
      setSystemInfo({
        area_zone: equipment.location || '',
        brand: equipment.brand || '',
        model_number: equipment.model || '',
        serial_number: equipment.serial_number || '',
        warranty_status: '',
        system_location: equipment.location || '',
        mca: '',
        mocp: '',
        breaker_size: '',
        wire_gauge: ''
      });
    }
  };

  const handleCheckboxChange = (checklistType, field, value) => {
    const setChecklist = checklistType === 'air_handler' ? setAirHandlerChecklist : setHeatPumpChecklist;
    setChecklist(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let equipmentId = selectedEquipment?.id;

      if (!equipmentId && (systemInfo.brand || systemInfo.model_number)) {
        const { data: newEquipment, error: equipmentError } = await supabase
          .from('equipment')
          .insert([{
            customer_id: selectedCustomer.id,
            equipment_type: systemType === 'air_handler' ? 'Air Handler' : 'Heat Pump',
            brand: systemInfo.brand,
            model: systemInfo.model_number,
            serial_number: systemInfo.serial_number,
            location: systemInfo.system_location
          }])
          .select()
          .single();

        if (equipmentError) throw equipmentError;
        equipmentId = newEquipment.id;
      }

      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .insert([{
          customer_id: selectedCustomer.id,
          equipment_id: equipmentId,
          title: `${systemType === 'air_handler' ? 'Air Handler' : 'Heat Pump'} Maintenance - ${selectedCustomer.name}`,
          service_date: workOrderInfo.service_date,
          time_preference: workOrderInfo.time_preference,
          service_type: workOrderInfo.service_type,
          priority: workOrderInfo.priority,
          description: `${systemType === 'air_handler' ? 'Air Handler' : 'Heat Pump'} inspection and maintenance`,
          notes: workOrderInfo.notes,
          status: 'pending'
        }])
        .select()
        .single();

      if (woError) throw woError;

      const checklistData = systemType === 'air_handler' ? airHandlerChecklist : heatPumpChecklist;

      const { error: reportError } = await supabase
        .from('inspection_reports')
        .insert([{
          work_order_id: workOrder.id,
          report_data: {
            system_type: systemType,
            system_info: systemInfo,
            checklist: checklistData
          }
        }]);

      if (reportError) throw reportError;

      navigate(`/admin/workorders/${workOrder.id}`);

    } catch (error) {
      console.error('Error creating work order:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const CheckboxGroup = ({ label, field, options, checklistType }) => (
    <div className="admin-form-group">
      <label className="admin-form-label">{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--admin-space-3)' }}>
        {options.map(option => {
          const checklist = checklistType === 'air_handler' ? airHandlerChecklist : heatPumpChecklist;
          const isChecked = (checklist[field] || []).includes(option);
          return (
            <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCheckboxChange(checklistType, field, option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div style={{ marginBottom: 'var(--admin-space-6)' }}>
        <h1 style={{
          fontSize: 'var(--admin-font-size-4xl)',
          fontWeight: 'var(--admin-font-weight-bold)',
          color: 'var(--admin-text-primary)',
          marginBottom: 'var(--admin-space-2)'
        }}>
          New Service Checklist
        </h1>
        <p style={{ color: 'var(--admin-text-secondary)' }}>
          Create a maintenance work order with inspection checklist
        </p>
      </div>

      {error && (
        <div className="admin-alert admin-alert-danger" style={{ marginBottom: 'var(--admin-space-6)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Selection */}
        <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Customer Information</h3>
            {!selectedCustomer && !showNewCustomerForm && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setShowNewCustomerForm(true)}
              >
                + New Customer
              </button>
            )}
          </div>
          <div className="admin-card-body">
            {!showNewCustomerForm && (
              <div className="admin-form-group">
                <label className="admin-form-label">Search Customer by Name</label>
                <div className="search-container" ref={searchResultsRef}>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={customerSearch}
                    onChange={handleCustomerSearchChange}
                    placeholder="Type customer name..."
                    disabled={!!selectedCustomer}
                  />
                  {showResults && (
                    <div className="search-results">
                      {searchResults.length > 0 ? (
                        searchResults.map(customer => (
                          <div
                            key={customer.id}
                            className="search-result-item"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div><strong>{customer.name}</strong></div>
                            <div className="small-text">{customer.phone} • {customer.address}</div>
                          </div>
                        ))
                      ) : (
                        <div className="search-result-item" style={{ cursor: 'default' }}>
                          <div style={{ color: 'var(--admin-text-secondary)' }}>No customers found</div>
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            style={{ marginTop: 'var(--admin-space-2)' }}
                            onClick={() => {
                              setShowResults(false);
                              setShowNewCustomerForm(true);
                              setNewCustomer({ ...newCustomer, name: customerSearch });
                            }}
                          >
                            + Create New Customer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div style={{
                    marginTop: 'var(--admin-space-3)',
                    padding: 'var(--admin-space-4)',
                    borderRadius: 'var(--admin-radius-base)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'var(--admin-font-weight-semibold)' }}>{selectedCustomer.name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-text-secondary)' }}>
                          {selectedCustomer.phone} • {selectedCustomer.address}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearch('');
                          setCustomerEquipment([]);
                          setSelectedEquipment(null);
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showNewCustomerForm && !selectedCustomer && (
              <div style={{
                marginTop: 'var(--admin-space-4)',
                padding: 'var(--admin-space-4)',
                background: 'var(--admin-bg-surface)',
                border: '2px solid var(--admin-primary)',
                borderRadius: 'var(--admin-radius-base)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--admin-space-4)' }}>
                  <h4 style={{ margin: 0, color: 'var(--admin-primary)' }}>New Customer Information</h4>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => setShowNewCustomerForm(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Customer Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Phone *</label>
                    <input
                      type="tel"
                      className="admin-form-input"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="(843) 555-1234"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Email</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="admin-form-label">Address</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">City</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      placeholder="Bluffton"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">State</label>
                    <select
                      className="admin-form-select"
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    >
                      <option value="SC">SC</option>
                      <option value="GA">GA</option>
                      <option value="NC">NC</option>
                      <option value="FL">FL</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">ZIP Code</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newCustomer.zip}
                      onChange={(e) => setNewCustomer({ ...newCustomer, zip: e.target.value })}
                      placeholder="29910"
                    />
                  </div>
                </div>

                {/* Equipment Section for New Customer */}
                <div style={{ marginTop: 'var(--admin-space-6)', paddingTop: 'var(--admin-space-4)', borderTop: '1px solid var(--admin-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--admin-space-4)' }}>
                    <h4 style={{ margin: 0, color: 'var(--admin-text-primary)' }}>Equipment Information</h4>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={handleAddEquipmentToNewCustomer}
                    >
                      + Add Equipment
                    </button>
                  </div>

                  {newCustomerEquipment.length === 0 ? (
                    <div style={{
                      padding: 'var(--admin-space-6)',
                      textAlign: 'center',
                      background: 'var(--admin-bg-body)',
                      borderRadius: 'var(--admin-radius-base)',
                      border: '1px dashed var(--admin-border-light)'
                    }}>
                      <p style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                        Click "Add Equipment" to add HVAC equipment for this customer
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
                      {newCustomerEquipment.map((equipment, index) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--admin-space-4)',
                            background: 'var(--admin-bg-body)',
                            borderRadius: 'var(--admin-radius-base)',
                            border: '1px solid var(--admin-border-light)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--admin-space-3)' }}>
                            <h5 style={{ margin: 0, color: 'var(--admin-text-primary)' }}>Equipment #{index + 1}</h5>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() => handleRemoveEquipmentFromNewCustomer(index)}
                            >
                              Remove
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-3)' }}>
                            <div className="admin-form-group">
                              <label className="admin-form-label">Equipment Type</label>
                              <select
                                className="admin-form-select"
                                value={equipment.equipment_type}
                                onChange={(e) => handleUpdateNewCustomerEquipment(index, 'equipment_type', e.target.value)}
                              >
                                <option value="">Select Type</option>
                                <option value="Air Handler">Air Handler</option>
                                <option value="Heat Pump">Heat Pump</option>
                                <option value="AC Unit">AC Unit</option>
                                <option value="Furnace">Furnace</option>
                              </select>
                            </div>
                            <div className="admin-form-group">
                              <label className="admin-form-label">Brand</label>
                              <input
                                type="text"
                                className="admin-form-input"
                                value={equipment.brand}
                                onChange={(e) => handleUpdateNewCustomerEquipment(index, 'brand', e.target.value)}
                                placeholder="Carrier, Trane, etc."
                              />
                            </div>
                            <div className="admin-form-group">
                              <label className="admin-form-label">Model</label>
                              <input
                                type="text"
                                className="admin-form-input"
                                value={equipment.model}
                                onChange={(e) => handleUpdateNewCustomerEquipment(index, 'model', e.target.value)}
                                placeholder="Model number"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label className="admin-form-label">Serial Number</label>
                              <input
                                type="text"
                                className="admin-form-input"
                                value={equipment.serial_number}
                                onChange={(e) => handleUpdateNewCustomerEquipment(index, 'serial_number', e.target.value)}
                                placeholder="Serial number"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label className="admin-form-label">Location</label>
                              <input
                                type="text"
                                className="admin-form-input"
                                value={equipment.location}
                                onChange={(e) => handleUpdateNewCustomerEquipment(index, 'location', e.target.value)}
                                placeholder="Attic, Basement, etc."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'var(--admin-space-4)' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={handleCreateNewCustomer}
                  >
                    Save Customer & Continue
                  </button>
                </div>
              </div>
            )}

            {selectedCustomer && customerEquipment.length > 0 && (
              <div className="admin-form-group" style={{ marginTop: 'var(--admin-space-4)' }}>
                <label className="admin-form-label">
                  Select Equipment <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 'normal' }}>({customerEquipment.length} existing equipment found)</span>
                </label>
                <select
                  className="admin-form-select"
                  value={selectedEquipment?.id || ''}
                  onChange={(e) => {
                    const equipment = customerEquipment.find(eq => eq.id === e.target.value);
                    handleSelectEquipment(equipment || null);
                  }}
                >
                  <option value="">-- Add New Equipment --</option>
                  {customerEquipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipment_type} - {eq.brand} {eq.model} {eq.location ? `(${eq.location})` : ''}
                    </option>
                  ))}
                </select>
                <p className="admin-form-help">
                  Select existing equipment to auto-fill details, or choose "Add New Equipment" to add another unit for this customer
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedCustomer && (
          <>
            {/* System Type */}
            <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">System Type</h3>
              </div>
              <div className="admin-card-body">
                <div style={{ display: 'flex', gap: 'var(--admin-space-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="systemType"
                      value="air_handler"
                      checked={systemType === 'air_handler'}
                      onChange={(e) => setSystemType(e.target.value)}
                    />
                    <span>Air Handler</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="systemType"
                      value="heat_pump"
                      checked={systemType === 'heat_pump'}
                      onChange={(e) => setSystemType(e.target.value)}
                    />
                    <span>Heat Pump</span>
                  </label>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">📍 System Information</h3>
              </div>
              <div className="admin-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Area/Zone Serviced</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.area_zone}
                      onChange={(e) => setSystemInfo({...systemInfo, area_zone: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Brand</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.brand}
                      onChange={(e) => setSystemInfo({...systemInfo, brand: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Model Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.model_number}
                      onChange={(e) => setSystemInfo({...systemInfo, model_number: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Serial Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.serial_number}
                      onChange={(e) => setSystemInfo({...systemInfo, serial_number: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Warranty Status</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.warranty_status}
                      onChange={(e) => setSystemInfo({...systemInfo, warranty_status: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">System Location</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.system_location}
                      onChange={(e) => setSystemInfo({...systemInfo, system_location: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Electrical Info */}
            <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">⚡ Electrical Info</h3>
              </div>
              <div className="admin-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-4)' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">MCA (Amps)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.mca}
                      onChange={(e) => setSystemInfo({...systemInfo, mca: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">MOCP (Amps)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.mocp}
                      onChange={(e) => setSystemInfo({...systemInfo, mocp: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Breaker Size (Amps)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.breaker_size}
                      onChange={(e) => setSystemInfo({...systemInfo, breaker_size: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Wire Gauge Size</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={systemInfo.wire_gauge}
                      onChange={(e) => setSystemInfo({...systemInfo, wire_gauge: e.target.value})}
                    />
                  </div>
                </div>

                {systemType === 'air_handler' ? (
                  <>
                    <CheckboxGroup
                      label="Disconnect Condition"
                      field="disconnect_condition"
                      options={['Good', 'Corroded', 'Loose', 'Damaged']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Electrical Connections"
                      field="electrical_connections"
                      options={['Tight', 'Loose', 'Corroded']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Control Board Condition"
                      field="control_board_condition"
                      options={['Functional', 'Corroded', 'Faulty']}
                      checklistType="air_handler"
                    />
                  </>
                ) : (
                  <>
                    <CheckboxGroup
                      label="Disconnect Condition"
                      field="disconnect_condition"
                      options={['Good', 'Corroded', 'Loose', 'Damaged']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Electrical Connections"
                      field="electrical_connections"
                      options={['Tight', 'Loose', 'Corroded']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Contactor Condition"
                      field="contactor_condition"
                      options={['Good', 'Pitted', 'Burnt']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Capacitor Condition"
                      field="capacitor_condition"
                      options={['Within Tolerance', 'Weak', 'Failed']}
                      checklistType="heat_pump"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-4)' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Compressor Amps</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.compressor_amps}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, compressor_amps: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Fan Motor Amps</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.fan_motor_amps}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, fan_motor_amps: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Air Handler Specific Sections */}
            {systemType === 'air_handler' && (
              <>
                {/* Blower Section */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🌬️ Blower Section</h3>
                  </div>
                  <div className="admin-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Blower Motor Type</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={airHandlerChecklist.blower_motor_type}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, blower_motor_type: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Blower Motor Amps</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={airHandlerChecklist.blower_motor_amps}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, blower_motor_amps: e.target.value})}
                        />
                      </div>
                    </div>
                    <CheckboxGroup
                      label="Blower Wheel Condition"
                      field="blower_wheel_condition"
                      options={['Clean', 'Dirty', 'Balanced', 'Needs Cleaning']}
                      checklistType="air_handler"
                    />
                  </div>
                </div>

                {/* Heating Elements */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🔥 Heating Elements</h3>
                  </div>
                  <div className="admin-card-body">
                    <div className="admin-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={airHandlerChecklist.heat_kit_installed}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, heat_kit_installed: e.target.checked})}
                        />
                        <span className="admin-form-label" style={{ margin: 0 }}>Heat Kit Installed</span>
                      </label>
                    </div>
                    {airHandlerChecklist.heat_kit_installed && (
                      <>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Heat Kit Amps</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={airHandlerChecklist.heat_kit_amps}
                            onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, heat_kit_amps: e.target.value})}
                          />
                        </div>
                        <CheckboxGroup
                          label="Heat Kit Condition"
                          field="heat_kit_condition"
                          options={['Good', 'Burned', 'Rusted']}
                          checklistType="air_handler"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Cooling Components */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">❄️ Cooling Components</h3>
                  </div>
                  <div className="admin-card-body">
                    <CheckboxGroup
                      label="Evaporator Coil Condition"
                      field="evaporator_coil_condition"
                      options={['Clean', 'Dirty', 'Corroded']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Refrigerant Line Condition"
                      field="refrigerant_line_condition"
                      options={['Good', 'Damaged', 'Kinked']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Line Insulation Condition"
                      field="line_insulation_condition"
                      options={['Intact', 'Degraded', 'Missing']}
                      checklistType="air_handler"
                    />
                  </div>
                </div>

                {/* Condensate & Drainage */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">💧 Condensate & Drainage</h3>
                  </div>
                  <div className="admin-card-body">
                    <CheckboxGroup
                      label="Primary Drain Line"
                      field="primary_drain_line"
                      options={['Clear', 'Partially Blocked', 'Clogged']}
                      checklistType="air_handler"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Float Switches Present</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={airHandlerChecklist.float_switches_present}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, float_switches_present: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Float Switch Operational</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={airHandlerChecklist.float_switch_operational}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, float_switch_operational: e.target.value})}
                        />
                      </div>
                    </div>
                    <CheckboxGroup
                      label="Primary Pan Condition"
                      field="primary_pan_condition"
                      options={['Good', 'Rusted', 'Cracked']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Secondary Pan Condition"
                      field="secondary_pan_condition"
                      options={['Good', 'Rusted', 'Cracked']}
                      checklistType="air_handler"
                    />
                  </div>
                </div>

                {/* Cabinet & Structural */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🧱 Cabinet & Structural</h3>
                  </div>
                  <div className="admin-card-body">
                    <CheckboxGroup
                      label="Cabinet Condition"
                      field="cabinet_condition"
                      options={['Clean', 'Dirty', 'Rusted']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Cabinet Insulation"
                      field="cabinet_insulation"
                      options={['Intact', 'Damaged', 'Missing']}
                      checklistType="air_handler"
                    />
                  </div>
                </div>

                {/* Ductwork */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🌀 Ductwork</h3>
                  </div>
                  <div className="admin-card-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Filter Size & Location</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={airHandlerChecklist.filter_size_location}
                        onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, filter_size_location: e.target.value})}
                      />
                    </div>
                    <CheckboxGroup
                      label="Filter Condition"
                      field="filter_condition"
                      options={['Clean', 'Dirty', 'Missing']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Return Plenum Condition"
                      field="return_plenum_condition"
                      options={['Sealed', 'Leaky', 'Damaged']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Supply Plenum Condition"
                      field="supply_plenum_condition"
                      options={['Sealed', 'Leaky', 'Damaged']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Ductwork Condition"
                      field="ductwork_condition"
                      options={['Good', 'Leaky', 'Collapsed', 'Mold Present']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Supply Registers"
                      field="supply_registers"
                      options={['Clean', 'Dirty', 'Blocked']}
                      checklistType="air_handler"
                    />
                    <CheckboxGroup
                      label="Return Grilles"
                      field="return_grilles"
                      options={['Clean', 'Dirty', 'Blocked']}
                      checklistType="air_handler"
                    />
                  </div>
                </div>

                {/* Performance & IAQ */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🌡️ Performance & IAQ</h3>
                  </div>
                  <div className="admin-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Temperature Split (°F)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={airHandlerChecklist.temperature_split}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, temperature_split: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Static Pressure (in WC)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={airHandlerChecklist.static_pressure}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, static_pressure: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={airHandlerChecklist.uv_light_installed}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, uv_light_installed: e.target.checked})}
                        />
                        <span className="admin-form-label" style={{ margin: 0 }}>UV Light Installed</span>
                      </label>
                      {airHandlerChecklist.uv_light_installed && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer', marginTop: 'var(--admin-space-2)' }}>
                          <input
                            type="checkbox"
                            checked={airHandlerChecklist.uv_light_operational}
                            onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, uv_light_operational: e.target.checked})}
                          />
                          <span>UV Light Operational</span>
                        </label>
                      )}
                    </div>
                    <div className="admin-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={airHandlerChecklist.ionizer_installed}
                          onChange={(e) => setAirHandlerChecklist({...airHandlerChecklist, ionizer_installed: e.target.checked})}
                        />
                        <span className="admin-form-label" style={{ margin: 0 }}>Ionizer Installed</span>
                      </label>
                      {airHandlerChecklist.ionizer_installed && (
                        <CheckboxGroup
                          label="Ionizer Condition"
                          field="ionizer_condition"
                          options={['Good', 'Faulty', 'Dirty']}
                          checklistType="air_handler"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Heat Pump Specific Sections */}
            {systemType === 'heat_pump' && (
              <>
                {/* Mechanical */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🌀 Mechanical</h3>
                  </div>
                  <div className="admin-card-body">
                    <CheckboxGroup
                      label="Fan Motor Condition"
                      field="fan_motor_condition"
                      options={['Operational', 'Noisy', 'Seized']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Fan Blade Condition"
                      field="fan_blade_condition"
                      options={['Balanced', 'Bent', 'Damaged']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Compressor Condition"
                      field="compressor_condition"
                      options={['Normal', 'Noisy', 'Locked', 'Hot to Touch']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Thermostat Wire Condition"
                      field="thermostat_wire_condition"
                      options={['Intact', 'UV Damaged', 'Spliced']}
                      checklistType="heat_pump"
                    />
                  </div>
                </div>

                {/* Refrigerant & Metering */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🌡️ Refrigerant & Metering</h3>
                  </div>
                  <div className="admin-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-4)' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Suction Pressure (psi)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.suction_pressure}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, suction_pressure: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Liquid Pressure (psi)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.liquid_pressure}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, liquid_pressure: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Superheat (°F)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.superheat}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, superheat: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Subcooling (°F)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.subcooling}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, subcooling: e.target.value})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Manufacturer Spec</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.manufacturer_spec}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, manufacturer_spec: e.target.value})}
                        />
                      </div>
                    </div>
                    <CheckboxGroup
                      label="Metering Device"
                      field="metering_device"
                      options={['TXV', 'Piston', 'None', 'Unknown']}
                      checklistType="heat_pump"
                    />
                    {(heatPumpChecklist.metering_device || []).includes('Piston') && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">Piston Size</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={heatPumpChecklist.piston_size}
                          onChange={(e) => setHeatPumpChecklist({...heatPumpChecklist, piston_size: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls & Sensors */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🧠 Controls & Sensors</h3>
                  </div>
                  <div className="admin-card-body">
                    <CheckboxGroup
                      label="Low Pressure Switch"
                      field="low_pressure_switch"
                      options={['Operational', 'Bypassed', 'Failed']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="High Pressure Switch"
                      field="high_pressure_switch"
                      options={['Operational', 'Bypassed', 'Failed']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Ambient Sensor"
                      field="ambient_sensor"
                      options={['Operational', 'Failed']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Defrost Sensor"
                      field="defrost_sensor"
                      options={['Operational', 'Failed']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Defrost Board Condition"
                      field="defrost_board_condition"
                      options={['Functional', 'Corroded', 'Burnt']}
                      checklistType="heat_pump"
                    />
                  </div>
                </div>

                {/* Coils & Cabinet */}
                <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">🧊 Coils & Cabinet</h3>
                  </div>
                  <div className="admin-card-body">
                    <CheckboxGroup
                      label="Condenser Coil"
                      field="condenser_coil"
                      options={['Clean', 'Dirty', 'Damaged']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Cabinet Condition"
                      field="cabinet_condition"
                      options={['Good', 'Rusted', 'Damaged']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Refrigerant Line Condition"
                      field="refrigerant_line_condition"
                      options={['Good', 'Oil-Stained', 'Kinked']}
                      checklistType="heat_pump"
                    />
                    <CheckboxGroup
                      label="Line Insulation Condition"
                      field="line_insulation_condition"
                      options={['Intact', 'Degraded', 'Missing']}
                      checklistType="heat_pump"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Work Order Details */}
            <div className="admin-card" style={{ marginBottom: 'var(--admin-space-6)' }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">Work Order Details</h3>
              </div>
              <div className="admin-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Service Date</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={workOrderInfo.service_date}
                      onChange={(e) => setWorkOrderInfo({...workOrderInfo, service_date: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Time Preference</label>
                    <select
                      className="admin-form-select"
                      value={workOrderInfo.time_preference}
                      onChange={(e) => setWorkOrderInfo({...workOrderInfo, time_preference: e.target.value})}
                    >
                      <option value="morning">Morning (8AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 5PM)</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Priority</label>
                    <select
                      className="admin-form-select"
                      value={workOrderInfo.priority}
                      onChange={(e) => setWorkOrderInfo({...workOrderInfo, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Additional Notes</label>
                  <textarea
                    className="admin-form-textarea"
                    value={workOrderInfo.notes}
                    onChange={(e) => setWorkOrderInfo({...workOrderInfo, notes: e.target.value})}
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: 'var(--admin-space-3)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => navigate('/admin/workorders')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loading || !selectedCustomer}
              >
                {loading ? 'Creating...' : 'Create Work Order'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default ChecklistWorkOrderForm;
