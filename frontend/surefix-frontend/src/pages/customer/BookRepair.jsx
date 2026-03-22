import React, { useReducer, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { centreAPI } from '../../api/centres.api';
import { appointmentAPI } from '../../api/appointments.api';
import { deviceAPI } from '../../api/devices.api';
import { useToast } from '../../context/ToastContext';
import {
    Calendar, Clock, Smartphone, Wrench, Camera, ShieldCheck,
    CheckCircle, ChevronRight, ChevronLeft, Upload, X, Star, Plus,
} from 'lucide-react';
import DeviceForm from '../../components/customer/DeviceForm';
import '../../styles/sf-pages.css';

/* ── Skeleton ── */
const Skeleton = () => (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="sf-page-wrap" style={{ paddingBottom: 120 }}>
            <div className="sf-skeleton" style={{ height: 80, marginBottom: 32 }} />
            <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="sf-skeleton" style={{ flex: 1, height: 52 }} />)}
            </div>
            <div className="sf-skeleton" style={{ height: 320 }} />
        </div>
    </div>
);

/* ── Step Indicator ── */
const StepIndicator = ({ step, steps }) => {
    const pct = ((step - 1) / (steps.length - 1)) * 100;
    return (
        <div className="sf-steps" style={{ justifyContent: 'space-between', marginBottom: 52 }}>
            <div className="sf-step-track"><div className="sf-step-fill" style={{ width: `${pct}%` }} /></div>
            {steps.map((s, i) => {
                const done = step > i + 1;
                const current = step === i + 1;
                return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={`sf-step-node ${done ? 'done' : current ? 'active' : ''}`}>
                            {done ? <CheckCircle size={18} /> : s.icon}
                            <span className="sf-step-label">{s.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const dropzoneStyles = `
    .sf-dropzone {
        display: flex;
        align-items: center;
        gap: 20px;
        transition: background-color 0.2s, border-color 0.2s;
    }
    .sf-dropzone.dragging {
        background-color: rgba(249, 115, 22, 0.05);
        border-color: rgba(249, 115, 22, 0.4) !important;
    }
    .sf-image-preview, .sf-dropzone-prompt-box {
        width: 100px; height: 100px; border-radius: 12px; flex-shrink: 0;
        position: relative; display: flex; align-items: center; justify-content: center;
        overflow: hidden; border: 2px dashed rgba(255, 255, 255, 0.1);
    }
    .sf-dropzone.dragging .sf-dropzone-prompt-box { border-color: rgba(249, 115, 22, 0.6); }
    .sf-image-preview img { width: 100%; height: 100%; object-fit: cover; }
    .sf-image-remove-btn {
        position: absolute; top: 6px; right: 6px; width: 24px; height: 24px;
        border-radius: 50%; background: rgba(0,0,0,0.7); border: none; color: white;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background-color 0.2s;
    }
    .sf-image-remove-btn:hover { background: rgba(239, 68, 68, 0.8); }
    .sf-dropzone-prompt { text-align: center; color: rgba(255,255,255,0.3); }
    .sf-dropzone-prompt svg { margin: 0 auto 8px; color: rgba(255,255,255,0.2); }
    .sf-dropzone-prompt p { font-size: 11px; margin: 2px 0; font-weight: 500; }
    .sf-dropzone-prompt b { color: rgba(255,255,255,0.5); }
    .sf-dropzone-prompt .sf-btn-secondary { display: inline-block; margin-top: 8px; padding: 4px 12px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.6); }
    .sf-dropzone-prompt .sf-btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }

    /* Modal Styles */
    .sf-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); animation: sf-fade 0.2s; }
    .sf-modal { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 480px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: sf-scale 0.2s; display: flex; flex-direction: column; max-height: 90vh; }
    .sf-modal-header { padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
    .sf-modal-title { font-size: 16px; font-weight: 700; color: #fff; }
    .sf-modal-close { background: transparent; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .sf-modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .sf-modal-body { padding: 24px; overflow-y: auto; }
    .sf-modal-footer { padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: flex-end; gap: 12px; background: rgba(255,255,255,0.02); }
    
    .sf-summ-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
    .sf-summ-label { color: rgba(255,255,255,0.4); }
    .sf-summ-val { color: rgba(255,255,255,0.9); font-weight: 600; text-align: right; max-width: 60%; }
    .sf-summ-img { width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-top: 12px; border: 1px solid rgba(255,255,255,0.1); background: #000; }
    .sf-summ-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 16px 0; }
`;

/* ── Reducer ── */
const init = {
    step: 1, loading: false, centre: null, services: [], devices: [],
    selectedService: null, customIssue: '', selectedDevice: null,
    deviceImage: null, imagePreview: null, selectedDate: '', selectedSlot: null,
    availableSlots: [], bookedSlots: [], isDeviceFormOpen: false, isDragging: false, isConfirmModalOpen: false,
};

function reducer(s, a) {
    switch (a.type) {
        case 'SET_LOADING': return { ...s, loading: a.payload };
        case 'INIT_DATA': return { ...s, ...a.payload, loading: false };
        case 'SET_STEP': return { ...s, step: a.payload };
        case 'SELECT_SERVICE': return { ...s, selectedService: a.payload };
        case 'SET_ISSUE': return { ...s, customIssue: a.payload };
        case 'SELECT_DEVICE': return { ...s, selectedDevice: a.payload };
        case 'SET_IMAGE': return { ...s, deviceImage: a.file, imagePreview: a.preview };
        case 'REMOVE_IMAGE': return { ...s, deviceImage: null, imagePreview: null };
        case 'SET_DATE': return { ...s, selectedDate: a.payload, selectedSlot: null, availableSlots: [], bookedSlots: [] };
        case 'SET_SLOTS': return { ...s, availableSlots: a.available, bookedSlots: a.booked };
        case 'SELECT_SLOT': return { ...s, selectedSlot: a.payload };
        case 'TOGGLE_FORM': return { ...s, isDeviceFormOpen: a.payload };
        case 'ADD_DEVICE': return { ...s, devices: [...s.devices, a.payload], selectedDevice: a.payload, isDeviceFormOpen: false };
        case 'SET_DRAGGING': return { ...s, isDragging: a.payload };
        case 'TOGGLE_CONFIRM_MODAL': return { ...s, isConfirmModalOpen: a.payload };
        default: return s;
    }
}

const isCentreOpen = (days, date) => {
    if (!days || !date) return true;
    const lower = days.toLowerCase();
    if (lower.includes('every') || lower.includes('daily')) return true;
    const map = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const parts = lower.split('-').map(p => p.trim().substring(0, 3));
    if (parts.length === 2 && map[parts[0]] !== undefined && map[parts[1]] !== undefined) {
        const [s2, e2] = [map[parts[0]], map[parts[1]]];
        const [y, m, d2] = date.split('-').map(Number);
        const cur = new Date(y, m - 1, d2).getDay();
        return s2 <= e2 ? (cur >= s2 && cur <= e2) : (cur >= s2 || cur <= e2);
    }
    return true;
};

const STEPS = [
    { label: 'Service', icon: <Wrench size={17} /> },
    { label: 'Device', icon: <Smartphone size={17} /> },
    { label: 'Schedule', icon: <Calendar size={17} /> },
    { label: 'Confirm', icon: <ShieldCheck size={17} /> },
];

const BookingConfirmationModal = ({ s, onConfirm, onCancel }) => {
    const { centre, selectedService, selectedDevice, selectedDate, selectedSlot, customIssue, imagePreview, loading } = s;

    return (
        <div className="sf-modal-overlay" onClick={onCancel}>
            <div className="sf-modal" onClick={e => e.stopPropagation()}>
                <div className="sf-modal-header">
                    <span className="sf-modal-title">Final Confirmation</span>
                    <button className="sf-modal-close" onClick={onCancel}><X size={18} /></button>
                </div>
                <div className="sf-modal-body">
                    <div className="sf-summ-row">
                        <span className="sf-summ-label">Service</span>
                        <span className="sf-summ-val">{selectedService?.service_name}</span>
                    </div>
                    <div className="sf-summ-row">
                        <span className="sf-summ-label">Device</span>
                        <span className="sf-summ-val">{selectedDevice?.brand} {selectedDevice?.model}</span>
                    </div>
                    <div className="sf-summ-row">
                        <span className="sf-summ-label">Centre</span>
                        <span className="sf-summ-val">{centre?.name}</span>
                    </div>
                    <div className="sf-summ-row">
                        <span className="sf-summ-label">Date & Time</span>
                        <span className="sf-summ-val">{selectedDate} at {selectedSlot}</span>
                    </div>
                    <div className="sf-summ-row">
                        <span className="sf-summ-label">Estimated Cost</span>
                        <span className="sf-summ-val" style={{ color: '#f97316' }}>
                            {selectedService?.estimated_price_min > 0 ? `${Number(selectedService.estimated_price_min).toLocaleString()} RWF` : 'To be quoted'}
                        </span>
                    </div>

                    {(customIssue || (selectedService?.service_id === 'other')) && (
                        <>
                            <div className="sf-summ-divider" />
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>Issue Description</div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, margin: 0 }}>
                                {customIssue || 'No description provided.'}
                            </p>
                        </>
                    )}

                    {imagePreview && (
                        <>
                            <div className="sf-summ-divider" />
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>Device Photo</div>
                            <img src={imagePreview} alt="Issue Preview" className="sf-summ-img" />
                        </>
                    )}
                </div>
                <div className="sf-modal-footer">
                    <button className="sf-btn-ghost" onClick={onCancel} disabled={loading}>Go Back</button>
                    <button className="sf-btn-primary" onClick={onConfirm} disabled={loading}>
                        {loading ? <><span className="sf-spinner" /> Booking...</> : 'Confirm & Book'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookRepair = () => {
    const { centreId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [s, dispatch] = useReducer(reducer, init);
    const { step, loading, centre, services, devices, selectedService, customIssue,
        selectedDevice, deviceImage, imagePreview, selectedDate, selectedSlot, isDragging,
        availableSlots, bookedSlots } = s;

    useEffect(() => {
        (async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const [cRes, sRes, dRes] = await Promise.all([
                    centreAPI.getCentreById(centreId),
                    centreAPI.getCentreServices(centreId),
                    deviceAPI.getMyDevices(),
                ]);
                dispatch({
                    type: 'INIT_DATA', payload: {
                        centre: cRes.data.success ? cRes.data.centre : null,
                        services: sRes.data.success ? sRes.data.services : [],
                        devices: dRes.data.success ? dRes.data.devices : [],
                    }
                });
            } catch { addToast('Failed to load booking data', 'error'); navigate('/find-repair'); }
        })();
    }, [centreId]);

    useEffect(() => {
        if (!selectedDate || !centreId || !centre) return;
        if (!isCentreOpen(centre.working_days, selectedDate)) { addToast('Centre is closed on that day', 'error'); return; }
        (async () => {
            try {
                const res = await centreAPI.getAvailability(centreId, selectedDate);
                if (res.data.success) dispatch({ type: 'SET_SLOTS', available: res.data.available_slots, booked: res.data.booked_slots || [] });
            } catch { }
        })();
    }, [selectedDate, centreId, centre]);

    const processFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            return addToast('Please upload a valid image file (JPG, PNG).', 'error');
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return addToast('File is too large. Maximum size is 5MB.', 'error');
        }
        const reader = new FileReader();
        reader.onloadend = () => dispatch({ type: 'SET_IMAGE', file, preview: reader.result });
        reader.readAsDataURL(file);
    };

    const handleImageUpload = e => {
        processFile(e.target.files[0]);
    };

    const handleDragOver = e => {
        e.preventDefault();
        dispatch({ type: 'SET_DRAGGING', payload: true });
    };

    const handleDragLeave = e => {
        e.preventDefault();
        dispatch({ type: 'SET_DRAGGING', payload: false });
    };

    const handleDrop = e => {
        e.preventDefault();
        dispatch({ type: 'SET_DRAGGING', payload: false });
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const validate = () => {
        if (step === 1 && !selectedService) { addToast('Select a service', 'error'); return false; }
        if (step === 1 && selectedService?.service_id === 'other' && !customIssue) { addToast('Describe the issue', 'error'); return false; }
        if (step === 2 && !selectedDevice) { addToast('Select a device', 'error'); return false; }
        if (step === 3 && (!selectedDate || !selectedSlot)) { addToast('Pick date and time', 'error'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const fd = new FormData();
            fd.append('centre_id', centreId);
            fd.append('device_id', selectedDevice?.device_id);
            fd.append('appointment_date', selectedDate);
            fd.append('appointment_time', selectedSlot);
            fd.append('issue_description', selectedService?.service_id === 'other' ? customIssue : selectedService?.service_name);
            if (selectedService?.service_id && selectedService.service_id !== 'other') fd.append('service_id', selectedService.service_id);
            if (deviceImage) fd.append('deviceImage', deviceImage);
            const res = await appointmentAPI.createAppointment(fd);
            if (res.success) { addToast('Appointment booked!', 'success'); setTimeout(() => navigate('/appointments', { replace: true }), 1500); }
        } catch (err) { addToast(err.response?.data?.message || 'Booking failed', 'error'); dispatch({ type: 'SET_LOADING', payload: false }); }
    };

    const handleSaveDevice = async (fd) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const payload = { brand: fd.brand, model: fd.model, device_type: fd.device_type, serial_number: fd.serial_number || null, purchase_year: fd.purchase_year ? Number(fd.purchase_year) : null, issue_description: fd.issue_description };
            const res = await deviceAPI.addDevice(payload);
            if (res.data.success) { dispatch({ type: 'ADD_DEVICE', payload: res.data.device }); addToast('Device added!', 'success'); }
        } catch { addToast('Failed to add device', 'error'); }
        finally { dispatch({ type: 'SET_LOADING', payload: false }); }
    };

    if (loading && !centre) return <Skeleton />;

    return (
        <>
            <style>{dropzoneStyles}</style>
            <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="sf-page-wrap" style={{ paddingBottom: 100 }}>

                    {/* Header */}
                    <div className="sf-anim-up" style={{ marginBottom: 36 }}>
                        <span className="sf-eyebrow">Booking Flow</span>
                        <h1 className="sf-page-title">Book a Repair</h1>
                        <p className="sf-page-sub">
                            {centre ? <>At <span style={{ color: 'rgba(249,115,22,0.8)', fontWeight: 600 }}>{centre.name}</span> · {centre.shop_district}</> : 'Loading centre…'}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator step={step} steps={STEPS} />

                    {/* ── Step 1: Service ── */}
                    {step === 1 && (
                        <div className="sf-anim-scale">
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>
                                Select a Service
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
                                {[...services, { service_id: 'other', service_name: 'Other Issue', estimated_duration_minutes: 30, estimated_price_min: 0 }].map(srv => {
                                    const sel = selectedService?.service_id === srv.service_id;
                                    return (
                                        <div key={srv.service_id} className={`sf-select-card ${sel ? 'selected' : ''}`}
                                            onClick={() => dispatch({ type: 'SELECT_SERVICE', payload: srv })}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: sel ? '#fff' : 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{srv.service_name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{srv.estimated_duration_minutes} min</span>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: sel ? '#f97316' : 'rgba(255,255,255,0.3)' }}>
                                                    {srv.estimated_price_min > 0 ? `${Number(srv.estimated_price_min).toLocaleString()} RWF` : 'Quote'}
                                                </span>
                                            </div>
                                            {sel && <div style={{ position: 'absolute', top: 14, right: 14 }}><CheckCircle size={15} color="#f97316" /></div>}
                                        </div>
                                    );
                                })}
                            </div>
                            {selectedService?.service_id === 'other' && (
                                <div className="sf-field sf-anim-scale">
                                    <label>Describe the Issue</label>
                                    <textarea value={customIssue} onChange={e => dispatch({ type: 'SET_ISSUE', payload: e.target.value })} placeholder="Explain the hardware issue in detail…" style={{ minHeight: 100 }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Device ── */}
                    {step === 2 && (
                        <div className="sf-anim-scale">
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>
                                Select Your Device
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
                                {devices.map(dev => {
                                    const sel = selectedDevice?.device_id === dev.device_id;
                                    return (
                                        <div key={dev.device_id} className={`sf-select-card ${sel ? 'selected' : ''}`}
                                            onClick={() => dispatch({ type: 'SELECT_DEVICE', payload: dev })}
                                            style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: sel ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sel ? '#f97316' : 'rgba(255,255,255,0.25)', flexShrink: 0, transition: 'all 0.2s' }}>
                                                <Smartphone size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: sel ? '#fff' : 'rgba(255,255,255,0.6)' }}>{dev.model}</div>
                                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{dev.brand}</div>
                                            </div>
                                            {sel && <CheckCircle size={14} color="#f97316" style={{ marginLeft: 'auto' }} />}
                                        </div>
                                    );
                                })}
                                <button
                                    className="sf-select-card"
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' }}
                                    onClick={() => dispatch({ type: 'TOGGLE_FORM', payload: true })}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(249,115,22,0.6)' }}>
                                        <Plus size={16} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>Add New Device</span>
                                </button>
                            </div>

                            {/* Image upload */}
                            <div
                                className={`sf-glass sf-dropzone ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {imagePreview ? (
                                    <div className="sf-image-preview">
                                        <img src={imagePreview} alt="Device Preview" />
                                        <button onClick={() => dispatch({ type: 'REMOVE_IMAGE' })} className="sf-image-remove-btn">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sf-dropzone-prompt-box">
                                        <div className="sf-dropzone-prompt">
                                            <Upload size={20} />
                                            <p><b>Drag & drop</b></p>
                                            <label className="sf-btn-secondary">
                                                Browse File
                                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                    </div>
                                )}
                                <div className="sf-dropzone-text">
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Device Photo (Optional)</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.55 }}>Upload a photo of the issue to help technicians prepare. Max 5MB.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Schedule ── */}
                    {step === 3 && (
                        <div className="sf-anim-scale">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>Pick a Date</div>
                                    <div className="sf-field">
                                        <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={e => dispatch({ type: 'SET_DATE', payload: e.target.value })} style={{ fontSize: 14, fontWeight: 600 }} />
                                    </div>
                                    <div className="sf-glass" style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <Clock size={14} color="rgba(249,115,22,0.6)" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, margin: 0 }}>
                                            Sessions typically take <strong style={{ color: 'rgba(255,255,255,0.4)' }}>45–120 minutes</strong>. Early slots are filled first.
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>Available Times</div>
                                    {selectedDate ? (
                                        (availableSlots.length || bookedSlots.length) ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                                {[...availableSlots, ...bookedSlots].sort().map(slot => {
                                                    const booked = bookedSlots.includes(slot);
                                                    const sel = selectedSlot === slot;
                                                    return (
                                                        <button key={slot}
                                                            disabled={booked}
                                                            onClick={() => !booked && dispatch({ type: 'SELECT_SLOT', payload: slot })}
                                                            style={{
                                                                padding: '10px 4px', borderRadius: 10, border: '1px solid',
                                                                fontFamily: 'Outfit,sans-serif', fontSize: 12, fontWeight: 600, cursor: booked ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.18s',
                                                                borderColor: sel ? '#f97316' : booked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                                                                background: sel ? 'rgba(249,115,22,0.18)' : booked ? 'transparent' : 'rgba(255,255,255,0.03)',
                                                                color: sel ? '#f97316' : booked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.45)',
                                                                textDecoration: booked ? 'line-through' : 'none',
                                                            }}
                                                        >{slot}</button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="sf-empty" style={{ padding: '24px 16px', borderStyle: 'dashed' }}>
                                                <p className="sf-empty-sub" style={{ marginBottom: 0, fontSize: 12 }}>No slots available for this date.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="sf-empty" style={{ padding: '24px 16px', borderStyle: 'dashed' }}>
                                            <p className="sf-empty-sub" style={{ marginBottom: 0, fontSize: 12 }}>Pick a date to see available time slots.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Confirm ── */}
                    {step === 4 && (
                        <div className="sf-anim-scale">
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>Review & Confirm</div>
                            <div className="sf-glass" style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                {[
                                    { label: 'Service', value: selectedService?.service_name },
                                    { label: 'Device', value: `${selectedDevice?.brand} ${selectedDevice?.model}` },
                                    { label: 'Date', value: selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : '' },
                                    { label: 'Time', value: selectedSlot },
                                    { label: 'Centre', value: centre?.name },
                                    { label: 'Estimate', value: selectedService?.estimated_price_min > 0 ? `${Number(selectedService.estimated_price_min).toLocaleString()} RWF` : 'To be quoted', highlight: true },
                                ].map(({ label, value, highlight }) => (
                                    <div key={label}>
                                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 5 }}>{label}</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: highlight ? '#f97316' : 'rgba(255,255,255,0.8)' }}>{value || '—'}</div>
                                    </div>
                                ))}
                            </div>
                            {(selectedService?.service_id === 'other') && customIssue && (
                                <div className="sf-glass" style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 6 }}>Issue Description</div>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{customIssue}</p>
                                </div>
                            )}
                            <div className="sf-glass" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShieldCheck size={15} color="rgba(249,115,22,0.6)" />
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.5 }}>
                                    Your booking is encrypted and secure. You'll receive a confirmation notification after submission.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* ── Bottom bar ── */}
                <div className="sf-bottom-bar">
                    <div className="sf-bottom-inner">
                        <button
                            className="sf-btn-ghost"
                            onClick={() => step > 1 ? dispatch({ type: 'SET_STEP', payload: step - 1 }) : navigate(-1)}
                        >
                            <ChevronLeft size={15} />
                            {step === 1 ? 'Back' : 'Previous'}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Summary pill */}
                            {selectedService && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)' }}>
                                    <Wrench size={12} color="rgba(249,115,22,0.7)" />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(249,115,22,0.8)' }}>{selectedService.service_name}</span>
                                    {selectedDevice && <><span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{selectedDevice.model}</span></>}
                                </div>
                            )}
                            {step < 4 ? (
                                <button className="sf-btn-primary" style={{ padding: '12px 288px', fontSize: 14 }} onClick={() => validate() && dispatch({ type: 'SET_STEP', payload: step + 1 })}>
                                    Continue <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button className="sf-btn-primary" style={{ padding: '12px 32px', fontSize: 14, boxShadow: '0 6px 24px rgba(249,115,22,0.4)' }} onClick={() => dispatch({ type: 'TOGGLE_CONFIRM_MODAL', payload: true })} disabled={loading}>
                                    Review & Submit <CheckCircle size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {s.isDeviceFormOpen && (
                    <DeviceForm onSave={handleSaveDevice} onCancel={() => dispatch({ type: 'TOGGLE_FORM', payload: false })} isSaving={loading} />
                )}

                {s.isConfirmModalOpen && (
                    <BookingConfirmationModal
                        s={s}
                        onConfirm={handleSubmit}
                        onCancel={() => dispatch({ type: 'TOGGLE_CONFIRM_MODAL', payload: false })}
                    />
                )}
            </div>
        </>
    );
};

export default BookRepair;