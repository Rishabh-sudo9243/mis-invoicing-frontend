import React, { useEffect, useState } from 'react';
import { groupAPI } from '../services/api';

function GroupModal({ group, onClose, onSave }) {
  const [form, setForm] = useState(group || { name: '', type: 'GROUP', description: '' });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      group?.id ? await groupAPI.update(group.id, form) : await groupAPI.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  return (
    <div className="mis-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mis-modal">
        <div className="mis-modal-header">
          <span className="mis-modal-title">{group?.id ? 'Edit Group/Brand' : 'Add Group / Brand'}</span>
          <button className="btn-close-mis" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mis-modal-body">
            {error && <div className="alert-mis alert-danger">{error}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Name *</label>
                <input name="name" className="form-control" value={form.name} onChange={set} required placeholder="e.g. Marriott International" />
              </div>
              <div className="col-12">
                <label className="form-label">Type</label>
                <select name="type" className="form-control" value={form.type} onChange={set}>
                  <option value="GROUP">Group</option>
                  <option value="CHAIN">Chain</option>
                  <option value="BRAND">Brand</option>
                  <option value="SUBZONE">Subzone</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows={2} value={form.description} onChange={set} placeholder="Optional description..." />
              </div>
            </div>
          </div>
          <div className="mis-modal-footer">
            <button type="button" className="btn-mis-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-mis-primary" style={{ width: 'auto', padding: '9px 20px' }} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</> : (group?.id ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TYPE_COLORS = {
  GROUP: 'status-sent', CHAIN: 'status-paid', BRAND: 'status-pending', SUBZONE: 'status-draft',
};

export default function Groups() {
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [filter,  setFilter]  = useState('ALL');

  const load = async () => {
    setLoading(true);
    try { const r = await groupAPI.getAll(); setGroups(r.data || []); }
    catch { setGroups([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try { await groupAPI.delete(id); load(); } catch { alert('Failed to delete.'); }
  };

  const types = ['ALL', 'GROUP', 'CHAIN', 'BRAND', 'SUBZONE'];
  const filtered = filter === 'ALL' ? groups : groups.filter(g => g.type === filter);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
        <div className="d-flex gap-1 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: '1.5px solid', cursor: 'pointer',
                background: filter === t ? 'var(--mis-blue)' : 'white',
                color: filter === t ? 'white' : 'var(--mis-muted)',
                borderColor: filter === t ? 'var(--mis-blue)' : 'var(--mis-border)',
              }}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn-mis-primary" style={{ width: 'auto', padding: '9px 18px' }} onClick={() => setModal('add')}>
          <i className="bi bi-plus-circle me-2" />Add Group / Brand
        </button>
      </div>

      <div className="mis-card">
        <div className="mis-card-header">
          <span className="mis-card-title">Groups & Brands ({filtered.length})</span>
        </div>
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="mis-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><i className="bi bi-diagram-3" /><div>No groups or brands yet</div></div></td></tr>
                ) : filtered.map((g, i) => (
                  <tr key={g.id}>
                    <td className="mono text-muted-mis" style={{ fontSize: 12 }}>{i + 1}</td>
                    <td className="fw-500">{g.name}</td>
                    <td><span className={`status-pill ${TYPE_COLORS[g.type] || 'status-draft'}`}>{g.type}</span></td>
                    <td className="text-muted-mis" style={{ fontSize: 12 }}>{g.description || '—'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-mis-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal(g)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-mis-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(g.id)}>
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
        <GroupModal
          group={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
