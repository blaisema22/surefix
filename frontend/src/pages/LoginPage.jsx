import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const landingPageStyles = `
  .lp-nav {
    position: sticky; top: 0; z-index: 100;
    background: #fff; border-bottom: 1px solid #e4eaf6;
    display: flex; align-items: center;
    padding: 0 40px; height: 62px; gap: 0;
    box-shadow: 0 2px 12px rgba(30,60,120,0.07);
  }
  .lp-nav-logo {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; font-style: italic;
    color: #1a2f5a; margin-right: 48px; text-decoration: none;
  }
  .lp-nav-links { display: flex; gap: 4px; flex: 1; }
  .lp-nav-link {
    padding: 8px 16px; border-radius: 8px;
    font-size: 14px; font-weight: 500; color: #4a5e82;
    cursor: pointer; border: none; background: transparent;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
    text-decoration: none; display: inline-block;
  }
  .lp-nav-link:hover { background: #f0f4ff; color: #1a2f5a; }
  .lp-nav-link.active { color: #1a2f5a; font-weight: 700; }
  .lp-nav-right { display: flex; align-items: center; gap: 12px; }
  .lp-nav-search {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid #dde5f5; border-radius: 8px;
    padding: 7px 14px; font-size: 13px; color: #99aac5;
    background: #f8fafd; width: 190px;
  }
  .lp-nav-search input {
    border: none; background: transparent; outline: none;
    font-size: 13px; color: #2a3f6a; width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-nav-signin {
    background: #1a2f5a; color: #fff; border: none;
    border-radius: 8px; padding: 9px 22px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: background 0.15s;
    text-decoration: none;
  }
  .lp-nav-signin:hover { background: #3a6fd8; }
`;

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const hasRedirect = !!sessionStorage.getItem('surefix_redirect');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;

      // Save to context + localStorage
      login(token, user);

      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);

      // Restore saved redirect (e.g. user tried to book before logging in)
      const redirect = sessionStorage.getItem('surefix_redirect');
      sessionStorage.removeItem('surefix_redirect');

      if (redirect) {
        navigate(redirect);
        return;
      }

      // ── Route each role to its own dashboard ──────────────────
      if (user.role === 'admin')         navigate('/admin',     { replace: true });
      else if (user.role === 'repairer') navigate('/repairer',  { replace: true });
      else                               navigate('/dashboard', { replace: true });

    } catch (err) {
      // The API interceptor never fires for login endpoints, so we handle
      // wrong-credentials here and show the actual server message.
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{landingPageStyles}</style>

      {/* ── LANDING PAGE NAVBAR ── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-logo">SureFix</Link>
        <div className="lp-nav-links">
          <Link to="/" className="lp-nav-link">Home</Link>
          <Link to="/search" className="lp-nav-link">Find Repair Shop</Link>
        </div>
        <div className="lp-nav-right">
          <div className="lp-nav-search">
            <input placeholder="Search" />
            <span style={{ color: "#6b88b8", fontSize: 14 }}>🔍</span>
          </div>
          {user ? (
            <Link to="/dashboard" className="lp-nav-signin">My Dashboard</Link>
          ) : (
            <Link to="/login" className="lp-nav-signin">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">SUREFIX</div>

        {hasRedirect && (
          <div style={{
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            fontSize: 14, color: 'var(--accent)',
          }}>
            🔐 Please sign in to continue with your booking
          </div>
        )}

        <p className="auth-subtitle">Sign in to your SureFix account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" name="email" className="form-input"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-input"
              placeholder="Your password"
              value={form.password} onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
    </>
  );
}
