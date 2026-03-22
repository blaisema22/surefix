import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { deviceAPI } from '@/api/devices.api';
import {
    Smartphone, Laptop, Tablet, Cpu, Plus,
    Trash2, Edit3, ShieldCheck, Activity, RefreshCw
} from 'lucide-react';
import '../../styles/devices.css'; // adjust path as needed

/* ─────────────────────────────────────────────
   DeviceCard
   ───────────────────────────────────────────── */
const DeviceCard = ({ device, onEdit, onDelete }) => {
    const getIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('phone')) return <Smartphone size={20} />;
        if (t.includes('laptop')) return <Laptop size={20} />;
        if (t.includes('tablet')) return <Tablet size={20} />;
        return <Cpu size={20} />;
    };

    return (
        <div className="dv-card dv-fade">
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div className="dv-icon-box">
                    {getIcon(device.device_type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dv-card-brand">{device.brand}</div>
                    <div className="dv-card-model">{device.model}</div>
                    <div className="dv-card-type" style={{ marginTop: 3 }}>{device.device_type}</div>
                </div>
            </div>

            {/* Meta pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {device.serial_number && (
                    <span className="dv-pill">S/N: {device.serial_number}</span>
                )}
                {device.purchase_year && (
                    <span className="dv-pill">Year: {device.purchase_year}</span>
                )}
            </div>

            {/* Issue box */}
            <div className="dv-issue-box">
                <div className="dv-issue-label">Issue / Notes</div>
                <p className="dv-issue-text">
                    {device.issue_description || 'No issue reported. Device is in good standing.'}
                </p>
            </div>

            {/* Ecosystem tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={12} color="#4ade80" />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(74,222,128,0.7)' }}>
                        Linked to Ecosystem
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button
                        onClick={() => onEdit(device)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.18s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        title="Edit"
                    >
                        <Edit3 size={13} />
                    </button>
                    <button
                        onClick={() => onDelete(device.device_id)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.18s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Inline Form
   ───────────────────────────────────────────── */
const DeviceFormInline = ({ device, onSave, onCancel, isSaving, error }) => {
    const [form, setForm] = useState({
        brand: device?.brand || '',
        model: device?.model || '',
        device_type: device?.device_type || 'smartphone',
        serial_number: device?.serial_number || '',
        purchase_year: device?.purchase_year || '',
        issue_description: device?.issue_description || '',
    });

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

    return (
        <div className="dv-form-wrap dv-scale">
            <div className="dv-form-title">
                {device ? '✏️ Edit Device' : '＋ Register New Device'}
            </div>

            {error && <div className="dv-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="dv-form-grid">
                    <div className="dv-field">
                        <label>Brand</label>
                        <input type="text" placeholder="e.g. Apple" value={form.brand} onChange={set('brand')} required />
                    </div>
                    <div className="dv-field">
                        <label>Model</label>
                        <input type="text" placeholder="e.g. iPhone 15" value={form.model} onChange={set('model')} required />
                    </div>
                    <div className="dv-field">
                        <label>Device Type</label>
                        <select value={form.device_type} onChange={set('device_type')}>
                            <option value="smartphone">Smartphone</option>
                            <option value="laptop">Laptop</option>
                            <option value="tablet">Tablet</option>
                            <option value="desktop">Desktop</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="dv-field">
                        <label>Purchase Year</label>
                        <input type="number" placeholder="e.g. 2023" min="2000" max="2099" value={form.purchase_year} onChange={set('purchase_year')} />
                    </div>
                    <div className="dv-field">
                        <label>Serial Number</label>
                        <input type="text" placeholder="Optional" value={form.serial_number} onChange={set('serial_number')} />
                    </div>
                    <div className="dv-field dv-full">
                        <label>Issue Description</label>
                        <textarea placeholder="Describe any issues, or leave blank if none..." value={form.issue_description} onChange={set('issue_description')} />
                    </div>
                </div>
                <div className="dv-form-actions">
                    <button type="button" className="dv-btn-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="dv-btn-save" disabled={isSaving}>
                        {isSaving
                            ? <><span className="dv-spinner" style={{ marginRight: 8 }} />Saving…</>
                            : device ? 'Save Changes' : 'Add Device'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MyDevices page
   ───────────────────────────────────────────── */
const MyDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await deviceAPI.getMyDevices();
            if (response.data.success) {
                setDevices(response.data.devices || []);
            } else {
                setError('Failed to load devices.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDevices(); }, [fetchDevices]);

    const handleSave = async (deviceData) => {
        setIsSaving(true);
        setError(null);
        try {
            if (editingDevice) {
                await deviceAPI.updateMyDevice(editingDevice.device_id, deviceData);
            } else {
                await deviceAPI.addMyDevice(deviceData);
            }
            setShowForm(false);
            setEditingDevice(null);
            await fetchDevices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save device.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this device from your account?')) return;
        try {
            await deviceAPI.deleteMyDevice(id);
            await fetchDevices();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete device.');
        }
    };

    return (
        <div className="dv-root" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="dv-page">

                {/* ── Header ── */}
                <div className="dv-header-row dv-fade">
                    <div>
                        <p className="dv-page-eyebrow">Hardware Ecosystem</p>
                        <h1 className="dv-page-title">My Hardware</h1>
                        <p className="dv-page-sub">Track and manage all your registered devices.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="dv-btn-ghost" onClick={fetchDevices} disabled={loading}>
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                        {!showForm && (
                            <button className="dv-btn-add" onClick={() => { setEditingDevice(null); setShowForm(true); }}>
                                <Plus size={15} strokeWidth={2.5} />
                                Add Device
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Form ── */}
                {showForm && (
                    <DeviceFormInline
                        device={editingDevice}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditingDevice(null); setError(null); }}
                        isSaving={isSaving}
                        error={error}
                    />
                )}

                {/* ── Error outside form ── */}
                {error && !showForm && <div className="dv-error">{error}</div>}

                {/* ── Cards ── */}
                {loading && devices.length === 0 ? (
                    <div className="dv-loading-grid">
                        {[1, 2, 3, 4].map(i => <div key={i} className="dv-skeleton" />)}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {devices.length > 0 ? (
                            devices.map((dev, i) => (
                                <div key={dev.device_id} className={`dv-s${Math.min(i + 1, 4)}`}>
                                    <DeviceCard
                                        device={dev}
                                        onEdit={(d) => { setEditingDevice(d); setError(null); setShowForm(true); }}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))
                        ) : !showForm && (
                            <div className="dv-empty">
                                <div className="dv-empty-icon"><Cpu size={28} /></div>
                                <div className="dv-empty-title">No devices registered</div>
                                <p className="dv-empty-sub">Add your first device to get started with faster repair bookings.</p>
                                <button className="dv-btn-add" onClick={() => setShowForm(true)}>
                                    <Plus size={14} /> Add Device
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Footer bar ── */}
                {devices.length > 0 && (
                    <div className="dv-info-bar dv-fade">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Verified Hardware Network</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                                    {devices.length} device{devices.length !== 1 ? 's' : ''} registered · End-to-end encrypted identifiers
                                </div>
                            </div>
                        </div>
                        <span className="dv-info-tag">v2.5 Secure</span>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyDevices;