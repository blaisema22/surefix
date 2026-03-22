import React, { useState, useEffect } from 'react';
import { getAdminOverview, getAdminUsers, getAdminAppointments } from '../../api/admin.api';
import { Link } from 'react-router-dom';
import { 
    Users, Store, Calendar, CheckCircle, ArrowRight, 
    TrendingUp, Activity, Shield, Clock, Search
} from 'lucide-react';

const StatCard = ({ value, label, icon: Icon, color, delay }) => (
    <div className="glass-card p-6 border-none bg-white/[0.02] hover:bg-white/[0.04] shadow-xl group animate-slide-up" style={{ animationDelay: delay }}>
        <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner`} style={{ background: `${color}15`, color: color }}>
                <Icon size={28} strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-400/10">
                <TrendingUp size={12} /> +12.5%
            </div>
        </div>
        <h3 className="text-4xl font-normal text-white mb-2 tracking-tight italic" style={{ fontFamily: 'var(--font-serif)' }}>
            {value !== undefined ? value.toLocaleString() : '...'}
        </h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
            {label}
        </p>
    </div>
);

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const [overviewRes, usersRes, appointmentsRes] = await Promise.all([
                    getAdminOverview(),
                    getAdminUsers(),
                    getAdminAppointments()
                ]);

                if (overviewRes.success) setOverview(overviewRes.overview);
                if (usersRes.success) setRecentUsers(usersRes.users.slice(0, 5));
                if (appointmentsRes.success) setRecentAppointments(appointmentsRes.appointments.slice(0, 5));

            } catch (err) {
                setError('Failed to fetch dashboard data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Constructing Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="glass p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-center">
                    <Shield size={48} className="text-red-500/40 mx-auto mb-4" />
                    <p className="text-red-400 font-bold mb-2">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-secondary text-xs uppercase tracking-widest font-black">Retry Connection</button>
                </div>
            </div>
        );
    }

    return (
        <main className="page-content space-y-12 animate-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
                <div className="animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-0.5 h-4 bg-[var(--sf-accent)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--sf-accent)]">Global Oversight Terminal</span>
                    </div>
                    <h1 className="text-5xl font-normal text-white tracking-tight italic" style={{ fontFamily: 'var(--font-serif)' }}>
                        Command Centre
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Real-time node monitoring across the SureFix network.</p>
                </div>
                <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="glass-card px-6 py-3 border-none bg-white/[0.02] flex items-center gap-4 shadow-xl">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Status: Uplink Live</span>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    value={overview?.total_users} 
                    label="Active Nodes" 
                    icon={Users} 
                    color="var(--sf-accent)" 
                    delay="0.1s"
                />
                <StatCard 
                    value={overview?.total_centres} 
                    label="Repair Sectors" 
                    icon={Store} 
                    color="var(--sf-purple)" 
                    delay="0.2s"
                />
                <StatCard 
                    value={overview?.total_appointments} 
                    label="Network Logs" 
                    icon={Calendar} 
                    color="var(--sf-blue)" 
                    delay="0.3s"
                />
                <StatCard 
                    value={overview?.completed_appointments} 
                    label="Sync Protocols" 
                    icon={CheckCircle} 
                    color="var(--sf-emerald)" 
                    delay="0.4s"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <section className="glass-card rounded-[2.5rem] border-none bg-white/[0.01] overflow-hidden flex flex-col h-full animate-slide-up shadow-2xl" style={{ animationDelay: '0.5s' }}>
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--sf-accent)]/10 flex items-center justify-center text-[var(--sf-accent)] shadow-inner">
                                <Users size={20} />
                            </div>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-mono">Registry Update</h2>
                        </div>
                        <Link to="/admin/users" className="text-[10px] font-black text-[var(--sf-accent)] uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2 group/link bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
                            Full Sector <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {recentUsers.map((user, idx) => (
                            <div key={user.user_id} className="p-6 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all duration-500 group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-black text-white group-hover:bg-[var(--sf-accent)] group-hover:border-[var(--sf-accent)] transition-all duration-500 shadow-inner">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-white mb-0.5 group-hover:text-[var(--sf-accent)] transition-colors">{user.name}</div>
                                        <div className="text-[11px] text-slate-500 font-medium font-mono lowercase">{user.email}</div>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${
                                    user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                    user.role === 'repairer' ? 'bg-[var(--sf-accent)]/10 text-[var(--sf-accent)] border-[var(--sf-accent)]/20' :
                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Appointments */}
                <section className="glass-card rounded-[2.5rem] border-none bg-white/[0.01] overflow-hidden flex flex-col h-full animate-slide-up shadow-2xl" style={{ animationDelay: '0.6s' }}>
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-inner">
                                <Activity size={20} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-mono">Transmission Feed</h2>
                        </div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5 italic">Live Syncing</div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {recentAppointments.map((appt, idx) => (
                            <div key={appt.appointment_id} className="p-6 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all duration-500 group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                        <Clock size={20} strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[13px] font-bold text-white mb-0.5 truncate group-hover:text-purple-400 transition-colors uppercase tracking-tight">{appt.customer_name} </div>
                                        <div className="text-[11px] text-slate-500 font-medium truncate font-serif italic">Relaying via {appt.centre_name}</div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-[11px] font-black text-white font-mono">{new Date(appt.appointment_date).toLocaleDateString()}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 bg-white/[0.05] px-2 py-0.5 rounded shadow-sm">{appt.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}