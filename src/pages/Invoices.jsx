import React, { useEffect, useState } from 'react';
import { invoiceAPI, clientAPI } from '../services/api';

const STATUS_OPTIONS = ['DRAFT', 'SENT', 'PENDING', 'PAID', 'OVERDUE'];
const EMPTY = { clientId: '', title: '', description: '', totalAmount: '', dueDate: '', status: 'DRAFT' };

function StatusPill({ status }) {
  const map = { PAID:'paid', PENDING:'pending', OVERDUE:'overdue', DRAFT:'draft', SENT:'sent' };
  return <span className={`status-pill status-${map[status]||'draft'}`}>{status}</span>;
}

function InvoiceModal({ invoice, clients, onClose, onSave }) {
  const [form, setForm] = useState(invoice ? {
    clientId:    invoice.clientId || invoice.client?.id || '',
    title:       invoice.title || '',
    description: invoice.description || '',
    totalAmount: invoice.totalAmount || '',
    dueDate:     invoice.dueDate?.split('T')[0] || '',
    status:      invoice.status || 'DRAFT',
  } : EMPTY);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      invoice?.id ? await invoiceAPI.update(invoice.id, form) : await invoiceAPI.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice.');
    } finally { setSaving(false); }
  };

  return (
    <div className="mis-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mis-modal">
        <div className="mis-modal-header">
          <span className="mis-modal-title">{invoice?.id ? 'Edit Invoice' : 'New Invoice'}</span>
          <button className="btn-close-mis" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mis-modal-body">
            {error && <div className="alert-mis alert-danger">{error}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Client *</label>
                <select name="clientId" className="form-control" value={form.clientId} onChange={set} required>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Invoice Title *</label>
                <input name="title" className="form-control" value={form.title} onChange={set} required placeholder="Invoice for services..." />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows={2} value={form.description} onChange={set} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Total Amount (₹) *</label>
                <input type="number" name="totalAmount" className="form-control" value={form.totalAmount} onChange={set} required min="0" placeholder="0.00" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input type="date" name="dueDate" className="form-control" value={form.dueDate} onChange={set} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={form.status} onChange={set}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mis-modal-footer">
            <button type="button" className="btn-mis-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-mis-primary" style={{ width: 'auto', padding: '9px 20px' }} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</> : (invoice?.id ? 'Update' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [filter,   setFilter]   = useState('ALL');
  const [sending,  setSending]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, cli] = await Promise.all([invoiceAPI.getAll(), clientAPI.getAll()]);
      setInvoices(inv.data || []); setClients(cli.data || []);
    } catch { setInvoices([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try { await invoiceAPI.delete(id); load(); } catch { alert('Failed to delete.'); }
  };

  const handleSend = async (id) => {
    setSending(id);
    try { await invoiceAPI.send(id); alert('Invoice sent!'); load(); }
    catch { alert('Could not send invoice.'); }
    finally { setSending(null); }
  };

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
        {/* Status filter tabs */}
        <div className="d-flex gap-1 flex-wrap">
          {['ALL', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: '1.5px solid', cursor: 'pointer',
                background: filter === s ? 'var(--mis-blue)' : 'white',
                color: filter === s ? 'white' : 'var(--mis-muted)',
                borderColor: filter === s ? 'var(--mis-blue)' : 'var(--mis-border)',
              }}>
              {s}
            </button>
          ))}
        </div>
        <button className="btn-mis-primary" style={{ width: 'auto', padding: '9px 18px' }} onClick={() => setModal('add')}>
          <i className="bi bi-receipt me-2" />New Invoice
        </button>
      </div>

      <div className="mis-card">
        <div className="mis-card-header">
          <span className="mis-card-title">Invoices ({filtered.length})</span>
        </div>
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="mis-table">
              <thead>
                <tr><th>Invoice #</th><th>Client</th><th>Title</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><i className="bi bi-receipt" /><div>No invoices found</div></div></td></tr>
                ) : filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td className="mono" style={{ fontSize: 12 }}>#INV-{String(inv.id).padStart(3,'0')}</td>
                    <td>{inv.clientName || inv.client?.name || '—'}</td>
                    <td className="fw-500">{inv.title}</td>
                    <td className="mono">{fmt(inv.totalAmount || 0)}</td>
                    <td style={{ fontSize: 12 }}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td><StatusPill status={inv.status || 'DRAFT'} /></td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-mis-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal(inv)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-mis-outline" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleSend(inv.id)} disabled={sending === inv.id} title="Send Invoice">
                          {sending === inv.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send" />}
                        </button>
                        <button className="btn-mis-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(inv.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <InvoiceModal
          invoice={modal === 'add' ? null : modal}
          clients={clients}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
