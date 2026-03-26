import React, { useState, useEffect, useCallback } from 'react';
import { appointmentAPI } from '../../api/appointments.api';
import { Calendar, Clock, User, Smartphone, Hash, Search, XCircle, CheckCircle2, ChevronRight, X, Image as ImageIcon, Upload, Smartphone as Phone } from 'lucide-react';
import '../../styles/sf-pages.css';

const SF_STATUS_STYLES = {
    pending: { bg: 'rgba(245,158,11,0.1)', color: 'rgba(251,191,36,0.85)', label: 'Pending' },
    confirmed: { bg: 'rgba(59,130,246,0.1)', color: 'rgba(96,165,250,0.85)', label: 'Confirmed' },
    in_progress: { bg: 'rgba(139,92,246,0.1)', color: 'rgba(167,139,250,0.85)', label: 'In Progress' },
    completed: { bg: 'rgba(34,197,94,0.1)', color: 'rgba(74,222,128,0.85)', label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.08)', color: 'rgba(252,165,165,0.75)', label: 'Cancelled' },
};

const FILTERS = ['active', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'all'];

const ShopAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('active');
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [completionModal, setCompletionModal] = useState({ open: false, id: null });
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchApps = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await appointmentAPI.getShopAppointments();
            if (res.success) setAppointments(res.appointments ?? []);
            else setError('Failed to fetch appointments.');
        } catch (err) {
            setError(err.response?.data?.message ?? 'An error occurred fetching appointments.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    const updateStatus = async (id, status) => {
        if (status === 'completed') {
            setCompletionModal({ open: true, id });
            return;
        }

        if (!window.confirm(`Are you sure you want to mark this appointment as ${status.replace('_', ' ').toUpperCase()}?`)) return;
        setProcessingId(id);
        try {
            const res = await appointmentAPI.updateAppointmentStatus(id, status);
            if (res.success) setAppointments(p => p.map(a => a.appointment_id === id ? { ...a, status: status } : a));
        } catch (err) {
            alert(err.response?.data?.message ?? 'Failed to update status.');
        } finally { setProcessingId(null); }
    };

    const baseFiltered = appointments
        .filter(a => {
            if (!searchTerm.trim()) return true;
            return (a.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()));
        })
        .filter(a => {
            if (!startDate && !endDate) return true;
            let appDateStr = '';
            if (typeof a.appointment_date === 'string') {
                appDateStr = a.appointment_date.substring(0, 10);
            }
            if (startDate && appDateStr < startDate) return false;
            if (endDate && appDateStr > endDate) return false;
            return true;
        });

    const listFiltered = baseFiltered.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['pending', 'confirmed', 'in_progress'].includes(a.status);
        return a.status === filter;
    });

    const getImageUrl = (path) => {
        if (!path) return null;
        const token = localStorage.getItem('token');
        return `${API_URL}/${path}?token=${token}`;
    };

    const CompletionModal = () => {
        const [file, setFile] = useState(null);
        const [preview, setPreview] = useState(null);
        const [submitting, setSubmitting] = useState(false);

        const handleFile = (e) => {
            if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
            }
        };

        const submit = async () => {
            setSubmitting(true);
            try {
                const fd = new FormData();
                fd.append('status', 'completed');
                if (file) fd.append('completionImage', file);

                const res = await appointmentAPI.updateAppointmentStatus(completionModal.id, fd);
                if (res.success) {
                    setAppointments(p => p.map(a => a.appointment_id === completionModal.id ? { ...a, status: 'completed' } : a));
                    setCompletionModal({ open: false, id: null });
                }
            } catch (err) {
                alert('Failed to complete job. ' + (err.response?.data?.message || ''));
            } finally {
                setSubmitting(false);
            }
        };

        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompletionModal({ open: false, id: null })} />
                <div className="relative bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-300">
                    <h3 className="text-xl font-bold text-white mb-2">Finalize Repair</h3>
                    <p className="text-sm text-slate-400 mb-6">Upload a photo of the completed or repaired device (optional).</p>
                    
                    <div className="space-y-6">
                        <div className="relative group">
                            <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${file ? 'border-sf-blue bg-blue-500/5' : 'border-white/10 bg-white/5 hover:border-sf-blue/50'}`}>
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="h-32 object-contain rounded-md" />
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                            <CheckCircle2 size={12} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                            <Upload size={20} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-white font-medium">Click to upload image</p>
                                            <p className="text-xs text-slate-500 mt-1">PNG or JPG up to 5MB</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={submit} disabled={submitting} className="flex-1 sf-btn-primary py-3 flex justify-center items-center">
                                {submitting ? 'Updating...' : 'Complete Appointment'}
                            </button>
                            <button onClick={() => setCompletionModal({ open: false, id: null })} className="flex-1 sf-btn bg-white/5 text-slate-300 hover:bg-white/10 border-none py-3">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap" style={{ maxWidth: 1040 }}>
                {/* Header */}
                <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                    <div>
                        <span className="sf-eyebrow">Service Queue</span>
                        <h1 className="sf-page-title">Shop Appointments</h1>
                        <p className="sf-page-sub">Manage and track all customer repair requests assigned to your shop.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
                        <XCircle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Filters and Search Area */}
                <div className="sf-anim-up sf-s1 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 md:p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by customer name or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="sf-input w-full pl-11 py-3"
                            />
                        </div>
                        {/* Date Pickers */}
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-500">From</span>
                                <input type="date" className="sf-input py-3 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-500">To</span>
                                <input type="date" className="sf-input py-3 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    {/* Status Tabs */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === f ? 'bg-sf-blue text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                {f.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Appointments List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="sf-spinner" style={{ width: 32, height: 32 }} />
                        <span className="text-sm font-semibold text-slate-500">Loading appointments...</span>
                    </div>
                ) : listFiltered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <Calendar size={48} className="text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No Appointments Found</h3>
                        <p className="text-sm text-slate-500 max-w-sm">There are no appointments matching your current search or filter criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sf-anim-up sf-s2">
                        {listFiltered.map(app => {
                            const styles = SF_STATUS_STYLES[app.status] || SF_STATUS_STYLES.pending;
                            const d = new Date(app.appointment_date);
                            const isActionable = !['cancelled', 'completed'].includes(app.status);

                            return (
                                <div key={app.appointment_id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 md:p-6 hover:bg-white/[0.04] transition-all group flex flex-col md:flex-row gap-6">
                                    {/* Date Column */}
                                    <div className="md:w-32 flex flex-col items-center justify-center py-4 px-2 bg-black/20 rounded-xl flex-shrink-0">
                                        <div className="text-sm font-bold text-sf-blue uppercase mb-1">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                                        <div className="text-4xl font-black text-white leading-none tracking-tighter mb-2">{d.getDate()}</div>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">
                                            <Clock size={12} />
                                            {app.appointment_time?.slice(0, 5)}
                                        </div>
                                    </div>
                                    
                                    {/* Details Column */}
                                    <div className="flex-1 flex flex-col justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                                <h3 className="text-xl font-bold text-white">{app.service_name}</h3>
                                                <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ backgroundColor: styles.bg, color: styles.color }}>
                                                    {styles.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                    <User size={14} className="text-slate-500" />
                                                    <span className="font-medium">{app.customer_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Phone size={14} className="text-slate-500" />
                                                    <span className="font-medium">{app.customer_phone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Smartphone size={14} className="text-slate-500" />
                                                    <span className="font-medium">{app.device_brand} {app.device_model}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions and Meta */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-lg">
                                                    Ref: <span className="text-slate-300 ml-1">{app.booking_reference}</span>
                                                </div>
                                                {app.issue_image_url && (
                                                    <button onClick={() => setPreviewImage(getImageUrl(app.issue_image_url))} className="flex items-center gap-1.5 text-xs font-semibold text-sf-blue hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg transition-colors">
                                                        <ImageIcon size={14} /> View Device Image
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            {isActionable && (
                                                <div className="flex items-center gap-2">
                                                    {app.status === 'pending' && (
                                                        <button disabled={processingId === app.appointment_id} onClick={() => updateStatus(app.appointment_id, 'confirmed')} className="sf-btn-primary py-1.5 px-4 text-xs">Acknowledge</button>
                                                    )}
                                                    {app.status === 'confirmed' && (
                                                        <button disabled={processingId === app.appointment_id} onClick={() => updateStatus(app.appointment_id, 'in_progress')} className="sf-btn bg-purple-500 hover:bg-purple-600 text-white border-none py-1.5 px-4 text-xs font-bold">Start Repair</button>
                                                    )}
                                                    {app.status === 'in_progress' && (
                                                        <button disabled={processingId === app.appointment_id} onClick={() => updateStatus(app.appointment_id, 'completed')} className="sf-btn bg-emerald-500 hover:bg-emerald-600 text-white border-none py-1.5 px-4 text-xs font-bold">Mark Completed</button>
                                                    )}
                                                    <button disabled={processingId === app.appointment_id} onClick={() => updateStatus(app.appointment_id, 'cancelled')} className="sf-btn bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 py-1.5 px-3 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center animate-in zoom-in duration-200">
                        <img src={previewImage} alt="Device Issue" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10" onClick={e => e.stopPropagation()} />
                        <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {completionModal.open && <CompletionModal />}
        </div>
    );
};

export default ShopAppointments;
