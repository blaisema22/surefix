import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { shopAPI } from '../../api/shop.api';
import {
    Plus,
    Search,
    ChevronUp,
    ChevronDown,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    Layers,
    Save,
    X,
    Settings,
    DollarSign,
    ShieldCheck
} from 'lucide-react';

const DEVICE_CATEGORIES = ['smartphone', 'tablet', 'laptop', 'desktop', 'other'];

const ServiceForm = ({ service, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        service_name: '',
        description: '',
        device_category: 'smartphone',
        estimated_duration_minutes: '',
        base_price: '',
        is_available: true,
    });

    useEffect(() => {
        if (service) {
            setFormData({
                service_name: service.service_name || '',
                description: service.description || '',
                device_category: service.device_category || 'smartphone',
                estimated_duration_minutes: service.estimated_duration_minutes || '',
                base_price: service.base_price || '',
                is_available: service.is_available !== undefined ? service.is_available : true,
            });
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="glass-card premium-card p-12 border-none bg-gradient-to-br from-white/[0.03] to-transparent animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                    <Settings size={18} />
                </div>
                <h3 className="text-2xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                    {service ? 'Modify Service Protocol' : 'Initialize New Protocol'}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Protocol Designation</label>
                        <input
                            type="text"
                            name="service_name"
                            value={formData.service_name}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                            placeholder="e.g. Advanced Display Restoration"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Hardware Classification</label>
                        <select
                            name="device_category"
                            value={formData.device_category}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all appearance-none"
                        >
                            {DEVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Instructional Set</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl p-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all resize-none italic"
                        placeholder="Detailed technical overview of the service protocol…"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Calibration Time (Minutes)</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="number"
                                name="estimated_duration_minutes"
                                value={formData.estimated_duration_minutes}
                                onChange={handleChange}
                                className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                placeholder="60"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Base Price (RWF)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="number"
                                name="base_price"
                                value={formData.base_price}
                                onChange={handleChange}
                                className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                placeholder="15000"
                            />
                        </div>

                    </div>
                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_available"
                                checked={formData.is_available}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Active</span>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-14 px-8 rounded-xl bg-white/[0.05] text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.1] transition-all"
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 px-10 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-3"
                    >
                        {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save size={14} />}
                        {service ? 'Commit Changes' : 'Initialize Protocol'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingService, setEditingService] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderChanged, setOrderChanged] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const SERVICES_PER_PAGE = 8;

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await shopAPI.getMyServices();
            if (res.data.success) setServices(res.data.services || []);
        } catch (err) {
            setError('System synchronization failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleServicesUpdate = useCallback((newServices) => setServices(newServices), []);

    const filteredServices = useMemo(() =>
        !searchTerm ? services : services.filter(s => s.service_name.toLowerCase().includes(searchTerm.toLowerCase()))
        , [services, searchTerm]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
    const paginatedServices = useMemo(() => {
        if (filteredServices.length === 0) return [];
        const start = (currentPage - 1) * SERVICES_PER_PAGE;
        return filteredServices.slice(start, start + SERVICES_PER_PAGE);
    }, [filteredServices, currentPage]);

    const handleSave = async (formData) => {
        setActionLoading(true);
        setError('');
        try {
            if (editingService && editingService.service_id) {
                await shopAPI.updateService(editingService.service_id, formData);
            } else {
                await shopAPI.addService(formData);
            }
            setEditingService(null);
            setOrderChanged(false);
            await fetchServices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to committing protocol data.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm('Delete this service protocol? This action is irreversible.')) {
            try {
                await shopAPI.deleteService(serviceId);
                setOrderChanged(false);
                await fetchServices();
            } catch (err) {
                setError('Failed to purge protocol.');
            }
        }
    };

    const handleMove = (index, direction) => {
        const newServices = [...services];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newServices.length) return;
        [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
        handleServicesUpdate(newServices);
        setOrderChanged(true);
    };

    const handleSaveOrder = async () => {
        setActionLoading(true);
        setError('');
        try {
            const orderedIds = services.map(s => s.service_id);
            await shopAPI.updateServicesOrder(orderedIds);
            setOrderChanged(false);
        } catch (err) {
            setError('Failed to synchronize protocol order.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => { if (editingService) setOrderChanged(false); }, [editingService]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-slate-500">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Protocols...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 1040, padding: '36px 40px', paddingBottom: 100 }} className="animate-in">

            {/* Header */}
            <header className="mb-16 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Layers size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Service Architecture</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-normal text-white italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
                            Service <span className="text-slate-400">Protocols.</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Engineer and manage your hardware restoration catalog.</p>
                    </div>
                    {!editingService && (
                        <button
                            onClick={() => setEditingService(true)}
                            className="h-14 px-8 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                        >
                            <Plus size={14} /> Initialize Protocol
                        </button>
                    )}
                </div>
            </header>

            {/* Notifications & Interaction Banner */}
            <div className="space-y-4 mb-12">
                {orderChanged && !editingService && (
                    <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between animate-scale-in">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-blue-500" size={20} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Sequence Modified</span>
                        </div>
                        <button
                            onClick={handleSaveOrder}
                            disabled={actionLoading}
                            className="h-10 px-6 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                            {actionLoading ? 'Syncing...' : 'Synchronize New Order'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4 animate-shake">
                        <XCircle size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}
            </div>

            {/* Form Workspace */}
            {editingService && (
                <div className="mb-20">
                    <ServiceForm
                        service={editingService === true ? null : editingService}
                        onSave={handleSave}
                        onCancel={() => setEditingService(null)}
                        loading={actionLoading}
                    />
                </div>
            )}

            {/* Protocol Ledger */}
            <div className="glass-card premium-card border-none bg-white/[0.01] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-8">
                    <h2 className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Protocol Ledger</h2>
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Scan by protocol name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-xs text-white focus:border-blue-500/30 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Designation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Class</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Calibration</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Base Price</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Sequence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {paginatedServices.length > 0 ? paginatedServices.map((service, idx) => (
                                <tr key={service.service_id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>{service.service_name}</div>
                                        <div className="text-[10px] text-slate-500 font-medium truncate max-w-[240px] italic">{service.description}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 rounded bg-slate-900 border border-white/5">{service.device_category}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                            <Clock size={12} className="text-blue-500/50" />
                                            {service.estimated_duration_minutes}m
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                                            <DollarSign size={12} className="text-emerald-500/50" />
                                            {service.base_price ? `${Number(service.base_price).toLocaleString()} RWF` : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {service.is_available ? (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                Offline
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-1">
                                            <div className="flex flex-col mr-4 border-r border-white/10 pr-4">
                                                <button
                                                    onClick={() => handleMove(services.indexOf(service), -1)}
                                                    disabled={services.indexOf(service) === 0 || !!searchTerm}
                                                    className="p-1 text-slate-700 hover:text-white disabled:opacity-0 transition-all transform hover:scale-110"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleMove(services.indexOf(service), 1)}
                                                    disabled={services.indexOf(service) === services.length - 1 || !!searchTerm}
                                                    className="p-1 text-slate-700 hover:text-white disabled:opacity-0 transition-all transform hover:scale-110"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setEditingService(service)}
                                                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-white transition-all transform active:scale-90"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.service_id)}
                                                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all transform active:scale-90"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-700 font-medium">
                                            <Layers size={40} strokeWidth={1} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                                                {searchTerm ? `No sequences detected for "${searchTerm}"` : 'No protocol ledger entries found'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-8 border-t border-white/5 bg-white/[0.01]">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                        </span>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                                className="h-10 px-6 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white disabled:opacity-20 transition-all"
                            >
                                Previous Sector
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage === totalPages}
                                className="h-10 px-6 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white disabled:opacity-20 transition-all"
                            >
                                Next Sector
                            </button>
                        </div>
                    </div>
                )}
            </div>
            </main>
        </div>
    );
};

export default ManageServices;
