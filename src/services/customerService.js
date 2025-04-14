// services/customerService.js
import { supabase } from './supabase';

// Get all customers
export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return data;
};

// Search customers by name or phone (for autocomplete)
export const searchCustomers = async (query) => {
  if (!query || query.length < 2) return [];
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name')
    .limit(10);
  
  if (error) {
    console.error('Error searching customers:', error);
    return [];
  }
  
  return data;
};

// Get a single customer by id
export const getCustomerById = async (id) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching customer with id ${id}:`, error);
    return null;
  }
  
  return data;
};

// Create a new customer
export const createCustomer = async (customer) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select();
  
  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }
  
  return data[0];
};

// Update a customer
export const updateCustomer = async (id, customer) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    return null;
  }
  
  return data[0];
};

// Delete a customer
export const deleteCustomer = async (id) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting customer with id ${id}:`, error);
    return false;
  }
  
  return true;
};