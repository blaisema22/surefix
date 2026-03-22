import React, { useReducer, useEffect, useCallback } from 'react';
import { deviceAPI } from '@/api/devices.api';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { Smartphone, Laptop, Tablet, Cpu, Edit3, Trash2, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import '../../styles/devices.css'; // adjust path as needed

const DEVICE_TYPES = [
    { id: 'smartphone', label: 'Smartphone' },
    { id: 'laptop', label: 'Laptop' },
    { id: 'tablet', label: 'Tablet' },
    { id: 'desktop', label: 'Desktop' },
    { id: 'other', label: 'Other' },
];

/* ─────────────────────────────────────────────
   DeviceCard
   ───────────────────────────────────────────── */
const DeviceCard = ({ device, onEdit, onDelete }) => {
    const deviceTypeInfo = DEVICE_TYPES.find(t => t.id === device.device_type) || { label: device.device_type };

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
                    <div className="dv-card-type" style={{ marginTop: 3 }}>{deviceTypeInfo.label || device.device_type}</div>
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
                {device.battery && (
                    <span className="dv-pill">Battery: {device.battery}</span>
                )}
            </div>

            {/* Issue description */}
            <div className="dv-issue-box">
                <div className="dv-issue-label">Issue / Notes</div>
                <p className="dv-issue-text">
                    {device.issue_description || 'No issue reported. Device is in good standing.'}
                </p>
            </div>

            {/* Actions */}
            <div className="dv-card-actions">
                <button className="dv-btn-edit" onClick={() => onEdit(device)}>
                    <Edit3 size={13} style={{ display: 'inline', marginRight: 5 }} />
                    Edit
                </button>
                <button className="dv-btn-delete" onClick={() => onDelete(device.device_id)}>
                    <Trash2 size={13} style={{ display: 'inline', marginRight: 5 }} />
                    Delete
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Inline DeviceForm
   ───────────────────────────────────────────── */
const InlineDeviceForm = ({ device, onSave, onCancel, isSaving, error }) => {
    const [form, setForm] = React.useState({
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
                {device ? 'Edit Device' : 'Register New Device'}
            </div>

            {error && <div className="dv-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="dv-form-grid">
                    <div className="dv-field">
                        <label>Brand</label>
                        <input
                            type="text" placeholder="e.g. Samsung"
                            value={form.brand} onChange={set('brand')} required
                        />
                    </div>
                    <div className="dv-field">
                        <label>Model</label>
                        <input
                            type="text" placeholder="e.g. Galaxy S24"
                            value={form.model} onChange={set('model')} required
                        />
                    </div>
                    <div className="dv-field">
                        <label>Device Type</label>
                        <select value={form.device_type} onChange={set('device_type')}>
                            {DEVICE_TYPES.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dv-field">
                        <label>Purchase Year</label>
                        <input
                            type="number" placeholder="e.g. 2022" min="2000" max="2099"
                            value={form.purchase_year} onChange={set('purchase_year')}
                        />
                    </div>
                    <div className="dv-field">
                        <label>Serial Number</label>
                        <input
                            type="text" placeholder="Optional"
                            value={form.serial_number} onChange={set('serial_number')}
                        />
                    </div>
                    <div className="dv-field dv-full">
                        <label>Issue Description</label>
                        <textarea
                            placeholder="Describe the issue or leave blank if none..."
                            value={form.issue_description} onChange={set('issue_description')}
                        />
                    </div>
                </div>

                <div className="dv-form-actions">
                    <button type="button" className="dv-btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
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
   Reducer
   ───────────────────────────────────────────── */
const initialState = {
    devices: [], loading: true, error: '',
    isFormOpen: false, selectedDevice: null, isSaving: false,
    deleteId: null,
};

function deviceReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START': return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS': return { ...state, loading: false, devices: action.payload, error: '' };
        case 'FETCH_ERROR': return { ...state, loading: false, error: action.payload };
        case 'OPEN_FORM_ADD': return { ...state, isFormOpen: true, selectedDevice: null, error: '' };
        case 'OPEN_FORM_EDIT': return { ...state, isFormOpen: true, selectedDevice: action.payload, error: '' };
        case 'CLOSE_FORM': return { ...state, isFormOpen: false, selectedDevice: null, error: '' };
        case 'SAVE_START': return { ...state, isSaving: true, error: '' };
        case 'SAVE_SUCCESS': return { ...state, isSaving: false, isFormOpen: false, selectedDevice: null, error: '' };
        case 'SAVE_ERROR': return { ...state, isSaving: false, error: action.payload };
        case 'INIT_DELETE': return { ...state, deleteId: action.payload, error: '' };
        case 'CLOSE_DELETE': return { ...state, deleteId: null };
        default: return state;
    }
}

/* ─────────────────────────────────────────────
   ManageDevices page
   ───────────────────────────────────────────── */
const ManageDevices = () => {
    const [state, dispatch] = useReducer(deviceReducer, initialState);
    const { devices, loading, error, isFormOpen, selectedDevice, isSaving, deleteId } = state;

    const fetchDevices = useCallback(async () => {
        dispatch({ type: 'FETCH_START' });
        try {
            const response = await deviceAPI.getMyDevices();
            if (response.data.success) {
                dispatch({ type: 'FETCH_SUCCESS', payload: response.data.devices });
            } else {
                dispatch({ type: 'FETCH_ERROR', payload: response.data.message || 'Failed to fetch devices.' });
            }
        } catch {
            dispatch({ type: 'FETCH_ERROR', payload: 'Failed to fetch devices.' });
        }
    }, []);

    useEffect(() => { fetchDevices(); }, [fetchDevices]);

    const handleSaveDevice = async (formData) => {
        dispatch({ type: 'SAVE_START' });
        try {
            const payload = {
                brand: formData.brand,
                model: formData.model,
                device_type: formData.device_type,
                serial_number: formData.serial_number || null,
                purchase_year: formData.purchase_year ? Number(formData.purchase_year) : null,
                issue_description: formData.issue_description,
            };
            if (selectedDevice) {
                await deviceAPI.updateMyDevice(selectedDevice.device_id, payload);
            } else {
                await deviceAPI.addDevice(payload);
            }
            dispatch({ type: 'SAVE_SUCCESS' });
            fetchDevices();
        } catch (err) {
            dispatch({ type: 'SAVE_ERROR', payload: err.response?.data?.message || 'Failed to save device.' });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deviceAPI.deleteDevice(deleteId);
            dispatch({ type: 'CLOSE_DELETE' });
            fetchDevices();
        } catch (err) {
            dispatch({ type: 'CLOSE_DELETE' });
            dispatch({ type: 'FETCH_ERROR', payload: err.response?.data?.message || 'Failed to delete device.' });
        }
    };

    return (
        <div className="dv-root" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="dv-page">

                {/* ── Header ── */}
                <div className="dv-header-row dv-fade">
                    <div>
                        <p className="dv-page-eyebrow">Hardware Management</p>
                        <h1 className="dv-page-title">My Devices</h1>
                        <p className="dv-page-sub">Register and manage devices for faster repair bookings.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button className="dv-btn-ghost" onClick={fetchDevices} disabled={loading}>
                            <RefreshCw size={14} className={loading ? 'dv-spinner' : ''} />
                            Refresh
                        </button>
                        {!isFormOpen && (
                            <button className="dv-btn-add" onClick={() => dispatch({ type: 'OPEN_FORM_ADD' })}>
                                <Plus size={15} strokeWidth={2.5} />
                                Add Device
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Form ── */}
                {isFormOpen && (
                    <InlineDeviceForm
                        device={selectedDevice}
                        onSave={handleSaveDevice}
                        onCancel={() => dispatch({ type: 'CLOSE_FORM' })}
                        isSaving={isSaving}
                        error={error}
                    />
                )}

                {/* ── Error (outside form) ── */}
                {error && !isFormOpen && (
                    <div className="dv-error">{error}</div>
                )}

                {/* ── Cards grid ── */}
                {loading && devices.length === 0 ? (
                    <div className="dv-loading-grid">
                        {[1, 2, 3, 4].map(i => <div key={i} className="dv-skeleton" />)}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {devices.length > 0 ? (
                            devices.map((device, i) => (
                                <div key={device.device_id} className={`dv-s${Math.min(i + 1, 4)}`}>
                                    <DeviceCard
                                        device={device}
                                        onEdit={(d) => dispatch({ type: 'OPEN_FORM_EDIT', payload: d })}
                                        onDelete={(id) => dispatch({ type: 'INIT_DELETE', payload: id })}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="dv-empty-state">
                                <div className="dv-empty-icon"><Cpu size={28} /></div>
                                <div className="dv-empty-title">No devices yet</div>
                                <p className="dv-empty-sub">Add your first device to speed up repair bookings and track service history.</p>
                                <button className="dv-btn-add" onClick={() => dispatch({ type: 'OPEN_FORM_ADD' })}>
                                    <Plus size={14} /> Add Your First Device
                                </button>
                            </div>
                )}
            </div>
                )}

            {/* ── Footer info bar ── */}
            {devices.length > 0 && (
                <div className="dv-info-bar dv-fade">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                                Verified Hardware Network
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                                {devices.length} device{devices.length !== 1 ? 's' : ''} registered · End-to-end encrypted identifiers
                            </div>
                        </div>
                    </div>
                    <span className="dv-info-tag">v2.5 Secure</span>
                </div>
            )}

            {/* ── Confirmation Modal ── */}
            <ConfirmModal
                open={!!deleteId}
                title="Remove Device?"
                message="Are you sure you want to remove this device? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => dispatch({ type: 'CLOSE_DELETE' })}
                danger
            />

        </div>
        </div >
    );
};

export default ManageDevices;