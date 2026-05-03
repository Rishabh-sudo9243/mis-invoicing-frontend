import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageTitles = {
  '/dashboard': { title: 'Dashboard',       sub: 'Welcome back' },
  '/clients':   { title: 'Clients',         sub: 'Manage your clients' },
  '/estimates': { title: 'Estimates',       sub: 'Create and manage estimates' },
  '/invoices':  { title: 'Invoices',        sub: 'Track all invoices' },
  '/payments':  { title: 'Payments',        sub: 'Record and track payments' },
  '/groups':    { title: 'Groups & Brands', sub: 'Manage client groups and brands' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = pageTitles[pathname] || { title: 'MIS System', sub: '' };

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm d-md-none"
              style={{ border: 'none', background: 'none', fontSize: 20 }}
              onClick={() => setSidebarOpen(o => !o)}
            >
              <i className="bi bi-list" />
            </button>
            <div>
              <div className="topbar-title">{meta.title}</div>
              <div className="topbar-sub">{meta.sub}</div>
            </div>
          </div>

          <div className="topbar-actions">
            <span style={{ fontSize: 12, color: 'var(--mis-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
