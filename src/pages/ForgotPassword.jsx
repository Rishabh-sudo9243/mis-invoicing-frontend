import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess('Password reset link sent! Please check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset email.');
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

        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-subtitle">Enter your email and we'll send a reset link</p>

        {error   && <div className="alert-mis alert-danger"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}
        {success && <div className="alert-mis alert-success"><i className="bi bi-check-circle me-2"/>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-mis-primary" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Sending...</> : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: 13, color: 'var(--mis-muted)' }}>
          <Link to="/login" className="auth-link">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
