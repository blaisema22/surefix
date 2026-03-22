import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../admin.api';
import { Users, Store, Calendar, Activity, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Reusing the dashboard styling for consistency
const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .ad-wrap * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
  .ad-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 24px;
    display: flex; flex-direction: column; gap: 12px;
    transition: all 0.2s;
  }
  .ad-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  .ad-icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
  .ad-val { font-size: 36px; font-weight: 800; color: #fff; line-height: 1; letter-spacing: -1px; }
  .ad-lbl { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
  .ad-sub { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 4px; display: flex; gap: 10px; }
  .ad-sub span { display: flex; align-items: center; gap: 4px; }
  .ad-dot { width: 6px; height: 6px; border-radius: 50%; }
`;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: { total: 0, customers: 0, repairers: 0 },
        centres: { total: 0, visible: 0 },
        appointments: { total: 0, pending: 0, completed: 0 }
    });

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getDashboardStats();
            if (res.success) {
                setStats(res.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
                <RefreshCw className="animate-spin" size={24} />
            </div>
        );
    }

    return (
        <>
            <style>{dashStyles}</style>
            <div className="flex justify-center w-full">
                <main className="ad-wrap w-full max-w-5xl p-10">

                    {/* Header */}
                    <header className="flex justify-between items-end mb-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">System Overview</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {user?.name}</h1>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </header>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                        {/* Users Card */}
                        <div className="ad-card relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80"></div>
                            <div className="flex justify-between items-start">
                                <div className="ad-icon-box bg-blue-500/10 text-blue-400">
                                    <Users size={22} />
                                </div>
                            </div>
                            <div>
                                <div className="ad-val">{stats.users.total}</div>
                                <div className="ad-lbl">Total Users</div>
                            </div>
                            <div className="ad-sub">
                                <span className="text-cyan-200/60"><div className="ad-dot bg-cyan-400"></div> {stats.users.customers} Customers</span>
                                <span className="text-indigo-200/60"><div className="ad-dot bg-indigo-400"></div> {stats.users.repairers} Repairers</span>
                            </div>
                        </div>

                        {/* Repair Centres Card */}
                        <div className="ad-card relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80"></div>
                            <div className="flex justify-between items-start">
                                <div className="ad-icon-box bg-emerald-500/10 text-emerald-400">
                                    <Store size={22} />
                                </div>
                            </div>
                            <div>
                                <div className="ad-val">{stats.centres.total}</div>
                                <div className="ad-lbl">Repair Centres</div>
                            </div>
                            <div className="ad-sub">
                                <span className="text-emerald-200/60"><div className="ad-dot bg-emerald-400"></div> {stats.centres.visible} Active</span>
                                <span className="text-slate-400/60"><div className="ad-dot bg-slate-500"></div> {stats.centres.total - stats.centres.visible} Hidden</span>
                            </div>
                        </div>

                        {/* Appointments Card */}
                        <div className="ad-card relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-400 opacity-80"></div>
                            <div className="flex justify-between items-start">
                                <div className="ad-icon-box bg-orange-500/10 text-orange-400">
                                    <Activity size={22} />
                                </div>
                            </div>
                            <div>
                                <div className="ad-val">{stats.appointments.total}</div>
                                <div className="ad-lbl">Total Bookings</div>
                            </div>
                            <div className="ad-sub">
                                <span className="text-amber-200/60"><div className="ad-dot bg-amber-400"></div> {stats.appointments.pending} Pending</span>
                                <span className="text-green-200/60"><div className="ad-dot bg-green-500"></div> {stats.appointments.completed} Done</span>
                            </div>
                        </div>

                    </div>

                    {/* Quick Info / Placeholder for Charts */}
                    <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-slate-300 font-semibold">Detailed Analytics</h3>
                        <p className="text-slate-500 text-sm max-w-md">Detailed growth charts and revenue analytics will appear here as more data is collected by the system.</p>
                    </div>

                </main>
            </div>
        </>
    );
};

export default AdminDashboard;