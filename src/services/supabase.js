// services/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://jnamsosbempweiazvzvg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYW1zb3NiZW1wd2VpYXp2enZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NzA4MzcsImV4cCI6MjA2MDI0NjgzN30.ZZh54N_L9eHf3MfvCiWfE6-NpftZcc0duiSx1vWdkwI';

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