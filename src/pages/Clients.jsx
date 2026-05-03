import React, { useEffect, useState } from 'react';
import { clientAPI } from '../services/api';

const EMPTY = { name: '', email: '', phone: '', address: '', groupName: '', brandName: '' };

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm]   = useState(client || EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (client?.id) {
        await clientAPI.update(client.id, form);
      } else {
        await clientAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save client.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mis-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mis-modal">
        <div className="mis-modal-header">
          <span className="mis-modal-title">{client?.id ? 'Edit Client' : 'Add New Client'}</span>
          <button className="btn-close-mis" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mis-modal-body">
            {error && <div className="alert-mis alert-danger">{error}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Full Name *</label>
                <input name="name" className="form-control" value={form.name} onChange={set} required placeholder="Client / Company name" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={set} placeholder="client@email.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input name="phone" className="form-control" value={form.phone} onChange={set} placeholder="+91 98765 43210" />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea name="address" className="form-control" rows={2} value={form.address} onChange={set} placeholder="Full address" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Group / Chain</label>
                <input name="groupName" className="form-control" value={form.groupName} onChange={set} placeholder="e.g. Marriott Group" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Brand</label>
                <input name="brandName" className="form-control" value={form.brandName} onChange={set} placeholder="e.g. Courtyard" />
              </div>
            </div>
          </div>
          <div className="mis-modal-footer">
            <button type="button" className="btn-mis-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-mis-primary" style={{ width: 'auto', padding: '9px 20px' }} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</> : (client?.id ? 'Update Client' : 'Add Client')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'add' | client object
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await clientAPI.getAll();
      setClients(res.data || []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    setDeleting(id);
    try { await clientAPI.delete(id); load(); }
    catch { alert('Failed to delete client.'); }
    finally { setDeleting(null); }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
        <div className="d-flex gap-2 flex-grow-1" style={{ maxWidth: 320 }}>
          <div className="position-relative flex-grow-1">
            <i className="bi bi-search position-absolute" style={{ top: '50%', left: 12, transform: 'translateY(-50%)', color: 'var(--mis-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search clients..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <button className="btn-mis-primary" style={{ width: 'auto', padding: '9px 18px' }} onClick={() => setModal('add')}>
          <i className="bi bi-person-plus me-2" />Add Client
        </button>
      </div>

      {/* Table */}
      <div className="mis-card">
        <div className="mis-card-header">
          <span className="mis-card-title">All Clients ({filtered.length})</span>
        </div>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="mis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Group / Brand</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <i className="bi bi-people" />
                        <div>No clients found</div>
                        <small>Add your first client to get started</small>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="mono text-muted-mis" style={{ fontSize: 12 }}>{i + 1}</td>
                    <td className="fw-500">{c.name}</td>
                    <td className="text-muted-mis">{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                    <td>
                      {c.groupName && <span className="me-1" style={{ fontSize: 12, color: 'var(--mis-muted)' }}>{c.groupName}</span>}
                      {c.brandName && <span className="status-pill status-sent">{c.brandName}</span>}
                      {!c.groupName && !c.brandName && '—'}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-mis-outline" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => setModal(c)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-mis-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleDelete(c.id)} disabled={deleting === c.id}>
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
        <ClientModal
          client={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
