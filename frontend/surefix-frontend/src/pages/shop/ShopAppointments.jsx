import React, { useState, useEffect, useCallback } from 'react';
import { appointmentAPI } from '../../api/appointments.api';
import {
    Calendar,
    Clock,
    User,
    Smartphone,
    Hash,
    Search,
    RotateCcw,
    X,
    CheckCircle2,
    Play,
    XCircle,
    MoreVertical,
    Filter,
    ArrowRight,
    Terminal,
    ChevronRight,
    ClipboardList,
    LayoutGrid,
    List,
    Image as ImageIcon,
    Upload
} from 'lucide-react';

const getStatusStyles = (status) => {
    const map = {
        pending: { bg: 'bg-[rgba(255,69,0,0.1)]', text: 'text-[var(--sf-accent)]', icon: <Terminal size={12} />, label: 'AWAITING NODE' },
        confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: <Hash size={12} />, label: 'SYNCED' },
        in_progress: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: <Play size={12} />, label: 'PROCESSING' },
        completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: <CheckCircle2 size={12} />, label: 'FINALIZED' },
        cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', icon: <XCircle size={12} />, label: 'TERMINATED' },
    };
    return map[status] ?? map.pending;
};

const FILTERS = ['active', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'all'];

const ShopAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('active');
    const [viewMode, setViewMode] = useState('list');
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [completionModal, setCompletionModal] = useState({ open: false, id: null });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await appointmentAPI.getShopAppointments();
            if (res.success) setAppointments(res.appointments ?? []);
            else setError('System synchronization failed.');
        } catch (err) {
            setError(err.response?.data?.message ?? 'A protocol error occurred.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const updateStatus = async (id, status) => {
        if (status === 'completed') {
            setCompletionModal({ open: true, id });
            return;
        }

        if (!window.confirm(`Execute status transition to: ${status.toUpperCase()}?`)) return;
        setProcessingId(id);
        try {
            const res = await appointmentAPI.updateAppointmentStatus(id, status);
            if (res.success) setAppointments(p => p.map(a => a.appointment_id === id ? { ...a, status: status } : a));
        } catch (err) {
            alert(err.response?.data?.message ?? 'Operation failed.');
        } finally { setProcessingId(null); }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    const baseFiltered = appointments
        .filter(a => {
            if (!searchTerm.trim()) return true;
            return a.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
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

    const kanbanColumns = [
        {
            id: 'pending',
            title: 'Pending',
            items: baseFiltered.filter(a => ['pending', 'confirmed'].includes(a.status)),
            color: 'border-amber-500/50'
        },
        {
            id: 'in_progress',
            title: 'In Progress',
            items: baseFiltered.filter(a => a.status === 'in_progress'),
            color: 'border-purple-500/50'
        },
        {
            id: 'completed',
            title: 'Completed',
            items: baseFiltered.filter(a => a.status === 'completed'),
            color: 'border-emerald-500/50'
        }
    ];

    const KanbanCard = ({ app }) => {
        const styles = getStatusStyles(app.status);
        return (
            <div className="glass-card p-5 mb-4 border-none bg-white/[0.02] shadow-xl group hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                            {app.booking_reference}
                        </div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                            {new Date(app.appointment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} • {app.appointment_time?.slice(0, 5)}
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 ${styles.bg} ${styles.text} flex items-center gap-1.5 shadow-inner`}>
                        {styles.icon}
                        {styles.label}
                    </div>
                </div>
                
                <h4 className="font-normal text-white text-base mb-1 italic leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                    {app.service_name}
                </h4>
                
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[var(--sf-accent)] transition-colors">
                        <Smartphone size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{app.device_model}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium"><User size={10} /> {app.customer_name}</span>
                    </div>
                </div>

                {app.issue_image_url && (
                    <button onClick={() => setPreviewImage(getImageUrl(app.issue_image_url))} className="w-full mb-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                        <ImageIcon size={12} /> View Hardware State
                    </button>
                )}

                <div className="flex gap-2 mt-auto pt-4 border-t border-white/[0.03]">
                    {app.status === 'pending' && (
                        <button onClick={() => updateStatus(app.appointment_id, 'confirmed')} className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all border border-blue-500/10">Confirm Node</button>
                    )}
                    {app.status === 'confirmed' && (
                        <button onClick={() => updateStatus(app.appointment_id, 'in_progress')} className="flex-1 py-2 rounded-xl bg-[rgba(255,69,0,0.1)] text-[var(--sf-accent)] text-[10px] font-black uppercase tracking-widest hover:bg-[rgba(255,69,0,0.2)] transition-all border border-[rgba(255,69,0,0.1)]">Initialize Job</button>
                    )}
                    {app.status === 'in_progress' && (
                        <button onClick={() => updateStatus(app.appointment_id, 'completed')} className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/10">Finalize Protocol</button>
                    )}
                    {!['completed', 'cancelled'].includes(app.status) && (
                        <button onClick={() => updateStatus(app.appointment_id, 'cancelled')} className="px-3 py-2 rounded-xl bg-white/[0.03] text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"><X size={15} /></button>
                    )}
                </div>
            </div>
        );
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
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setCompletionModal({ open: false, id: null })} />
                <div className="relative glass-card bg-slate-900 border-none w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div>
                            <h3 className="text-2xl font-normal text-white italic" style={{ fontFamily: 'var(--font-serif)' }}>Finalize Protocol</h3>
                            <p className="text-[10px] font-black text-[var(--sf-accent)] uppercase tracking-widest mt-1">Transaction Validation</p>
                        </div>
                        <button onClick={() => setCompletionModal({ open: false, id: null })} className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-white transition-all"><X size={20} /></button>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <ImageIcon size={12} /> Hardware Completion State
                            </label>
                            <div className="relative group">
                                <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02] group-hover:border-[var(--sf-accent)]/30 group-hover:bg-white/[0.04]'}`}>
                                    {preview ? (
                                        <div className="relative">
                                            <img src={preview} alt="Preview" className="h-40 object-contain rounded-2xl shadow-2xl border border-white/10" />
                                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-500 group-hover:text-[var(--sf-accent)] group-hover:scale-110 transition-all duration-500 shadow-inner">
                                                <Upload size={24} strokeWidth={1.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-white font-bold mb-1">Click or drag hardware visual</p>
                                                <p className="text-[10px] text-slate-600 font-medium">PNG, JPG up to 10MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setCompletionModal({ open: false, id: null })} className="flex-1 py-4 rounded-2xl border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">Abort</button>
                            <button onClick={submit} disabled={submitting} className="flex-1 py-4 rounded-2xl bg-[var(--sf-accent)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-[rgba(255,69,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting ? 'Syncing...' : 'Finalize Job'}
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 1040, padding: '36px 40px', paddingBottom: 100 }} className="animate-in">

                {/* Header */}
                <header className="mb-16 space-y-8 animate-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(255,69,0,0.1)] flex items-center justify-center text-[var(--sf-accent)] shadow-lg shadow-[rgba(255,69,0,0.1)] border border-[rgba(255,69,0,0.1)]">
                            <Terminal size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--sf-accent)] opacity-80 leading-none mb-1">Service Queue Monitor</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">Global Network Syncing</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-normal text-white italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
                                Operational <span className="text-slate-400">Queue.</span>
                            </h1>
                            <p className="text-slate-500 text-sm font-medium border-l-2 border-[var(--sf-accent)] pl-4">Real-time terminal for hardware restoration management.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-4 glass-card border-none bg-white/[0.03] px-5 py-3 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Start</span>
                                    <input type="date" className="bg-transparent text-[11px] font-bold text-slate-300 outline-none hover:text-white transition-colors cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="w-px h-6 bg-white/5" />
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">End</span>
                                    <input type="date" className="bg-transparent text-[11px] font-bold text-slate-300 outline-none hover:text-white transition-colors cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="relative group w-full sm:w-72">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[var(--sf-accent)] transition-all duration-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by customer node..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full glass-card bg-white/[0.02] border-none py-3.5 pl-14 pr-6 text-xs text-white placeholder:text-slate-700 focus:bg-white/[0.05] outline-none transition-all duration-300"
                                />
                            </div>

                            <button onClick={fetch} className="w-12 h-12 rounded-2xl glass-card bg-white/[0.03] border-none flex items-center justify-center text-slate-500 hover:text-[var(--sf-accent)] hover:bg-white/[0.08] transition-all active:scale-95 group">
                                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                            </button>

                            <div className="flex glass-card bg-white/[0.02] border-none p-1.5 shadow-inner">
                                <button onClick={() => setViewMode('list')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                                    <List size={20} />
                                </button>
                                <button onClick={() => setViewMode('board')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'board' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                                    <LayoutGrid size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4 animate-shake">
                        <XCircle size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                {/* Status Navigation */}
                {viewMode === 'list' && (
                    <nav className="flex flex-wrap gap-2 mb-12">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`group relative h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === f ? 'bg-[var(--sf-accent)] text-white shadow-xl shadow-[rgba(255,69,0,0.3)]' : 'glass-card bg-white/[0.02] border-none text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]'}`}
                            >
                                {f === 'in_progress' ? 'Processing' : f === 'active' ? 'Deployment' : f}
                                {filter === f && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white animate-ping" />}
                            </button>
                        ))}
                    </nav>
                )}

                {/* Queue List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-slate-500">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Retrieving Queue Data...</span>
                    </div>
                ) : viewMode === 'board' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {kanbanColumns.map(col => (
                            <div key={col.id} className="flex flex-col h-full animate-in">
                                <div className={`flex items-center justify-between mb-6 pb-4 border-b-2 ${col.color.replace('/50', '/20')} relative`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${col.id === 'pending' ? 'bg-[var(--sf-accent)]' : col.id === 'in_progress' ? 'bg-purple-500' : 'bg-emerald-500'} animate-pulse`} />
                                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-mono">{col.title}</h3>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">{col.items.length}</span>
                                </div>
                                <div className="flex-1 glass-card bg-white/[0.01] rounded-3xl p-5 border-none min-h-[500px] shadow-inner">
                                    {col.items.map(app => <KanbanCard key={app.appointment_id} app={app} />)}
                                    {col.items.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
                                            <Terminal size={32} strokeWidth={1} />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-center">No active nodes in this sector</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : listFiltered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-8 glass-card border-none bg-white/[0.01]">
                        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-slate-800">
                            <ClipboardList size={40} strokeWidth={1} />
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>No Active Assignments Detected</div>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Awaiting new service requests from the network.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {listFiltered.map(app => {
                            const styles = getStatusStyles(app.status);
                            const isActionable = !['cancelled', 'completed'].includes(app.status);

                            return (
                                <div key={app.appointment_id} className="glass-card border-none bg-gradient-to-r from-white/[0.03] to-transparent p-0 overflow-hidden group hover:from-white/[0.05] transition-all duration-500 shadow-2xl">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Date Column */}
                                        <div className="w-full lg:w-44 flex lg:flex-col items-center justify-center p-10 bg-white/[0.02] border-r border-white/5 text-center gap-4 lg:gap-3">
                                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)' }}>{new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                                            <div className="text-5xl font-normal text-white italic leading-none" style={{ fontFamily: 'var(--font-serif)' }}>{new Date(app.appointment_date).getDate()}</div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--sf-accent)] uppercase tracking-widest opacity-80">
                                                <Clock size={11} />
                                                {app.appointment_time?.slice(0, 5)}
                                            </div>
                                        </div>

                                        {/* Details Column */}
                                        <div className="flex-1 p-10 space-y-8">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                                                <div className="space-y-5">
                                                    <div className="flex flex-wrap items-center gap-5">
                                                        <h3 className="text-3xl font-normal text-white italic tracking-tight group-hover:text-[var(--sf-accent)] transition-colors duration-500" style={{ fontFamily: 'var(--font-serif)' }}>{app.service_name}</h3>
                                                        <div className={`px-4 py-1.5 rounded-xl ${styles.bg} ${styles.text} flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest border border-white/5 shadow-inner`}>
                                                            {styles.icon}
                                                            {styles.label}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                                        <div className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-400">
                                                            <User size={15} className="text-slate-700" />
                                                            {app.customer_name}
                                                        </div>
                                                        <div className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-400">
                                                            <Smartphone size={15} className="text-slate-700" />
                                                            {app.device_brand} {app.device_model}
                                                        </div>
                                                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600" style={{ fontFamily: 'var(--font-mono)' }}>
                                                            <Hash size={14} className="text-slate-800" />
                                                            {app.booking_reference}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isActionable && (
                                                    <div className="flex flex-wrap gap-3">
                                                        {app.status === 'pending' && (
                                                            <button
                                                                onClick={() => updateStatus(app.appointment_id, 'confirmed')}
                                                                disabled={processingId === app.appointment_id}
                                                                className="h-11 px-8 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
                                                            >
                                                                Confirm Node
                                                            </button>
                                                        )}
                                                        {app.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => updateStatus(app.appointment_id, 'in_progress')}
                                                                disabled={processingId === app.appointment_id}
                                                                className="h-11 px-8 rounded-2xl bg-[var(--sf-accent)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-xl shadow-[rgba(255,69,0,0.2)] active:scale-95"
                                                            >
                                                                Initialize Repair
                                                            </button>
                                                        )}
                                                        {app.status === 'in_progress' && (
                                                            <button
                                                                onClick={() => updateStatus(app.appointment_id, 'completed')}
                                                                disabled={processingId === app.appointment_id}
                                                                className="h-11 px-8 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
                                                            >
                                                                Finalize Job
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => updateStatus(app.appointment_id, 'cancelled')}
                                                            disabled={processingId === app.appointment_id}
                                                            className="h-11 w-11 rounded-2xl glass-card bg-white/[0.03] border-none flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {app.notes && (
                                                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 italic text-[13px] text-slate-500 leading-relaxed relative overflow-hidden group/note shadow-inner">
                                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-[var(--sf-accent)] opacity-20" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 block mb-2">Customer Diagnostics Note</span>
                                                    "{app.notes}"
                                                </div>
                                            )}

                                            {app.issue_image_url && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setPreviewImage(getImageUrl(app.issue_image_url)); }}
                                                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.08] hover:text-white transition-all w-fit group/img"
                                                >
                                                    <ImageIcon size={15} className="group-hover:scale-110 transition-transform" />
                                                    Explore Hardware Image
                                                </button>
                                            )}
                                        </div>

                                        {/* Quick Link/Arrow */}
                                        <div className="p-6 flex items-center justify-center lg:border-l border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <ChevronRight size={24} className="text-slate-800 group-hover:translate-x-1 group-hover:text-[var(--sf-accent)] transition-all" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
                        <img src={previewImage} alt="Device Issue" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10" onClick={e => e.stopPropagation()} />
                        <p className="text-slate-400 text-xs mt-4 font-medium uppercase tracking-widest">Click anywhere to close</p>
                    </div>
                </div>
            )}

            {completionModal.open && <CompletionModal />}
        </div>
    );
};

export default ShopAppointments;
