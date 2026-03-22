import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { appointmentAPI } from '../../api/appointments.api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    CalendarCheck, CircleCheck, UserPlus,
    Wrench, Zap, RefreshCw, AlertCircle,
    Smartphone, Clock, User, ArrowUpRight,
    Store, ChevronRight
} from 'lucide-react';

const dashStyles = `
  .sd-wrap { animation: sf-fade-in 0.5s var(--sf-ease) both; }
  .sd-stagger > *:nth-child(1) { animation: sf-slide-up 0.6s 0.1s var(--sf-spring) both; }
  .sd-stagger > *:nth-child(2) { animation: sf-slide-up 0.6s 0.2s var(--sf-spring) both; }
  .sd-stagger > *:nth-child(3) { animation: sf-slide-up 0.6s 0.3s var(--sf-spring) both; }

  .sd-stat-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: var(--sf-text);
    transition: all 0.3s var(--sf-ease);
  }
  .sd-stat:hover .sd-stat-icon {
    background: var(--sf-grad-subtle);
    color: var(--sf-accent);
    border-color: rgba(255, 69, 0, 0.2);
    transform: scale(1.1) rotate(5deg);
  }

  .sd-action-primary {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 16px 28px; border-radius: 16px; border: none; cursor: pointer;
    font-size: 15px; font-weight: 700; color: #fff;
    background: var(--sf-grad);
    box-shadow: var(--sf-shadow-accent);
    transition: all 0.3s var(--sf-spring);
  }
  .sd-action-primary:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(255, 69, 0, 0.4); }

  .sd-action-secondary {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 16px 28px; border-radius: 16px; cursor: pointer;
    font-size: 15px; font-weight: 600; color: var(--sf-text-2);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--sf-border);
    transition: all 0.3s var(--sf-ease);
  }
  .sd-action-secondary:hover { background: rgba(255, 255, 255, 0.06); border-color: var(--sf-border-hover); color: var(--sf-white); }

  .sd-badge {
    padding: 6px 12px; border-radius: 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
    display: inline-block; border: 1px solid transparent;
    font-family: var(--font-mono);
  }
  .sd-badge-pending { background: rgba(245, 158, 11, 0.1); color: var(--sf-amber); border-color: rgba(245, 158, 11, 0.2); }
  .sd-badge-confirmed { background: rgba(59, 130, 246, 0.1); color: var(--sf-blue); border-color: rgba(59, 130, 246, 0.2); }
  .sd-badge-in_progress { background: rgba(167, 139, 250, 0.1); color: var(--sf-purple); border-color: rgba(167, 139, 250, 0.2); }
  .sd-badge-completed { background: rgba(16, 185, 129, 0.1); color: var(--sf-emerald); border-color: rgba(16, 185, 129, 0.2); }
  .sd-badge-cancelled { background: rgba(204, 34, 0, 0.1); color: var(--sf-red); border-color: rgba(204, 34, 0, 0.2); }

  .sd-status-select {
    width: 100%; background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--sf-border); border-radius: 12px;
    padding: 8px 12px; font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1px; color: var(--sf-text-2);
    outline: none; cursor: pointer; transition: all 0.3s var(--sf-ease);
  }
  .sd-status-select:focus { border-color: var(--sf-accent); color: var(--sf-white); box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1); }
`;

