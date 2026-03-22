import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '@/api/appointments.api';
import ConfirmModal from '@/components/shared/ConfirmModal';
import ReviewModal from '@/components/customer/ReviewModal';
import { Search, MapPin, Clock, Star, CalendarPlus, Calendar } from 'lucide-react';
import '../../styles/sf-pages.css';

const STATUS_CONFIG = {
    pending: { label: 'Pending', cls: 'sf-badge-pending' },
    confirmed: { label: 'Confirmed', cls: 'sf-badge-confirmed' },
    in_progress: { label: 'In Progress', cls: 'sf-badge-progress' },
    completed: { label: 'Completed', cls: 'sf-badge-completed' },
    cancelled: { label: 'Cancelled', cls: 'sf-badge-cancelled' },
};

const StatusBadge = ({ status }) => {
    const c = STATUS_CONFIG[status] ?? { label: status, cls: 'sf-badge-completed' };
    return <span className={`sf-badge ${c.cls}`}>{c.label}</span>;
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const AppointmentsPage = ({ historyOnly = false }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(historyOnly ? 'completed' : 'all');
    const [cancelId, setCancelId] = useState(null);
    const [reviewAppt, setReviewAppt] = useState(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 6;

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await appointmentAPI.getAppointments();
            if (res.success) setAppointments(res.appointments || []);
            else setError('Failed to load appointments.');
        } catch { setError('Failed to load appointments.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);
    useEffect(() => { setPage(1); }, [statusFilter, search]);

    const confirmCancel = async () => {
        if (!cancelId) return;
        try {
            const res = await appointmentAPI.cancelAppointment(cancelId);
            if (res.success) setAppointments(p => p.map(a => a.appointment_id === cancelId ? { ...a, status: 'cancelled' } : a));
        } catch { alert('Failed to cancel.'); }
        finally { setCancelId(null); }
    };

    const filtered = useMemo(() => {
        return appointments.filter(a => {
            const byStatus = statusFilter === 'all' || a.status === statusFilter;
            const q = search.toLowerCase();
            const bySearch = !q || [a.booking_reference, a.centre_name, a.device_model, a.service_name].some(v => v?.toLowerCase().includes(q));
            return byStatus && bySearch;
        }).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    }, [appointments, statusFilter, search]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">

                {/* Header */}
                <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                    <div>
                        <span className="sf-eyebrow">{historyOnly ? 'Repair History' : 'Appointments'}</span>
                        <h1 className="sf-page-title">{historyOnly ? 'My History' : 'My Appointments'}</h1>
                        <p className="sf-page-sub">View and manage all your repair bookings.</p>
                    </div>
                    {!historyOnly && (
                        <Link to="/find-repair" className="sf-btn-primary" style={{ textDecoration: 'none' }}>
                            <CalendarPlus size={15} /> Book Repair
                        </Link>
                    )}
                </div>

                {/* Search */}
                <div className="sf-search-wrap sf-anim-up sf-s1">
                    <Search size={16} className="sf-search-icon" />
                    <input className="sf-search-input" placeholder="Search service, centre, device…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Filters */}
                {!historyOnly && (
                    <div className="sf-filter-bar sf-anim-up sf-s1">
                        {FILTERS.map(f => (
                            <button key={f.key} className={`sf-filter-btn ${statusFilter === f.key ? 'active' : ''}`} onClick={() => setStatusFilter(f.key)}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => <div key={i} className="sf-skeleton" style={{ height: 84 }} />)}
                    </div>
                ) : error ? (
                    <div className="sf-error">{error}</div>
                ) : paginated.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {paginated.map((app, i) => {
                            const d = new Date(app.appointment_date);
                            const month = d.toLocaleString('default', { month: 'short' });
                            const day = d.getDate();
                            const time = (app.appointment_time || '').slice(0, 5);

                            return (
                                <div key={app.appointment_id} className={`sf-appt-row sf-anim-up sf-s${Math.min(i + 1, 6)}`}>
                                    {/* Date block */}
                                    <div className="sf-date-block">
                                        <div className="sf-date-month">{month}</div>
                                        <div className="sf-date-day">{day}</div>
                                        <div className="sf-date-time">{time}</div>
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{app.service_name}</span>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                                                <MapPin size={11} /> {app.centre_name}
                                            </span>
                                            {app.device_model && (
                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{app.device_brand} {app.device_model}</span>
                                            )}
                                            {app.booking_reference && (
                                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.15)' }}>#{app.booking_reference}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                                        {['pending', 'confirmed'].includes(app.status) && (
                                            <button className="sf-btn-danger" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setCancelId(app.appointment_id)}>
                                                Cancel
                                            </button>
                                        )}
                                        {app.status === 'completed' && !app.my_rating && (
                                            <button className="sf-btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setReviewAppt(app)}>
                                                <Star size={12} /> Rate
                                            </button>
                                        )}
                                        {app.status === 'completed' && app.my_rating && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'rgba(249,115,22,0.75)', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', padding: '4px 10px', borderRadius: 20 }}>
                                                <Star size={10} fill="currentColor" /> {app.my_rating}.0
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="sf-empty sf-anim-up">
                        <div className="sf-empty-icon"><Calendar size={22} /></div>
                        <div className="sf-empty-title">No appointments found</div>
                        <p className="sf-empty-sub">You don't have any bookings matching this filter.</p>
                        {!historyOnly && (
                            <Link to="/find-repair" className="sf-btn-primary" style={{ textDecoration: 'none' }}>
                                <CalendarPlus size={14} /> Book a Repair
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.2)' }}>
                            Page {page} of {totalPages} · {filtered.length} results
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="sf-pag-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                            <button className="sf-pag-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                        </div>
                    </div>
                )}

            </div>

            <ConfirmModal open={!!cancelId} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" onConfirm={confirmCancel} onCancel={() => setCancelId(null)} danger />
            <ReviewModal isOpen={!!reviewAppt} onClose={() => setReviewAppt(null)} appointment={reviewAppt || {}} onSuccess={fetch} />
        </div>
    );
};

export default AppointmentsPage;