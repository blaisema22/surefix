import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      updateUser(form);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container page-inner" style={{ maxWidth: 600 }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 32 }}>My Profile</h2>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', align: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</div>
              <div style={{ marginTop: 4 }}>
                {user?.is_verified
                  ? <span style={{ fontSize: 12, color: 'var(--green)' }}><i className="fas fa-check-circle"></i> Email verified</span>
                  : <span style={{ fontSize: 12, color: 'var(--yellow)' }}><i className="fas fa-exclamation-triangle"></i> Email not verified</span>
                }
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone" className="form-input" placeholder="+250788000000" value={form.phone} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Account Actions</h3>
          <div className="info-row">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Member since</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-danger" onClick={() => { if (window.confirm('Are you sure you want to log out?')) logout(); }}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
