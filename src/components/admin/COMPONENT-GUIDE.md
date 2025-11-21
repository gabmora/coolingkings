# Admin Design System Component Guide

## Quick Start

Import the design system in your admin components:

```jsx
import './AdminDesignSystem.css';
import './AdminComponents.css';
```

---

## Design Tokens

All design tokens are available as CSS variables:

### Colors
```css
var(--admin-primary)           /* #002f6c - Main brand color */
var(--admin-secondary)         /* #ff6b35 - Accent color */
var(--admin-success)           /* #28a745 - Success green */
var(--admin-danger)            /* #dc3545 - Error red */
```

### Spacing
```css
var(--admin-space-2)  /* 8px */
var(--admin-space-4)  /* 16px */
var(--admin-space-6)  /* 24px */
```

---

## Components

### Buttons

```jsx
<button className="admin-btn admin-btn-primary">
  Primary Button
</button>

<button className="admin-btn admin-btn-secondary">
  Secondary Button
</button>

<button className="admin-btn admin-btn-outline">
  Outline Button
</button>

<button className="admin-btn admin-btn-ghost">
  Ghost Button
</button>

<button className="admin-btn admin-btn-danger">
  Delete
</button>

// Sizes
<button className="admin-btn admin-btn-primary admin-btn-sm">Small</button>
<button className="admin-btn admin-btn-primary">Normal</button>
<button className="admin-btn admin-btn-primary admin-btn-lg">Large</button>
```

### Cards

```jsx
// Basic Card
<div className="admin-card">
  <div className="admin-card-header">
    <h3 className="admin-card-title">Card Title</h3>
  </div>
  <div className="admin-card-body">
    Card content goes here
  </div>
  <div className="admin-card-footer">
    <button className="admin-btn admin-btn-primary">Action</button>
  </div>
</div>

// Hover Effect
<div className="admin-card admin-card-hover">
  Hover over me!
</div>

// Elevated
<div className="admin-card admin-card-elevated">
  More shadow
</div>

// Outlined
<div className="admin-card admin-card-outlined">
  With border
</div>
```

### Badges

```jsx
// Status Badges
<span className="admin-badge admin-badge-pending">Pending</span>
<span className="admin-badge admin-badge-scheduled">Scheduled</span>
<span className="admin-badge admin-badge-inprogress">In Progress</span>
<span className="admin-badge admin-badge-completed">Completed</span>
<span className="admin-badge admin-badge-urgent">Urgent</span>
<span className="admin-badge admin-badge-emergency">Emergency</span>
```

### Stat Cards

```jsx
<div className="admin-stat-card">
  <div className="admin-stat-card-header">
    <div className="admin-stat-card-icon">
      📊
    </div>
  </div>
  <div className="admin-stat-card-value">24</div>
  <div className="admin-stat-card-label">Pending Work Orders</div>
  <div className="admin-stat-card-change positive">
    ↑ 12% from last week
  </div>
</div>
```

### Forms

```jsx
<div className="admin-form-group">
  <label className="admin-form-label">Customer Name</label>
  <input
    type="text"
    className="admin-form-input"
    placeholder="Enter name"
  />
  <p className="admin-form-help">This is a help text</p>
</div>

<div className="admin-form-group">
  <label className="admin-form-label">Service Type</label>
  <select className="admin-form-select">
    <option>Repair</option>
    <option>Maintenance</option>
    <option>Installation</option>
  </select>
</div>

<div className="admin-form-group">
  <label className="admin-form-label">Notes</label>
  <textarea className="admin-form-textarea"></textarea>
  <p className="admin-form-error">This field is required</p>
</div>
```

### Tables

```jsx
<div className="admin-table-container">
  <table className="admin-table">
    <thead className="admin-table-header">
      <tr>
        <th>Customer</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody className="admin-table-body">
      <tr>
        <td>John Doe</td>
        <td><span className="admin-badge admin-badge-pending">Pending</span></td>
        <td>Jan 15, 2025</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Alerts

```jsx
<div className="admin-alert admin-alert-success">
  ✓ Work order completed successfully!
</div>

<div className="admin-alert admin-alert-warning">
  ⚠ This customer has an overdue invoice
</div>

<div className="admin-alert admin-alert-danger">
  ✕ Failed to save changes
</div>

<div className="admin-alert admin-alert-info">
  ℹ You have 3 new estimate requests
</div>
```

### Loading States

```jsx
// Spinner
<div className="admin-loading-spinner"></div>

// Skeleton
<div className="admin-loading-skeleton" style={{height: 20, width: 200}}></div>
```

---

## Usage Example

Here's a complete example of using the new design system:

```jsx
import React from 'react';
import './AdminDesignSystem.css';
import './AdminComponents.css';

const Dashboard = () => {
  return (
    <div style={{padding: 'var(--admin-space-6)'}}>
      {/* Page Header */}
      <div style={{marginBottom: 'var(--admin-space-6)'}}>
        <h1 style={{
          fontSize: 'var(--admin-font-size-4xl)',
          fontWeight: 'var(--admin-font-weight-bold)',
          color: 'var(--admin-text-primary)',
          marginBottom: 'var(--admin-space-2)'
        }}>
          Dashboard
        </h1>
        <p style={{color: 'var(--admin-text-secondary)'}}>
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--admin-space-6)',
        marginBottom: 'var(--admin-space-8)'
      }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-card-icon">📋</div>
          </div>
          <div className="admin-stat-card-value">24</div>
          <div className="admin-stat-card-label">Active Work Orders</div>
          <div className="admin-stat-card-change positive">↑ 12%</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-card-icon">👥</div>
          </div>
          <div className="admin-stat-card-value">156</div>
          <div className="admin-stat-card-label">Total Customers</div>
          <div className="admin-stat-card-change positive">↑ 5%</div>
        </div>
      </div>

      {/* Card Example */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Work Orders</h3>
          <button className="admin-btn admin-btn-primary admin-btn-sm">
            View All
          </button>
        </div>
        <div className="admin-card-body">
          {/* Table or list here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## Migration Guide

To migrate existing admin pages:

1. **Import the design system:**
   ```jsx
   import './AdminDesignSystem.css';
   import './AdminComponents.css';
   ```

2. **Replace old classes:**
   - `.card` → `.admin-card`
   - `.button` → `.admin-btn admin-btn-primary`
   - `.badge` → `.admin-badge admin-badge-pending`
   - `.stat-card` → `.admin-stat-card`

3. **Use design tokens for custom styles:**
   ```css
   .my-component {
     padding: var(--admin-space-4);
     color: var(--admin-text-primary);
     background: var(--admin-bg-surface);
     border-radius: var(--admin-radius-lg);
   }
   ```

4. **Remove old CSS files gradually** as you migrate each component

---

## Next Steps

Ready to revamp your first page? Let's start with the Dashboard!
