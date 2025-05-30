import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('admin_token'); // or however you handle auth
    navigate('/admin/login');
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/estimates') return 'Estimate Requests';
    if (path === '/admin/customers') return 'Customers';
    if (path === '/admin/workorders') return 'Work Orders';
    if (path.includes('/admin/customers/')) return 'Customer Details';
    if (path.includes('/admin/workorders/')) return 'Work Order Details';
    return 'Admin';
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        {/* Left side - Logo/Brand */}
        <div className="admin-brand">
          <Link to="/admin" className="admin-logo">
            <span className="logo-icon">🔧</span>
            <span className="logo-text">K&E HVAC Admin</span>
          </Link>
        </div>

        {/* Center - Navigation */}
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`nav-item ${isActivePage('/admin') ? 'active' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/admin/estimates" 
            className={`nav-item ${isActivePage('/admin/estimates') ? 'active' : ''}`}
          >
            📋 Estimates
          </Link>
          <Link 
            to="/admin/customers" 
            className={`nav-item ${isActivePage('/admin/customers') ? 'active' : ''}`}
          >
            👥 Customers
          </Link>
          <Link 
            to="/admin/workorders" 
            className={`nav-item ${isActivePage('/admin/workorders') ? 'active' : ''}`}
          >
            🔧 Work Orders
          </Link>
        </nav>

        {/* Right side - User menu */}
        <div className="admin-user-menu">
          <div className="current-page">
            {getPageTitle()}
          </div>
          <div className="user-dropdown">
            <button 
              className="user-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="user-avatar">👤</span>
              <span className="user-name">Admin</span>
              <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/" className="dropdown-item">
                  🏠 View Website
                </Link>
                <Link to="/admin/settings" className="dropdown-item">
                  ⚙️ Settings
                </Link>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;