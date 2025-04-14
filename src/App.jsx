// App.jsx - Updated with work order system routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import BookingPage from './components/BookingPage';
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

import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <div className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/BookingPage" element={<BookingPage />} />
          <Route path="/MaintenancePlan" element={<MaintenancePlan />} />
          <Route path="/AC" element={<AC />} />
          <Route path="/Heating" element={<Heating />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/estimate" element={<FreeEstimate />} />
          <Route path="/*" element={<FrontPage />} />
          
          {/* Admin routes (protected) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
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
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;