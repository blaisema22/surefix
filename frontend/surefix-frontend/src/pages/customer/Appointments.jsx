import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '@/api/appointments.api';
import { Star, Filter, Search, ChevronLeft, ChevronRight, ChevronDown, Wrench, Store, CalendarPlus, Calendar } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Pending', classes: 'badge-pending' },
    confirmed: { label: 'Confirmed', classes: 'badge-confirmed' },
    in_progress: { label: 'In Progress', classes: 'badge-progress' },
    completed: { label: 'Completed', classes: 'badge-completed' },
    cancelled: { label: 'Cancelled', classes: 'badge-cancelled' },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] ?? { label: status, classes: 'badge-completed' };
    return (
        <span className={`badge ${config.classes}`}>
            {config.label.replace('_', ' ')}
        </span>
    );
};

export default function CustomerAppointments({ historyOnly = false, onRate }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await appointmentAPI.getAppointments();
                if (res.success) {
                    let data = res.appointments || [];
                    if (historyOnly) {
                        data = data.filter(a => ['completed', 'cancelled'].includes(a.status));
                    }
                    setAppointments(data);
                } else {
                    setError('Failed to load appointments.');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred loading appointments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [historyOnly]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm]);

    // Sorting and Filtering
    const filteredAppointments = appointments
        .filter(app => statusFilter === 'all' || app.status === statusFilter)
        .filter(app => !searchTerm || app.service_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const dateA = new Date(a.appointment_date);
            const dateB = new Date(b.appointment_date);
            if (dateB.getTime() !== dateA.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            return (b.appointment_time || '').localeCompare(a.appointment_time || '');
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading appointments...</div>;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
    if (appointments.length === 0) return <div className="p-8 text-center text-slate-500">No {historyOnly ? 'history' : 'appointments'} found.</div>;

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 animate-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 block mb-1">Service Queue</span>
                    <h1 className="text-5xl font-normal text-white italic tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>My Bookings</h1>
                    <p className="text-slate-500 text-sm font-medium">Track and manage your professional hardware diagnostic cycles.</p>
                </div>
                <Link to="/booking" className="btn btn-primary !rounded-2xl h-14 px-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 no-underline">
                    <CalendarPlus size={16} strokeWidth={2.5} />
                    New Request
                </Link>
            </header>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search service references..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:ring-2 ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none focus:ring-2 ring-blue-500/20 cursor-pointer hover:bg-white/[0.05] transition-all min-w-[160px]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List Content */}
            {paginatedAppointments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {paginatedAppointments.map((apt, index) => (
                        <div 
                            key={apt.booking_id} 
                            className="glass-card premium-card p-8 group transition-all duration-500 animate-slide-up hover:border-blue-500/20"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-start gap-6 flex-1">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-blue-400 group-hover:rotate-[10deg] group-hover:scale-110 transition-all shadow-xl">
                                        <Wrench size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                                                {apt.service_name || 'Premium Diagnosis'}
                                            </h3>
                                            <StatusBadge status={apt.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-2">
                                                <Store size={12} className="text-slate-700" />
                                                {apt.centre_name}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-700" />
                                                {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-2 text-slate-700 font-black">
                                                REF: {apt.booking_reference}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {apt.status === 'completed' && !apt.my_rating && onRate && (
                                        <button
                                            onClick={() => onRate(apt.appointment_id)}
                                            className="btn btn-primary !rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Rate Repair
                                        </button>
                                    )}
                                    <button className="btn bg-white/5 border border-white/10 !rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card premium-card !rounded-[3rem] p-24 text-center flex flex-col items-center justify-center border-dashed border-white/5 opacity-80">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                        <Calendar size={32} className="text-slate-800" />
                    </div>
                    <div className="max-w-md space-y-4">
                        <h2 className="text-2xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Timeline empty</h2>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed px-10">No bookings match your current criteria. Adjust filters or connect with a center.</p>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Viewing Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-20"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-20"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}