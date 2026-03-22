import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { appointmentAPI } from '../../api/appointments.api';
import { deviceAPI } from '../../api/devices.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/shared/StatCard';
import ActiveRepairs from '../../components/customer/ActiveRepairs';
import { useAuth } from '../../context/AuthContext';
import { Wrench, CheckCircle2, Smartphone, Zap, Monitor, RefreshCw, AlertCircle, CalendarPlus } from 'lucide-react';

const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  .cd-wrap * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  /* Fade-up animation */
  @keyframes cd-fadeup {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cd-wrap { animation: cd-fadeup 0.45s ease both; }

  /* Stagger children */
  .cd-stagger > *:nth-child(1) { animation: cd-fadeup 0.4s 0.05s ease both; }
  .cd-stagger > *:nth-child(2) { animation: cd-fadeup 0.4s 0.12s ease both; }
  .cd-stagger > *:nth-child(3) { animation: cd-fadeup 0.4s 0.19s ease both; }
  .cd-stagger > *:nth-child(4) { animation: cd-fadeup 0.4s 0.26s ease both; }

  /* Stat card */
  .cd-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .cd-stat:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.13);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  }
  .cd-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 18px 18px 0 0;
  }
  .cd-stat-blue::before  { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
  .cd-stat-green::before { background: linear-gradient(90deg, #22c55e, #4ade80); }
  .cd-stat-cyan::before  { background: linear-gradient(90deg, #06b6d4, #22d3ee); }

  .cd-stat-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .cd-stat-icon-blue  { background: rgba(255,69,0,0.1); color: var(--sf-accent); }
  .cd-stat-icon-green { background: rgba(34,197,94,0.1);  color: #4ade80; }
  .cd-stat-icon-cyan  { background: rgba(147,51,234,0.1);  color: #a855f7; }

  .cd-stat-value {
    font-size: 36px; font-weight: 800; color: #fff; line-height: 1;
    letter-spacing: -1px;
  }
  .cd-stat-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-top: 2px;
  }

  /* Action buttons */
  .cd-action-primary {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 18px 24px; border-radius: 20px; border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 800;
    color: #fff; text-transform: uppercase; letter-spacing: 0.15em;
    background: linear-gradient(135deg, var(--sf-accent) 0%, #cc2200 100%);
    box-shadow: 0 8px 32px rgba(255,69,0,0.2);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative; overflow: hidden;
  }
  .cd-action-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  .cd-action-primary:hover { 
    transform: translateY(-3px) scale(1.02); 
    box-shadow: 0 12px 40px rgba(255,69,0,0.3); 
  }
  .cd-action-primary:hover::after { transform: translateX(100%); }

  .cd-action-secondary {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 18px 24px; border-radius: 20px; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 800;
    color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.15em;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cd-action-secondary:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.1);
    color: #fff;
    transform: translateY(-3px) scale(1.02);
  }

  /* Chart card */
  .cd-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
  }
  .cd-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 0;
  }
  .cd-card-title {
    font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85);
    letter-spacing: -0.2px;
  }
  .cd-card-sub {
    font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 2px;
  }
  .cd-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; display:inline-block;
    box-shadow: 0 0 8px rgba(34,197,94,0.6); animation: cd-pulse 2s infinite; }
  @keyframes cd-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* Tooltip */
  .cd-tooltip {
    background: #0d1424;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px 16px;
    font-family: 'Outfit', sans-serif;
  }

  /* Refresh btn */
  .cd-refresh {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.3);
    cursor: pointer; transition: all 0.2s;
  }
  .cd-refresh:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.6);
  }
  .cd-refresh:disabled { opacity: 0.3; cursor: not-allowed; }

  .cd-spinner {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.05);
    border-top-color: var(--sf-accent);
    animation: cd-spin 0.6s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
  }
  @keyframes cd-spin { to { transform: rotate(360deg); } }

  /* Section heading */
  .cd-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
    margin-bottom: 14px;
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="cd-tooltip">
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

