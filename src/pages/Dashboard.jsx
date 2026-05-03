import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceAPI, clientAPI, paymentAPI, estimateAPI } from '../services/api';

function StatCard({ icon, iconBg, label, value, delta, deltaDown }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && <div className={`stat-delta ${deltaDown ? 'down' : ''}`}>{delta}</div>}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    PAID: 'paid', PENDING: 'pending', OVERDUE: 'overdue', DRAFT: 'draft', SENT: 'sent',
  };
  return <span className={`status-pill status-${map[status] || 'draft'}`}>{status}</span>;
}

export default function Dashboard() {
  const [invoices,  setInvoices]  = useState([]);
  const [clients,   setClients]   = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      invoiceAPI.getAll(),
      clientAPI.getAll(),
      paymentAPI.getAll(),
      estimateAPI.getAll(),
    ]).then(([inv, cli, pay, est]) => {
      if (inv.status === 'fulfilled')  setInvoices(inv.value.data || []);
      if (cli.status === 'fulfilled')  setClients(cli.value.data || []);
      if (pay.status === 'fulfilled')  setPayments(pay.value.data || []);
      if (est.status === 'fulfilled')  setEstimates(est.value.data || []);
      setLoading(false);
    });
  }, []);

  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const pending = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
  const pendingAmt = pending.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const overdue = invoices.filter(i => i.status === 'OVERDUE').length;

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  const recentInvoices = [...invoices].sort((a, b) => b.id - a.id).slice(0, 5);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon="🧾" iconBg="#e3f0ff" label="Total Invoices" value={invoices.length} delta={`${estimates.length} estimates`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="💰" iconBg="#e8f5e9" label="Revenue Collected" value={fmt(totalRevenue)} delta="Total payments" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="⏳" iconBg="#fff3e0" label="Pending Amount" value={fmt(pendingAmt)}
            delta={overdue > 0 ? `${overdue} overdue` : `${pending.length} pending`} deltaDown={overdue > 0} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="👥" iconBg="#f3e5f5" label="Active Clients" value={clients.length} delta="Total clients" />
        </div>
      </div>

      <div className="row g-3">
        {/* Recent Invoices */}
        <div className="col-12 col-lg-8">
          <div className="mis-card">
            <div className="mis-card-header">
              <span className="mis-card-title">Recent Invoices</span>
              <Link to="/invoices" style={{ fontSize: 13, color: 'var(--mis-blue)', textDecoration: 'none' }}>
                View all <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="mis-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No invoices yet</td></tr>
                  ) : recentInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="mono" style={{ fontSize: 12 }}>#INV-{String(inv.id).padStart(3, '0')}</td>
                      <td>{inv.clientName || inv.client?.name || '—'}</td>
                      <td className="mono">{fmt(inv.totalAmount || 0)}</td>
                      <td><StatusPill status={inv.status || 'DRAFT'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12 col-lg-4">
          <div className="mis-card mb-3">
            <div className="mis-card-header">
              <span className="mis-card-title">Quick Actions</span>
            </div>
            <div className="mis-card-body d-flex flex-column gap-2">
              {[
                { to: '/clients',   icon: 'bi-person-plus',        label: 'Add New Client',    color: '#1565c0' },
                { to: '/estimates', icon: 'bi-file-earmark-plus',  label: 'Create Estimate',   color: '#2e7d32' },
                { to: '/invoices',  icon: 'bi-receipt',             label: 'New Invoice',       color: '#e65100' },
                { to: '/payments',  icon: 'bi-credit-card',         label: 'Record Payment',    color: '#6a1b9a' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <div className="d-flex align-items-center gap-3 p-2 rounded" style={{ transition: 'background .15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f7fb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`bi ${a.icon}`} style={{ color: a.color, fontSize: 16 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--mis-text)' }}>{a.label}</span>
                    <i className="bi bi-chevron-right ms-auto" style={{ color: 'var(--mis-muted)', fontSize: 12 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Module status */}
          <div className="mis-card">
            <div className="mis-card-header">
              <span className="mis-card-title">Module Status</span>
            </div>
            <div className="mis-card-body d-flex flex-column gap-2">
              {[
                { label: 'Auth & JWT',      done: true },
                { label: 'Client Module',   done: false },
                { label: 'Estimate Module', done: false },
                { label: 'Invoice Module',  done: false },
                { label: 'Payment Module',  done: false },
              ].map(m => (
                <div key={m.label} className="d-flex align-items-center justify-content-between">
                  <span style={{ fontSize: 13 }}>{m.label}</span>
                  <span className={`status-pill ${m.done ? 'status-paid' : 'status-pending'}`} style={{ fontSize: 10 }}>
                    {m.done ? 'Complete' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
