-- Sample Data for K&E HVAC (Optional)
-- This helps you test the application immediately

-- ============================================
-- SAMPLE TECHNICIANS
-- ============================================

INSERT INTO technicians (name, email, phone, active) VALUES
  ('John Smith', 'john@knehvac.com', '555-0101', true),
  ('Sarah Johnson', 'sarah@knehvac.com', '555-0102', true),
  ('Mike Rodriguez', 'mike@knehvac.com', '555-0103', true);

-- ============================================
-- SAMPLE CUSTOMERS
-- ============================================

INSERT INTO customers (name, phone, email, address, city, state, zip, type, notes) VALUES
  ('Acme Corporation', '555-1234', 'contact@acme.com', '123 Business St', 'Phoenix', 'AZ', '85001', 'commercial', 'Large office building, 3 HVAC units'),
  ('Jane Doe', '555-5678', 'jane.doe@email.com', '456 Residential Ave', 'Scottsdale', 'AZ', '85251', 'residential', 'Single family home'),
  ('Bob Wilson', '555-9012', 'bob.w@email.com', '789 Main St', 'Tempe', 'AZ', '85281', 'residential', 'Condo unit'),
  ('Phoenix Mall LLC', '555-3456', 'property@phoenixmall.com', '321 Commerce Dr', 'Phoenix', 'AZ', '85003', 'commercial', 'Shopping center - multiple units');

-- ============================================
-- SAMPLE WORK ORDERS
-- ============================================

INSERT INTO work_orders (
  customer_id,
  title,
  service_date,
  service_type,
  priority,
  description,
  status,
  scheduled_time
) VALUES
  (
    (SELECT id FROM customers WHERE name = 'Acme Corporation'),
    'Annual Maintenance Check',
    CURRENT_DATE + INTERVAL '3 days',
    'maintenance',
    'normal',
    'Routine annual maintenance for all 3 units',
    'pending',
    '09:00:00'
  ),
  (
    (SELECT id FROM customers WHERE name = 'Jane Doe'),
    'AC Not Cooling',
    CURRENT_DATE + INTERVAL '1 day',
    'repair',
    'high',
    'Unit running but not cooling. Possible refrigerant leak.',
    'pending',
    '14:00:00'
  ),
  (
    (SELECT id FROM customers WHERE name = 'Bob Wilson'),
    'New Installation',
    CURRENT_DATE + INTERVAL '7 days',
    'installation',
    'normal',
    'Install new 3-ton unit',
    'pending',
    '08:00:00'
  );

-- ============================================
-- SAMPLE ESTIMATE REQUESTS
-- ============================================

INSERT INTO estimate_requests (name, email, phone, service_type, description, status) VALUES
  ('Mary Smith', 'mary@email.com', '555-7890', 'Installation', 'Need new AC unit installed in 2000 sq ft home', 'pending'),
  ('ABC Restaurant', 'manager@abcrestaurant.com', '555-4567', 'Repair', 'Walk-in cooler not maintaining temperature', 'pending');

-- ============================================
-- NOTES
-- ============================================

-- The above sample data will help you:
-- 1. Test the admin dashboard immediately
-- 2. See how work orders and customers are displayed
-- 3. Verify that the application is connected properly
--
-- You can delete this sample data later once you have real customers