const StatusUpdater = ({ appointment, onUpdate, isUpdating }) => {
    const next = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['in_progress', 'completed', 'cancelled'],
        in_progress: ['completed', 'cancelled'],
    }[appointment.status] ?? [];

    if (!next.length) return <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Terminal State</span>;

    if (isUpdating) return <div className="sd-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />;

    return (
        <select
            defaultValue=""
            onChange={(e) => e.target.value && onUpdate(appointment.appointment_id, e.target.value)}
            className="sd-status-select"
        >
            <option value="" disabled>Update…</option>
            {next.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="sd-tooltip">
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6 }}>{label}</p>
                {payload.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
                        <span style={{ color: 'rgba(255,255,255,0.45)' }}>{entry.name}:</span>
                        <span style={{ color: '#fff', fontWeight: 700, marginLeft: 'auto' }}>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ShopDashboard = () => {
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const firstName = user?.name?.split(' ')[0] || 'Partner';

    const fetchData = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            const [statsRes, apptsRes] = await Promise.all([
                api.get(`/centres/my/reports?start_date=${start}&end_date=${end}`),
                appointmentAPI.getShopAppointments(),
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.reports);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const last12 = Array.from({ length: 12 }, (_, i) => {
                    const d = new Date(); d.setMonth(d.getMonth() - i);
                    return months[d.getMonth()];
                }).reverse();
                const cd = last12.map(m => ({ name: m, appointments: 0 }));
                (statsRes.data.reports.monthly_appointments ?? []).forEach(({ month, count }) => {
                    const idx = cd.findIndex(d => d.name === month);
                    if (idx !== -1) cd[idx].appointments = count;
                });
                setChartData(cd);
            }
            if (apptsRes.success) setAppointments(apptsRes.appointments ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!socket) return;
        const handleRefresh = () => fetchData(true);

        // Listen for new booking notifications to auto-refresh the dashboard
        const handleNewAppointment = () => {
            fetchData(true);
        };

        socket.on('refresh_data', handleRefresh);
        socket.on('receive_notification', handleNewAppointment);
        return () => {
            socket.off('refresh_data', handleRefresh);
            socket.off('receive_notification', handleNewAppointment);
        };
    }, [socket, fetchData]);

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const res = await appointmentAPI.updateAppointmentStatus(id, newStatus);
            if (res.success) {
                setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status: newStatus } : a));
                fetchData(true);
                addNotification(`Appointment marked as ${newStatus.replace('_', ' ')}`, 'success', { title: 'Update Successful' });
            }
        } catch { /* noop */ }
        finally { setUpdatingId(null); }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 12 }}>
            <div className="sd-spinner" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif' }}>Synchronizing Operations…</span>
        </div>
    );

    return (
        <>
            <style>{dashStyles}</style>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <main className="sd-wrap" style={{ width: '100%', maxWidth: 940, padding: '36px 40px' }}>

                    {/* Pending Node Alert */}
                    {user?.role === 'repairer' && user?.hasCentre === false && (
                        <div className="mb-10 p-6 glass-card border-none bg-gradient-to-r from-[rgba(255,69,0,0.15)] to-transparent flex items-center justify-between flex-wrap gap-6 animate-in">
                            <div className="flex gap-4 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,69,0,0.1)] text-[var(--sf-accent)] flex items-center justify-center shadow-lg shadow-[rgba(255,69,0,0.1)]">
                                    <Store size={26} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white font-serif italic">Incomplete Network Identity</h3>
                                    <p className="text-sm text-slate-400 max-w-xl">Your repair centre is not currently active on the global hardware network. Initialize your profile to begin receiving diagnostics.</p>
                                </div>
                            </div>
                            <button className="sd-action-primary" onClick={() => navigate('/shop/profile')}>
                                Complete Profile <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ── Header ── */}
                    <header className="mb-12 animate-in">
                        <div className="flex items-start justify-between flex-wrap gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[var(--sf-accent)] animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--sf-accent)] opacity-80">Partner Portal v2.0</p>
                                </div>
                                <h1 className="text-4xl font-normal text-white italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
                                    Welcome back, <span className="text-slate-400">{firstName}</span>
                                </h1>
                                <p className="text-sm text-slate-500 font-medium">
                                    Real-time throughput and diagnostic analytics for <span className="text-[var(--sf-accent)] font-bold">{user?.shop_name || 'SureFix Centre'}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-sm shadow-emerald-500/5">
                                <span className="sd-dot bg-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Operations Sync</span>
                            </div>
                        </div>
                    </header>

                    {/* ── Stats ── */}
                    <div className="sd-stagger grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="sd-stat glass-card p-6 relative overflow-hidden group border-none bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <div className="sd-stat-icon"><CalendarCheck size={20} /></div>
                                <span className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest">Operations</span>
                            </div>
                            <div className="relative z-10">
                                <div className="text-4xl font-normal text-white italic tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>{stats?.total_appointments ?? 0}</div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Total Assignments</div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <CalendarCheck size={120} strokeWidth={1} />
                            </div>
                        </div>

                        <div className="sd-stat glass-card p-6 relative overflow-hidden group border-none bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <div className="sd-stat-icon"><CircleCheck size={20} /></div>
                                <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest">Throughput</span>
                            </div>
                            <div className="relative z-10">
                                <div className="text-4xl font-normal text-white italic tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>{stats?.completed_appointments ?? 0}</div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Success Rate (Jobs)</div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <CircleCheck size={120} strokeWidth={1} />
                            </div>
                        </div>

                        <div className="sd-stat glass-card p-6 relative overflow-hidden group border-none bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <div className="sd-stat-icon"><UserPlus size={20} /></div>
                                <span className="text-[10px] font-black text-purple-500/70 uppercase tracking-widest">Network</span>
                            </div>
                            <div className="relative z-10">
                                <div className="text-4xl font-normal text-white italic tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>{stats?.new_customers ?? 0}</div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">New Node Connections</div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <UserPlus size={120} strokeWidth={1} />
                            </div>
                        </div>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="mb-12">
                        <p className="sd-section-label">Operational Commands</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="sd-action-primary group" onClick={() => navigate('/shop/appointments')}>
                                <Wrench size={22} className="group-hover:rotate-12 transition-transform" />
                                <span>Manage Operations Queue</span>
                            </button>
                            <button className="sd-action-secondary group" onClick={() => navigate('/shop/services')}>
                                <Store size={20} className="group-hover:scale-110 transition-transform" />
                                <span>Update Store Protocol</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Chart ── */}
                    <div className="glass-card p-6 mb-12 border-none bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="text-lg font-bold text-white font-serif italic mb-1">Monthly Activity Insight</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service load throughput over 12 months</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[rgba(255,69,0,0.1)] text-[var(--sf-accent)]">
                                <Zap size={18} />
                            </div>
                        </div>
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={32}>
                                    <defs>
                                        <linearGradient id="sdBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--sf-accent)" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="var(--sf-accent)" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} dy={12} fontFamily="var(--font-mono)" />
                                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} fontFamily="var(--font-mono)" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="appointments" fill="url(#sdBarGrad)" name="Appointments" radius={[4, 4, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Active Service Queue ── */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <p className="sd-section-label mb-0">Active Service Queue</p>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/40 border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--sf-accent)] animate-pulse" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Feed</span>
                            </div>
                        </div>
                        <div className="glass-card overflow-hidden border-none bg-white/[0.01]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ticket / UID</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware / Protocol</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time Node</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-40">Update</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {appointments.length > 0 ? appointments.slice(0, 8).map(app => (
                                            <tr key={app.appointment_id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-[13px] font-bold text-[var(--sf-accent)] mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{app.booking_reference}</div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <User size={10} />
                                                        <span className="text-[11px] font-semibold">{app.customer_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-white/[0.03] text-slate-500 flex items-center justify-center group-hover:text-[var(--sf-accent)] group-hover:bg-[rgba(255,69,0,0.1)] transition-colors">
                                                            <Smartphone size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-bold text-white mb-0.5">{app.device_model}</div>
                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{app.service_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-300 mb-1">
                                                        <Clock size={11} />
                                                        <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{app.appointment_time?.slice(0, 5)}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                        {new Date(app.appointment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`sd-badge sd-badge-${app.status}`}>
                                                        {app.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <StatusUpdater appointment={app} onUpdate={handleStatusUpdate} isUpdating={updatingId === app.appointment_id} />
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                                        <AlertCircle size={40} strokeWidth={1.5} />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue is currently idle</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ── Refresh ── */}
                    <div className="flex justify-center pb-8">
                        <button className="sd-refresh group" onClick={fetchData} disabled={loading}>
                            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                            Resync Matrix
                        </button>
                    </div>

                </main>
            </div>
        </>
    );
};

export default ShopDashboard;
