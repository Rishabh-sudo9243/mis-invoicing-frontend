import React, { useEffect, useState } from 'react';
import { estimateAPI, clientAPI } from '../services/api';

const EMPTY = { clientId: '', title: '', description: '', amount: '', validUntil: '' };

function EstimateModal({ estimate, clients, onClose, onSave }) {
  const [form, setForm] = useState(estimate ? {
    clientId: estimate.clientId || estimate.client?.id || '',
    title: estimate.title || '',
    description: estimate.description || '',
    amount: estimate.amount || '',
    validUntil: estimate.validUntil?.split('T')[0] || '',
  } : EMPTY);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      estimate?.id ? await estimateAPI.update(estimate.id, form) : await estimateAPI.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save estimate.');
    } finally { setSaving(false); }
  };

  return (
    <div className="mis-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mis-modal">
        <div className="mis-modal-header">
          <span className="mis-modal-title">{estimate?.id ? 'Edit Estimate' : 'New Estimate'}</span>
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
                <label className="form-label">Title *</label>
                <input name="title" className="form-control" value={form.title} onChange={set} required placeholder="Estimate title" />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows={3} value={form.description} onChange={set} placeholder="Details about this estimate..." />
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" name="amount" className="form-control" value={form.amount} onChange={set} required min="0" placeholder="0.00" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Valid Until</label>
                <input type="date" name="validUntil" className="form-control" value={form.validUntil} onChange={set} />
              </div>
            </div>
          </div>
          <div className="mis-modal-footer">
            <button type="button" className="btn-mis-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-mis-primary" style={{ width: 'auto', padding: '9px 20px' }} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</> : (estimate?.id ? 'Update' : 'Create Estimate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [converting, setConverting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [e, c] = await Promise.all([estimateAPI.getAll(), clientAPI.getAll()]);
      setEstimates(e.data || []); setClients(c.data || []);
    } catch { setEstimates([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this estimate?')) return;
    try { await estimateAPI.delete(id); load(); } catch { alert('Failed to delete.'); }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Convert this estimate to an invoice?')) return;
    setConverting(id);
    try { await estimateAPI.convert(id); alert('Invoice created successfully!'); load(); }
    catch { alert('Could not convert estimate.'); }
    finally { setConverting(null); }
  };

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <div>
      <div className="d-flex justify-content-end mb-4">
        <button className="btn-mis-primary" style={{ width: 'auto', padding: '9px 18px' }} onClick={() => setModal('add')}>
          <i className="bi bi-file-earmark-plus me-2" />New Estimate
        </button>
      </div>

      <div className="mis-card">
        <div className="mis-card-header">
          <span className="mis-card-title">All Estimates ({estimates.length})</span>
        </div>
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="mis-table">
              <thead>
                <tr>
                  <th>#</th><th>Title</th><th>Client</th><th>Amount</th><th>Valid Until</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {estimates.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><i className="bi bi-file-earmark-text" /><div>No estimates yet</div></div></td></tr>
                ) : estimates.map((e, i) => (
                  <tr key={e.id}>
                    <td className="mono text-muted-mis" style={{ fontSize: 12 }}>{i + 1}</td>
                    <td className="fw-500">{e.title}</td>
                    <td>{e.clientName || e.client?.name || '—'}</td>
                    <td className="mono">{fmt(e.amount || 0)}</td>
                    <td>{e.validUntil ? new Date(e.validUntil).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn-mis-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal(e)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-mis-outline" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--mis-success)', borderColor: 'var(--mis-success)' }}
                          onClick={() => handleConvert(e.id)} disabled={converting === e.id} title="Convert to Invoice">
                          {converting === e.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-arrow-right-circle" />}
                        </button>
                        <button className="btn-mis-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(e.id)}>
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
        <EstimateModal
          estimate={modal === 'add' ? null : modal}
          clients={clients}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
