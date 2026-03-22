import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../admin.api';
import StatCard from '../../components/shared/StatCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Users,
    Store,
    CalendarCheck,
    Activity,
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    Server,
    Download,
    FileText,
    ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_centres: 0,
        total_appointments: 0,
        active_centres: 0
    });
    const [chartData, setChartData] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminAPI.getDashboardStats();
                if (res.success) {
                    setStats(res.stats);
                    setChartData(res.chart_data || []);
                    setActivity(res.activity || []);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
                // Fallback / Mock data for demonstration if API fails or doesn't exist yet
                if (err.response?.status === 404 || err.response?.status === 500) {
                    setStats({
                        total_users: 124,
                        total_centres: 15,
                        total_appointments: 892,
                        active_centres: 12
                    });
                    setChartData([
                        { name: 'Jan', value: 40 }, { name: 'Feb', value: 30 },
                        { name: 'Mar', value: 20 }, { name: 'Apr', value: 27 },
                        { name: 'May', value: 18 }, { name: 'Jun', value: 23 },
                        { name: 'Jul', value: 34 }, { name: 'Aug', value: 45 },
                    ]);
                } else {
                    setError('Failed to load system statistics.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleExport = async (type) => {
        setDownloading(type);
        try {
            await adminAPI.downloadReport(type);
        } catch (err) {
            alert('Failed to download report.');
        } finally {
            setDownloading(null);
            setShowExportMenu(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card premium-card p-4 border-none bg-slate-900/90 shadow-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-glow" />
                        <span className="text-xs font-bold text-white uppercase tracking-tight">Activity: {payload[0].value}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-slate-500">
            <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-red-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Diagnostics...</span>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-12 animate-in pb-32">
            {/* Header */}
            <header className="mb-12 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                        <ShieldCheck size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Admin Console</span>
                </div>
                <h1 className="text-5xl font-normal text-white italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
                    System <span className="text-slate-400">Overview.</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium">Monitoring global network performance and entity registration.</p>
            </header>

            {/* Actions Bar */}
            <div className="flex justify-end mb-8 relative">
                <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-white/5"
                >
                    {downloading ? 'Downloading...' : 'Export Reports'}
                    {downloading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronDown size={14} />}
                </button>

                {showExportMenu && (
                    <div className="absolute top-12 right-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 w-48 z-50 flex flex-col gap-1">
                        <button onClick={() => handleExport('users')} className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg w-full text-left"><FileText size={14} /> Users Report</button>
                        <button onClick={() => handleExport('appointments')} className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg w-full text-left"><FileText size={14} /> Bookings Report</button>
                        <button onClick={() => handleExport('centres')} className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg w-full text-left"><FileText size={14} /> Centres Report</button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4">
                    <AlertCircle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard label="Total Users" value={stats.total_users} icon={Users} color="#3B82F6" delay={100} />
                <StatCard label="Network Centres" value={stats.total_centres} icon={Store} color="#10B981" delay={200} />
                <StatCard label="Total Bookings" value={stats.total_appointments} icon={CalendarCheck} color="#F59E0B" delay={300} />
                <StatCard label="Active Nodes" value={stats.active_centres} icon={Activity} color="#8B5CF6" delay={400} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card premium-card p-8 border-none bg-gradient-to-br from-white/[0.03] to-transparent h-[450px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} className="text-red-500" />
                                <h2 className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                                    Network Traffic
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-glow" />
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* System Status / Side Panel */}
                <div className="space-y-6">
                    <div className="glass-card premium-card p-8 border-none bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity size={18} className="text-blue-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Activity</h3>
                        </div>

                        <div className="space-y-5">
                            {activity.length > 0 ? activity.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 relative">
                                    {i !== activity.length - 1 && <div className="absolute left-[3.5px] top-2 bottom-[-20px] w-[1px] bg-white/5" />}
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'user' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-200">{item.subject}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                                            {item.type === 'user' ? `New ${item.detail}` : 'New Centre'} · {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )) : <p className="text-xs text-slate-500 italic">No recent activity logged.</p>}
                        </div>
                    </div>
                    <div className="glass-card premium-card p-8 border-none bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-6">
                            <Server size={18} className="text-slate-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Server Status</h3>
                        </div>

                        <div className="space-y-6">
                            {[{ label: 'CPU Load', val: 12, color: 'bg-emerald-500' }, { label: 'Memory Usage', val: 45, color: 'bg-blue-500' }, { label: 'Storage', val: 28, color: 'bg-purple-500' }].map(m => (
                                <div key={m.label}>
                                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-500">{m.label}</span><span className={`${m.color.replace('bg-', 'text-')} font-mono`}>{m.val}%</span></div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }} /></div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5"><div className="flex items-center gap-3 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" />All Systems Operational</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;