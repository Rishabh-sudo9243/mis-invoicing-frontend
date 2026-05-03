import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { section: 'Main' },
  { to: '/dashboard', icon: 'bi-grid-fill',         label: 'Dashboard' },
  { to: '/clients',   icon: 'bi-people-fill',        label: 'Clients' },
  { section: 'Billing' },
  { to: '/estimates', icon: 'bi-file-earmark-text',  label: 'Estimates' },
  { to: '/invoices',  icon: 'bi-receipt',             label: 'Invoices' },
  { to: '/payments',  icon: 'bi-credit-card-fill',    label: 'Payments' },
  { section: 'Settings' },
  { to: '/groups',    icon: 'bi-diagram-3-fill',      label: 'Groups & Brands' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">MIS</div>
        <div>
          <div className="sidebar-logo-text">InvoicePro</div>
          <div className="sidebar-logo-sub">Management System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Logout">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user?.name || user?.email || 'Admin'}</div>
            <div className="sidebar-user-role">Click to logout</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
