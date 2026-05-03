import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm]     = useState({ password: '', confirmPassword: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword: form.password });
      setSuccess('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">MIS</div>
          <div>
            <div className="auth-logo-title">InvoicePro</div>
            <div className="auth-logo-sub">Management System</div>
          </div>
        </div>

        <h2 className="auth-title">Reset password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        {!token && <div className="alert-mis alert-danger">Invalid or missing reset token.</div>}
        {error   && <div className="alert-mis alert-danger"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}
        {success && <div className="alert-mis alert-success"><i className="bi bi-check-circle me-2"/>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input type="password" className="form-control" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required disabled={!token} />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" placeholder="Repeat new password"
              value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required disabled={!token} />
          </div>
          <button type="submit" className="btn-mis-primary" disabled={loading || !token}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Resetting...</> : 'Reset Password'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: 13, color: 'var(--mis-muted)' }}>
          <Link to="/login" className="auth-link">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
