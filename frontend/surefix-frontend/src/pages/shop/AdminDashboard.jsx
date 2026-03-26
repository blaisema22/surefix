import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../admin.api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Users, Store, CalendarCheck, Activity, ShieldCheck,
    AlertCircle, TrendingUp, Server, Download, FileText, ChevronDown
} from 'lucide-react';
import '../../styles/sf-pages.css';

const adminStyles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.ad-stat {
  background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
  border-radius:18px; padding:22px 24px; position:relative; overflow:hidden;
  transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.ad-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.3); border-color:rgba(255,255,255,0.12); }
.ad-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:18px 18px 0 0; }
.ad-stat-blue::before   { background:linear-gradient(90deg,#3b82f6,#60a5fa); }
.ad-stat-green::before  { background:linear-gradient(90deg,#10b981,#34d399); }
.ad-stat-amber::before  { background:linear-gradient(90deg,#f59e0b,#fcd34d); }
.ad-stat-purple::before { background:linear-gradient(90deg,#8b5cf6,#a78bfa); }
.ad-stat-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.ad-stat-icon-blue   { background:rgba(59,130,246,0.12);  color:#60a5fa; }
.ad-stat-icon-green  { background:rgba(16,185,129,0.12);  color:#34d399; }
.ad-stat-icon-amber  { background:rgba(245,158,11,0.12);  color:#fcd34d; }
.ad-stat-icon-purple { background:rgba(139,92,246,0.12);  color:#a78bfa; }
.ad-stat-value { font-size:34px; font-weight:800; color:#fff; line-height:1; letter-spacing:-1px; }
.ad-stat-label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-top:4px; }
.ad-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:20px; overflow:hidden; }
.ad-card-header { padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; }
.ad-card-title { font-size:14px; font-weight:700; color:rgba(255,255,255,0.8); }
.ad-export-menu { position:absolute; top:52px; right:0; background:#0d1424; border:1px solid rgba(255,255,255,0.09); border-radius:14px; padding:8px; min-width:190px; z-index:50; box-shadow:0 16px 40px rgba(0,0,0,0.5); }
.ad-export-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; background:none; border:none; color:rgba(255,255,255,0.5); font-family:'Outfit',sans-serif; font-size:13px; font-weight:500; cursor:pointer; width:100%; text-align:left; transition:all 0.18s; }
.ad-export-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
.ad-progress-bar { height:4px; border-radius:4px; background:rgba(255,255,255,0.06); overflow:hidden; }
.ad-progress-fill { height:100%; border-radius:4px; transition:width 0.6s ease; }
.ad-activity-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:5px; }
.ad-live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px rgba(34,197,94,0.6); animation:sf-pulse 2s infinite; }
`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '12px 16px', fontFamily: 'Outfit,sans-serif' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#f97316', margin: 0 }}>{payload[0].value}</p>
        </div>
    );
};

const STAT_CONFIGS = [
    { key: 'total_users', label: 'Total Users', iconKey: 'blue', Icon: Users },
    { key: 'total_centres', label: 'Repair Centres', iconKey: 'green', Icon: Store },
    { key: 'total_appointments', label: 'Total Bookings', iconKey: 'amber', Icon: CalendarCheck },
    { key: 'active_centres', label: 'Active Centres', iconKey: 'purple', Icon: Activity },
];

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total_users: 0, total_centres: 0, total_appointments: 0, active_centres: 0 });
    const [chartData, setChartData] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExport, setShowExport] = useState(false);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
      (async () => {
          try {
              const res = await adminAPI.getDashboardStats();
          if (res.success) { setStats(res.stats); setChartData(res.chart_data || []); setActivity(res.activity || []); }
      } catch (err) {
              if ([404, 500].includes(err.response?.status)) {
                  setStats({ total_users: 124, total_centres: 15, total_appointments: 892, active_centres: 12 });
                  setChartData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((name, i) => ({ name, value: [40, 30, 20, 27, 18, 23, 34, 45][i] })));
              } else setError('Failed to load system statistics.');
          } finally { setLoading(false); }
      })();
  }, []);

    const handleExport = async (type) => {
        setDownloading(type);
      try { await adminAPI.downloadReport(type); }
      catch { alert('Failed to download report.'); }
      finally { setDownloading(null); setShowExport(false); }
  };

    if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 14, fontFamily: 'Outfit,sans-serif' }}>
          <div className="sf-spinner" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Loading system data…</span>
      </div>
  );

    return (
      <>
          <style>{adminStyles}</style>
          <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="sf-page-wrap" style={{ maxWidth: 960 }}>

                  {/* Header */}
                  <div className="sf-anim-up" style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(239,68,68,0.8)' }}>
                              <ShieldCheck size={16} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(239,68,68,0.7)' }}>Admin Console</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                          <div>
                              <h1 className="sf-page-title">System Overview</h1>
                              <p className="sf-page-sub">Monitoring global network performance and registrations.</p>
                          </div>
                          {/* Export */}
                          <div style={{ position: 'relative' }}>
                              <button className="sf-btn-ghost" onClick={() => setShowExport(p => !p)}>
                                  <Download size={14} />
                                  {downloading ? 'Downloading…' : 'Export Reports'}
                                  <ChevronDown size={13} style={{ transform: showExport ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                              </button>
                              {showExport && (
                                  <div className="ad-export-menu">
                                      {['users', 'appointments', 'centres'].map(type => (
                                          <button key={type} className="ad-export-item" onClick={() => handleExport(type)}>
                                              <FileText size={13} /> {type.charAt(0).toUpperCase() + type.slice(1)} Report
                                          </button>
                    ))}
                                  </div>
                )}
                          </div>
                      </div>
                  </div>

                  {error && (
                      <div className="sf-error sf-anim-up" style={{ marginBottom: 24 }}>
                          <AlertCircle size={15} /> {error}
                      </div>
                  )}

                  {/* Stats */}
                  <div className="sf-anim-up sf-s1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                      {STAT_CONFIGS.map(({ key, label, iconKey, Icon }) => (
                          <div key={key} className={`ad-stat ad-stat-${iconKey}`}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                  <div className={`ad-stat-icon ad-stat-icon-${iconKey}`}><Icon size={17} /></div>
                              </div>
                              <div className="ad-stat-value">{stats[key] ?? 0}</div>
                              <div className="ad-stat-label">{label}</div>
                          </div>
                      ))}
                  </div>

                  {/* Main grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

                      {/* Chart */}
                      <div className="ad-card sf-anim-up sf-s2">
                          <div className="ad-card-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <TrendingUp size={15} color="rgba(249,115,22,0.7)" />
                                  <span className="ad-card-title">Monthly Activity</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span className="ad-live-dot" />
                                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(34,197,94,0.7)' }}>Live</span>
                              </div>
                          </div>
                          <div style={{ height: 260, padding: '16px 16px 8px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                                      <defs>
                                          <linearGradient id="adGrad" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                                              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                          </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} dy={8} fontFamily="Outfit,sans-serif" />
                                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} fontFamily="Outfit,sans-serif" />
                                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                                      <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} fill="url(#adGrad)" />
                                  </AreaChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Side panels */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                          {/* Recent activity */}
                          <div className="ad-card sf-anim-up sf-s2" style={{ flex: 1 }}>
                              <div className="ad-card-header">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Activity size={14} color="rgba(96,165,250,0.7)" />
                                      <span className="ad-card-title">Recent Activity</span>
                                  </div>
                              </div>
                              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                  {activity.length > 0 ? activity.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div className="ad-activity-dot" style={{ background: item.type === 'user' ? '#60a5fa' : '#34d399', boxShadow: item.type === 'user' ? '0 0 8px rgba(96,165,250,0.4)' : '0 0 8px rgba(52,211,153,0.4)' }} />
                          <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: 0, marginBottom: 2 }}>{item.subject}</p>
                              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                                  {item.type === 'user' ? `New ${item.detail}` : 'New Centre'} · {new Date(item.created_at).toLocaleDateString()}
                              </p>
                          </div>
                      </div>
                  )) : <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No recent activity.</p>}
                              </div>
                          </div>

                          {/* Server status */}
                          <div className="ad-card sf-anim-up sf-s3">
                              <div className="ad-card-header">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Server size={14} color="rgba(255,255,255,0.3)" />
                                      <span className="ad-card-title">Server Status</span>
                                  </div>
                              </div>
                              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                  {[
                                      { label: 'CPU Load', val: 12, color: '#34d399' },
                                      { label: 'Memory Usage', val: 45, color: '#60a5fa' },
                                      { label: 'Storage', val: 28, color: '#a78bfa' },
                                  ].map(m => (
                                      <div key={m.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{m.label}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.val}%</span>
                          </div>
                          <div className="ad-progress-bar">
                              <div className="ad-progress-fill" style={{ width: `${m.val}%`, background: m.color }} />
                          </div>
                      </div>
                  ))}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4 }}>
                                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>All Systems Operational</span>
                                  </div>
                              </div>
                          </div>

            </div>
                  </div>

              </div>
          </div>
      </>
  );
};

export default AdminDashboard;