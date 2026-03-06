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

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await authAPI.register(data);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const firstValidationError = err.response?.data?.errors?.[0]?.msg;
      const networkMessage = !err.response ? 'Cannot reach server. Check if backend is running on port 5000.' : null;
      toast.error(backendMessage || firstValidationError || networkMessage || 'Registration failed.');
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
          <p className="auth-subtitle">Create your free account to get started</p>

          {/* Role Toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8,
            padding: 4, marginBottom: 24, border: '1px solid var(--border)',
          }}>
            {[
              { val: 'customer', label: <><i className="fas fa-user"></i> I Need Repairs</>, desc: 'Book appointments' },
              { val: 'repairer', label: <><i className="fas fa-wrench"></i> I Repair Devices</>, desc: 'Manage my centre' },
            ].map(({ val, label, desc }) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: val }))}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: form.role === val ? 'var(--accent)' : 'transparent',
                  color: form.role === val ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s', textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input"
                placeholder={form.role === 'repairer' ? 'Your full name' : 'Jean Pierre Habimana'}
                value={form.name} onChange={handleChange} />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input type="tel" name="phone" className="form-input"
                placeholder="+250788000000" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-input"
                  placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            {form.role === 'repairer' && (
              <div style={{
                background: 'rgba(74,144,226,0.08)', border: '1px solid rgba(74,144,226,0.2)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)',
              }}>
                <i className="fas fa-wrench"></i> After registering, you'll be able to add your repair centre, list your services and manage customer appointments from your repairer dashboard.
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : `Create ${form.role === 'repairer' ? 'Repairer' : 'Customer'} Account ->`}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}

