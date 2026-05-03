import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password });
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Get started with MIS Invoicing</p>

        {error   && <div className="alert-mis alert-danger"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}
        {success && <div className="alert-mis alert-success"><i className="bi bi-check-circle me-2"/>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-control" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" className="form-control" placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-mis-primary" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: 13, color: 'var(--mis-muted)' }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
