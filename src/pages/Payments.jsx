import React, { useEffect, useState } from 'react';
import { paymentAPI, invoiceAPI } from '../services/api';

const MODES = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'OTHER'];
const EMPTY = { invoiceId: '', amount: '', paymentDate: '', mode: 'BANK_TRANSFER', notes: '' };

function PaymentModal({ invoices, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const selectedInvoice = invoices.find(i => String(i.id) === String(form.invoiceId));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await paymentAPI.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment.');
    } finally { setSaving(false); }
  };

  return (
    <div className="mis-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mis-modal">
        <div className="mis-modal-header">
          <span className="mis-modal-title">Record Payment</span>
          <button className="btn-close-mis" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mis-modal-body">
            {error && <div className="alert-mis alert-danger">{error}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Invoice *</label>
                <select name="invoiceId" className="form-control" value={form.invoiceId} onChange={set} required>
                  <option value="">Select invoice...</option>
                  {invoices.filter(i => i.status !== 'PAID').map(i => (
                    <option key={i.id} value={i.id}>
                      #INV-{String(i.id).padStart(3,'0')} — {i.clientName || i.client?.name} — ₹{Number(i.totalAmount).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
                {selectedInvoice && (
                  <div className="alert-mis alert-info mt-2" style={{ fontSize: 12 }}>
                    Invoice amount: ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount Paid (₹) *</label>
                <input type="number" name="amount" className="form-control" value={form.amount} onChange={set} required min="1" placeholder="0.00" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Payment Date *</label>
                <input type="date" name="paymentDate" className="form-control" value={form.paymentDate} onChange={set} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Payment Mode</label>
                <select name="mode" className="form-control" value={form.mode} onChange={set}>
                  {MODES.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Notes</label>
                <input name="notes" className="form-control" value={form.notes} onChange={set} placeholder="Reference number, remarks..." />
              </div>
            </div>
          </div>
          <div className="mis-modal-footer">
            <button type="button" className="btn-mis-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-mis-primary" style={{ width: 'auto', padding: '9px 20px' }} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</> : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, i] = await Promise.all([paymentAPI.getAll(), invoiceAPI.getAll()]);
      setPayments(p.data || []); setInvoices(i.data || []);
    } catch { setPayments([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try { await paymentAPI.delete(id); load(); } catch { alert('Failed to delete.'); }
  };

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div>
      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e9' }}>💰</div>
            <div className="stat-label">Total Collected</div>
            <div className="stat-value">{fmt(totalCollected)}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f0ff' }}>📄</div>
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{payments.length}</div>
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn-mis-primary" style={{ width: 'auto', padding: '11px 22px' }} onClick={() => setModal(true)}>
            <i className="bi bi-credit-card me-2" />Record Payment
          </button>
        </div>
      </div>

      <div className="mis-card">
        <div className="mis-card-header">
          <span className="mis-card-title">Payment History ({payments.length})</span>
        </div>
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="mis-table">
              <thead>
                <tr><th>#</th><th>Invoice</th><th>Client</th><th>Amount</th><th>Mode</th><th>Date</th><th>Notes</th><th></th></tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><i className="bi bi-credit-card" /><div>No payments recorded yet</div></div></td></tr>
                ) : payments.map((p, i) => (
                  <tr key={p.id}>
                    <td className="mono text-muted-mis" style={{ fontSize: 12 }}>{i + 1}</td>
                    <td className="mono" style={{ fontSize: 12 }}>#INV-{String(p.invoiceId || p.invoice?.id || '?').padStart(3,'0')}</td>
                    <td>{p.clientName || p.invoice?.clientName || '—'}</td>
                    <td className="mono fw-600" style={{ color: 'var(--mis-success)' }}>{fmt(p.amount || 0)}</td>
                    <td>
                      <span className="status-pill status-sent" style={{ fontSize: 11 }}>
                        {(p.mode || 'N/A').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="text-muted-mis" style={{ fontSize: 12 }}>{p.notes || '—'}</td>
                    <td>
                      <button className="btn-mis-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(p.id)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <PaymentModal
          invoices={invoices}
          onClose={() => setModal(false)}
          onSave={() => { setModal(false); load(); }}
        />
      )}
    </div>
  );
}
