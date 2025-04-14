// services/workOrderService.js
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
  const { data, error } = await supabase
    .from('work_orders')
    .insert([workOrder])
    .select();
  
  if (error) {
    console.error('Error creating work order:', error);
    return null;
  }
  
  return data[0];
};

// Update a work order
export const updateWorkOrder = async (id, workOrder) => {
  const { data, error } = await supabase
    .from('work_orders')
    .update(workOrder)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating work order with id ${id}:`, error);
    return null;
  }
  
  return data[0];
};

// Update work order status
export const updateWorkOrderStatus = async (id, status) => {
  const updates = { 
    status, 
    updated_at: new Date(),
    // If status is completed, add completion timestamp
    ...(status === 'completed' ? { completed_at: new Date() } : {})
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