-- K&E HVAC Database Schema
-- Run this script in your new Supabase project SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Technicians Table
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  type TEXT CHECK (type IN ('residential', 'commercial')),
  notes TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  geocoding_status TEXT,
  has_indoor_unit BOOLEAN DEFAULT false,
  has_outdoor_unit BOOLEAN DEFAULT false,
  unit_brand TEXT,
  unit_model TEXT,
  unit_serial TEXT,
  install_date DATE,
  refrigerant_type TEXT,
  tonnage NUMERIC,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  equipment_type TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  install_date DATE,
  refrigerant_type TEXT,
  tonnage NUMERIC,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Orders Table
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  service_date DATE NOT NULL,
  time_preference TEXT,
  service_type TEXT CHECK (service_type IN ('repair', 'maintenance', 'installation', 'inspection')),
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
  description TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
  technician_id UUID REFERENCES technicians(id),
  work_order_number TEXT UNIQUE,
  equipment_id UUID REFERENCES equipment(id),
  scheduled_date DATE,
  scheduled_time TIME,
  estimated_duration NUMERIC,
  special_instructions TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Order Tasks Table
CREATE TABLE work_order_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Reports Table
CREATE TABLE inspection_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES technicians(id),
  report_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimate Requests Table (Public-facing form submissions)
CREATE TABLE estimate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  service_type TEXT,
  description TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT CHECK (status IN ('pending', 'contacted', 'converted', 'declined')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('normal', 'urgent')) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI INTEGRATION TABLES
-- ============================================

-- AI Conversations Table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  intent TEXT CHECK (intent IN (
    'emergency',
    'schedule_service',
    'pricing_inquiry',
    'repair_needed',
    'maintenance_inquiry',
    'business_hours',
    'general_inquiry',
    'error'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Leads Table
CREATE TABLE ai_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  conversation_id TEXT,
  lead_score NUMERIC CHECK (lead_score >= 1 AND lead_score <= 10),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
  service_type TEXT,
  status TEXT CHECK (status IN ('new', 'contacted', 'converted', 'lost')) DEFAULT 'new',
  work_order_id UUID REFERENCES work_orders(id),
  source TEXT DEFAULT 'ai_chat',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADMIN NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX idx_work_orders_technician_id ON work_orders(technician_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_service_date ON work_orders(service_date);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_geocoding ON customers(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_ai_conversations_conversation_id ON ai_conversations(conversation_id);
CREATE INDEX idx_ai_leads_status ON ai_leads(status);
CREATE INDEX idx_estimate_requests_status ON estimate_requests(status);

-- ============================================
-- AUTO-INCREMENT WORK ORDER NUMBERS
-- ============================================

CREATE SEQUENCE work_order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := 'WO-' || LPAD(nextval('work_order_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_work_order_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_work_order_number();

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_requests_updated_at BEFORE UPDATE ON estimate_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_leads_updated_at BEFORE UPDATE ON ai_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_reports_updated_at BEFORE UPDATE ON inspection_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
