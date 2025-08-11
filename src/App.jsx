// App.jsx - Cleaned up, removed AI Agent Dashboard

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import AboutUs from './components/AboutUs';
import AC from './components/AC';
import Heating from './components/Heating';
import MaintenancePlan from './components/MaintenancePlan';
import Header from './Header';
import Footer from './Footer';
import FreeEstimate from './components/FreeEstimate';

// Import admin components
import Dashboard from './components/admin/Dashboard';
import CustomerList from './components/admin/CustomerList';
import CustomerForm from './components/admin/CustomerForm';
import CustomerDetail from './components/admin/CustomerDetail';
import WorkOrderList from './components/admin/WorkOrderList';
import WorkOrderForm from './components/admin/WorkOrderForm';
import WorkOrderDetail from './components/admin/WorkOrderDetail';
import AdminLogin from './components/admin/AdminLogin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminEstimates from './components/admin/AdminEstimates';
import AdminHeader from './components/admin/AdminHeader';
import AdminCalendar from './components/admin/AdminCalendar';
import MapDashboard from './components/admin/MapDashboard';
import GeocodingSetup from './components/admin/GeocodingSetup';

// Keep AI Chat Widget for customer pages
import AIChatWidget from './components/AIChatWidget';

import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdminLogin = location.pathname === '/admin/login';

  return (
    <>
      {!isAdminPage && <Header />}
      {isAdminPage && !isAdminLogin && <AdminHeader />}
      <div className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/MaintenancePlan" element={<MaintenancePlan />} />
          <Route path="/AC" element={<AC />} />
          <Route path="/Heating" element={<Heating />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/estimate" element={<FreeEstimate />} />
          <Route path="/*" element={<FrontPage />} />
          
          {/* Admin routes (protected) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/map" element={<MapDashboard />} />
          <Route path="/admin/geocoding-setup" element={<GeocodingSetup />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/calendar" element={
            <ProtectedRoute>
              <AdminCalendar />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/customers" element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/customers/new" element={
            <ProtectedRoute>
              <CustomerForm />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/customers/:id" element={
            <ProtectedRoute>
              <CustomerDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/workorders" element={
            <ProtectedRoute>
              <WorkOrderList />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/workorders/new" element={
            <ProtectedRoute>
              <WorkOrderForm />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/workorders/:id" element={
            <ProtectedRoute>
              <WorkOrderDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/estimates" element={
            <ProtectedRoute>
              <AdminEstimates />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      
      {/* AI Chat Widget on customer pages only */}
      {!isAdminPage && <AIChatWidget />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;