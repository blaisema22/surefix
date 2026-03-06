import React, { useState, useEffect, useCallback } from 'react';
import { deviceAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const DEVICE_TYPES = ['smartphone', 'tablet', 'laptop', 'desktop', 'other'];
const DEVICE_ICONS = { smartphone: 'fa-mobile-alt', tablet: 'fa-tablet-alt', laptop: 'fa-laptop', desktop: 'fa-desktop', other: 'fa-wrench' };

const emptyForm = { brand: '', model: '', device_type: 'smartphone', serial_number: '', purchase_year: '', issue_description: '' };

function DeviceModal({ device, onClose, onSave }) {
  const [form, setForm] = useState(device || emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.brand.trim()) errs.brand = 'Brand required';
    if (!form.model.trim()) errs.model = 'Model required';
    if (!form.issue_description.trim()) errs.issue_description = 'Issue description required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (device) {
        await deviceAPI.update(device.device_id, form);
        toast.success('Device updated!');
      } else {
        await deviceAPI.create(form);
        toast.success('Device added successfully!');
      }
      onSave();
    } catch (err) {
      console.error('Error saving device:', err);
      if (err.response) {
        if (err.response.status === 401) {
          toast.error('Please login again to save device.');
        } else if (err.response.data?.errors) {
          // Handle validation errors from express-validator
          const validationErrors = {};
          err.response.data.errors.forEach(error => {
            validationErrors[error.path] = error.msg;
          });
          setErrors(validationErrors);
          toast.error('Please fix the validation errors.');
        } else {
          toast.error(err.response.data?.message || 'Error saving device.');
        }
      } else if (err.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Error saving device. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: 'var(--text-primary)' }}>{device ? 'Edit Device' : 'Add New Device'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input name="brand" className="form-input" placeholder="Samsung, Apple, HP..." value={form.brand} onChange={handleChange} />
              {errors.brand && <p className="form-error">{errors.brand}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input name="model" className="form-input" placeholder="Galaxy S21, iPhone 13..." value={form.model} onChange={handleChange} />
              {errors.model && <p className="form-error">{errors.model}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Device Type</label>
              <select name="device_type" className="form-select" value={form.device_type} onChange={handleChange}>
                {DEVICE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Year (Optional)</label>
              <input name="purchase_year" className="form-input" type="number" placeholder="2022" min="2000" max={new Date().getFullYear()}
                value={form.purchase_year} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Serial Number (Optional)</label>
            <input name="serial_number" className="form-input" placeholder="IMEI or serial number" value={form.serial_number} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Issue Description</label>
            <textarea name="issue_description" className="form-textarea" placeholder="Describe the problem with your device..." value={form.issue_description} onChange={handleChange} />
            {errors.issue_description && <p className="form-error">{errors.issue_description}</p>}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : device ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | device object for edit

  const fetchDevices = useCallback(async () => {
    try {
      const res = await deviceAPI.getAll();
      if (res.data && res.data.success) {
        setDevices(res.data.devices || []);
      } else {
        setDevices([]);
        toast.error(res.data?.message || 'Failed to load devices.');
      }
    } catch (err) {
      console.error('Failed to load devices:', err);
      setDevices([]);
      if (err.response) {
        if (err.response.status === 401) {
          toast.error('Please login to view your devices.');
        } else {
          toast.error(err.response.data?.message || 'Failed to load devices.');
        }
      } else if (err.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to load devices.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this device? This cannot be undone.')) return;
    try {
      await deviceAPI.delete(id);
      toast.success('Device deleted.');
      fetchDevices();
    } catch {
      toast.error('Failed to delete device.');
    }
  };

  const handleModalSave = () => {
    setModal(null);
    fetchDevices();
  };

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)' }}>My Devices</h2>
            <p>Manage your registered electronic devices</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Device</button>
        </div>

        {devices.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="icon"><i className="fas fa-mobile-alt"></i></div>
              <h3>No devices registered yet</h3>
              <p>Add a device to start booking repair appointments.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setModal('add')}>
                Add Your First Device
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {devices.map(d => (
              <div key={d.device_id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}><i className={`fas ${DEVICE_ICONS[d.device_type] || 'fa-wrench'}`}></i></span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal(d)}><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.device_id)}><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontSize: '1rem' }}>
                  {d.brand} {d.model}
                </div>
                <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'capitalize', marginBottom: 8 }}>
                  {d.device_type}{d.purchase_year ? ` · ${d.purchase_year}` : ''}
                </div>
                {d.serial_number && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                    SN: {d.serial_number}
                  </div>
                )}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <strong style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Issue:</strong><br />
                  {d.issue_description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <DeviceModal
          device={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
