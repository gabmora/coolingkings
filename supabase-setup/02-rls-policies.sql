-- Row Level Security (RLS) Policies for K&E HVAC
-- Run this script AFTER running 01-schema.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR AUTHENTICATED ADMIN USERS
-- ============================================

-- Customers: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON customers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Work Orders: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON work_orders
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Work Order Tasks: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON work_order_tasks
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Equipment: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON equipment
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Inspection Reports: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON inspection_reports
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Estimate Requests: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON estimate_requests
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- AI Conversations: Read access for authenticated users
CREATE POLICY "Enable read access for authenticated admin"
  ON ai_conversations
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- AI Leads: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON ai_leads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin Notifications: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON admin_notifications
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Technicians: Full access for authenticated users
CREATE POLICY "Enable all access for authenticated admin"
  ON technicians
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POLICIES FOR PUBLIC ACCESS (No Auth Required)
-- ============================================

-- Allow public to submit estimate requests
CREATE POLICY "Enable public estimate request submission"
  ON estimate_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow public to insert AI conversations (for chatbot)
CREATE POLICY "Enable public AI conversation insertion"
  ON ai_conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow public to insert AI leads (from chatbot)
CREATE POLICY "Enable public AI lead creation"
  ON ai_leads
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STORAGE POLICIES (for customer photos)
-- ============================================

-- Note: These need to be set up in the Supabase Storage UI
-- Bucket name: customer_photos
--
-- Policy for authenticated users to upload:
-- Policy name: "Authenticated users can upload customer photos"
-- Allowed operations: INSERT
-- Target roles: authenticated
--
-- Policy for authenticated users to view:
-- Policy name: "Authenticated users can view customer photos"
-- Allowed operations: SELECT
-- Target roles: authenticated
--
-- Policy for public access (optional):
-- If you want customers to view their photos via shared links,
-- create a SELECT policy with public access
