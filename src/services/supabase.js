// services/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://jqkzomhbqjyacfnyydui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxa3pvbWhicWp5YWNmbnl5ZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTEyMDIsImV4cCI6MjA3OTI4NzIwMn0.S7S8YBcjPmlwWCUod0dKbFowlJFUfrWbKS7mxiVvwG8';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);



// Additional auth functions
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};