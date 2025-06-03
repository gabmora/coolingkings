// services/workOrderService.js - Updated with work order number support
import { supabase } from './supabase';

// Get all work orders with customer info
export const getWorkOrders = async () => {
  const { data, error } = await supabase
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
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }
  
  return data;
};

// Get work orders by status
export const getWorkOrdersByStatus = async (status) => {
  const { data, error } = await supabase
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
    .eq('status', status)
    .order('service_date');
  
  if (error) {
    console.error(`Error fetching work orders with status ${status}:`, error);
    return [];
  }
  
  return data;
};

// Get a work order by id
export const getWorkOrderById = async (id) => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customers (
        *
      ),
      technicians (
        id,
        name
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching work order with id ${id}:`, error);
    return null;
  }
  
  return data;
};

// Create a new work order
export const createWorkOrder = async (workOrder) => {
  // Ensure all required fields are present
  const workOrderData = {
    customer_id: workOrder.customer_id,
    title: workOrder.title,
    service_date: workOrder.service_date,
    time_preference: workOrder.time_preference,
    service_type: workOrder.service_type,
    priority: workOrder.priority,
    description: workOrder.description,
    notes: workOrder.notes || null,
    status: workOrder.status || 'pending',
    technician_id: workOrder.technician_id || null
  };

  const { data, error } = await supabase
    .from('work_orders')
    .insert([workOrderData])
    .select();
  
  if (error) {
    console.error('Error creating work order:', error);
    console.error('Work order data:', workOrderData);
    return null;
  }
  
  return data[0];
};

// Update a work order
export const updateWorkOrder = async (id, workOrder) => {
  // Ensure updated_at is set
  const updateData = {
    ...workOrder,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('work_orders')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating work order with id ${id}:`, error);
    console.error('Update data:', updateData);
    return null;
  }
  
  return data[0];
};

// Update work order status
export const updateWorkOrderStatus = async (id, status) => {
  const updates = { 
    status, 
    updated_at: new Date().toISOString(),
    // If status is completed, add completion timestamp
    ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    // If status is in-progress, add started timestamp
    ...(status === 'in-progress' ? { started_at: new Date().toISOString() } : {})
  };
  
  const { data, error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating work order status to ${status}:`, error);
    return null;
  }
  
  return data[0];
};

// Update work order notes specifically
export const updateWorkOrderNotes = async (id, notes) => {
  const { data, error } = await supabase
    .from('work_orders')
    .update({ 
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating work order notes:`, error);
    return null;
  }
  
  return data[0];
};

// Get work orders for a customer
export const getWorkOrdersByCustomer = async (customerId) => {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching work orders for customer ${customerId}:`, error);
    return [];
  }
  
  return data;
};

// Get work order by work order number
export const getWorkOrderByNumber = async (workOrderNumber) => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customers (
        *
      )
    `)
    .eq('work_order_number', workOrderNumber)
    .single();
  
  if (error) {
    console.error(`Error fetching work order with number ${workOrderNumber}:`, error);
    return null;
  }
  
  return data;
};