const CustomerDashboard = () => {
    const [stats, setStats] = useState({ active: 0, completed: 0, devices: 0 });
    const [activeRepairs, setActiveRepairs] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuth();

    const firstName = user?.name?.split(' ')[0] || 'there';

    const statusColors = {
        pending: 'badge-pending',
        confirmed: 'badge-confirmed',
        in_progress: 'badge-progress',
        completed: 'badge-completed',
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [appointmentsRes, devicesRes] = await Promise.all([
                appointmentAPI.getMyCustomerAppointments(),
                deviceAPI.getMyDevices(),
            ]);
            if (appointmentsRes.success) {
                const appointments = appointmentsRes.appointments || [];
                const active = appointments.filter(a => ['pending', 'confirmed', 'in_progress'].includes(a.status));
                const completed = appointments.filter(a => a.status === 'completed');
                setStats(prev => ({ ...prev, active: active.length, completed: completed.length }));
                setActiveRepairs(active.slice(0, 5).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const data = [];
                for (let i = 11; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    data.push({ name: `${monthNames[d.getMonth()]}`, year: d.getFullYear(), month: d.getMonth(), appointments: 0 });
                }
                appointments.forEach(app => {
                    const appDate = new Date(app.appointment_date);
                    const monthData = data.find(d => d.year === appDate.getFullYear() && d.month === appDate.getMonth());
                    if (monthData) monthData.appointments++;
                });
                setChartData(data);
            }
            if (devicesRes.data?.success) {
                setStats(prev => ({ ...prev, devices: (devicesRes.data.devices || []).length }));
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        if (socket) {
            socket.on('refresh_data', fetchData);
            return () => socket.off('refresh_data', fetchData);
        }
    }, [socket, fetchData]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 12 }}>
            <div className="cd-spinner" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif' }}>Loading dashboard…</span>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, fontFamily: 'Outfit, sans-serif' }}>
            <AlertCircle size={28} color="#ef4444" opacity={0.7} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 300 }}>{error}</p>
            <button onClick={fetchData} style={{ padding: '10px 24px', borderRadius: 12, background: '#f97316', border: 'none', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Retry
            </button>
        </div>
    );

    return (
        <>
            <style>{dashStyles}</style>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <main className="cd-wrap" style={{ width: '100%', maxWidth: 820, padding: '36px 40px' }}>

                    {/* ── Header ── */}
                    <header style={{ marginBottom: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'rgba(249,115,22,0.7)', marginBottom: 6 }}>
                                    Customer Portal
                                </p>
                                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.1, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                                    Hey, {firstName} 👋
                                </h1>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 8, fontFamily: 'Outfit, sans-serif' }}>
                                    Here's a quick overview of your repair activities.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}>
                                <span className="cd-dot" />
                                <span style={{ fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: 'rgba(74,222,128,0.8)', letterSpacing: '0.5px' }}>All systems live</span>
                            </div>
                        </div>
                    </header>

                    {/* ── Stats ── */}
                    <div className="cd-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                        <div className="cd-stat" style={{ borderColor: 'rgba(255,69,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div className="cd-stat-icon cd-stat-icon-blue"><Wrench size={18} strokeWidth={1.5} /></div>
                                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--sf-accent)', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}>ACTIVE TASK</span>
                            </div>
                            <div>
                                <div className="cd-stat-value" style={{ color: 'var(--sf-accent)' }}>{stats.active}</div>
                                <div className="cd-stat-label" style={{ fontFamily: 'var(--font-mono)' }}>Repair Nodes</div>
                            </div>
                        </div>

                        <div className="cd-stat cd-stat-green">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div className="cd-stat-icon cd-stat-icon-green"><CheckCircle2 size={18} /></div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(74,222,128,0.7)', letterSpacing: '0.5px' }}>DONE</span>
                            </div>
                            <div>
                                <div className="cd-stat-value">{stats.completed}</div>
                                <div className="cd-stat-label">Completed Jobs</div>
                            </div>
                        </div>

                        <div className="cd-stat cd-stat-cyan">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div className="cd-stat-icon cd-stat-icon-cyan"><Smartphone size={18} /></div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(34,211,238,0.7)', letterSpacing: '0.5px' }}>LINKED</span>
                            </div>
                            <div>
                                <div className="cd-stat-value">{stats.devices}</div>
                                <div className="cd-stat-label">My Devices</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div style={{ marginBottom: 32 }}>
                        <p className="cd-section-label">Quick Actions</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <button className="cd-action-primary" onClick={() => navigate('/customer/find-repair')}>
                                <CalendarPlus size={20} />
                                <span>Book a New Repair</span>
                            </button>
                            <button className="cd-action-secondary" onClick={() => navigate('/customer/my-devices')}>
                                <Monitor size={18} />
                                <span>Manage My Devices</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Chart ── */}
                    <div className="cd-card" style={{ marginBottom: 28 }}>
                        <div className="cd-card-header" style={{ marginBottom: 20 }}>
                            <div>
                                <div className="cd-card-title">Monthly Activity</div>
                                <div className="cd-card-sub">Repair appointments over the last 12 months</div>
                            </div>
                            <Zap size={16} color="rgba(249,115,22,0.5)" />
                        </div>
                        <div style={{ height: 220, padding: '0 16px 16px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={28}>
                                    <defs>
                                        <linearGradient id="cdBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} dy={8} fontFamily="Outfit, sans-serif" />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} fontFamily="Outfit, sans-serif" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="appointments" fill="url(#cdBarGrad)" name="Appointments" radius={[5, 5, 0, 0]} animationDuration={1200} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Active Repairs ── */}
                    <div style={{ marginBottom: 28 }}>
                        <ActiveRepairs activeRepairs={activeRepairs} statusColors={statusColors} />
                    </div>

                    {/* ── Refresh ── */}
                    <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
                        <button className="cd-refresh" onClick={fetchData} disabled={loading}>
                            <RefreshCw size={14} />
                            Refresh Dashboard
                        </button>
                    </div>

                </main>
            </div>
        </>
    );
};

export default CustomerDashboard;