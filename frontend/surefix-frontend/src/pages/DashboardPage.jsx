import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useNotifications } from '@/context/NotificationContext';
import { appointmentAPI } from '../api/appointments.api';
import { deviceAPI } from '../api/devices.api';
import {
  Calendar, Smartphone, Bell, Search, Wrench, CheckCircle2,
  ArrowRight, CalendarPlus, Clock, MapPin, ChevronRight,
  RefreshCw, AlertCircle, Zap, Activity, Package,
} from 'lucide-react';

/* ─────────────────── inline styles ─────────────────── */
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  .dp-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  /* page-in animation */
  @keyframes dp-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .dp-root { animation: dp-up .45s ease both; }

  /* stagger */
  .dp-stagger > *:nth-child(1) { animation: dp-up .4s .04s ease both; }
  .dp-stagger > *:nth-child(2) { animation: dp-up .4s .10s ease both; }
  .dp-stagger > *:nth-child(3) { animation: dp-up .4s .16s ease both; }
  .dp-stagger > *:nth-child(4) { animation: dp-up .4s .22s ease both; }

  /* ── stat card ── */
  .dp-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 24px;
    position: relative; overflow: hidden;
    transition: transform .2s, box-shadow .2s, border-color .2s;
    cursor: default;
  }
  .dp-stat:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.12); }
  .dp-stat::after {
    content: ''; position: absolute; top:0; left:0; right:0; height:2px; border-radius: 20px 20px 0 0;
  }
  .dp-stat-blue::after  { background: linear-gradient(90deg,#3b82f6,#60a5fa); }
  .dp-stat-green::after { background: linear-gradient(90deg,#22c55e,#4ade80); }
  .dp-stat-violet::after{ background: linear-gradient(90deg,#a78bfa,#c4b5fd); }
  .dp-stat-amber::after { background: linear-gradient(90deg,#f59e0b,#fbbf24); }

  .dp-stat-icon {
    width:42px; height:42px; border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom: 18px;
  }
  .dp-stat-val { font-size:38px; font-weight:800; color:#fff; letter-spacing:-1.5px; line-height:1; }
  .dp-stat-lbl { font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-top:4px; }
  .dp-stat-badge {
    position:absolute; top:20px; right:20px;
    font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
    padding: 3px 9px; border-radius:20px;
  }

  /* ── glass card ── */
  .dp-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 22px; overflow:hidden;
  }
  .dp-card-hd {
    display:flex; align-items:center; justify-content:space-between;
    padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .dp-card-title { font-size:14px; font-weight:700; color:rgba(255,255,255,0.9); letter-spacing:-.2px; }
  .dp-card-sub   { font-size:11px; color:rgba(255,255,255,0.28); margin-top:2px; }
  .dp-card-link  {
    font-size:11px; font-weight:600; letter-spacing:.5px; text-transform:uppercase;
    color:rgba(249,115,22,0.7); text-decoration:none; display:flex; align-items:center; gap:4px;
    transition:color .2s;
  }
  .dp-card-link:hover { color:#f97316; }

  /* ── status badges ── */
  .dp-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding: 4px 10px; border-radius: 20px;
    font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:capitalize;
  }
  .dp-badge-pending    { background:rgba(245,158,11,.12); color:#fbbf24; border:1px solid rgba(245,158,11,.2); }
  .dp-badge-confirmed  { background:rgba(59,130,246,.12);  color:#60a5fa;  border:1px solid rgba(59,130,246,.2); }
  .dp-badge-in_progress{ background:rgba(249,115,22,.12);  color:#fb923c;  border:1px solid rgba(249,115,22,.2); }
  .dp-badge-completed  { background:rgba(34,197,94,.12);   color:#4ade80;  border:1px solid rgba(34,197,94,.2); }
  .dp-badge-cancelled  { background:rgba(239,68,68,.10);   color:#f87171;  border:1px solid rgba(239,68,68,.18); }

  /* ── table ── */
  .dp-table { width:100%; border-collapse:collapse; }
  .dp-table th {
    padding:12px 20px; text-align:left;
    font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
    color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.02);
    border-bottom:1px solid rgba(255,255,255,0.05);
  }
  .dp-table td { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.03); }
  .dp-table tr:last-child td { border-bottom:none; }
  .dp-table tbody tr { transition: background .15s; }
  .dp-table tbody tr:hover { background: rgba(255,255,255,0.025); }

  /* ── quick action buttons ── */
  .dp-action-primary {
    display:flex; align-items:center; gap:12px;
    padding:16px 20px; border-radius:16px; border:none; cursor:pointer; width:100%;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; color:#fff; text-align:left;
    background: linear-gradient(135deg,#f97316 0%,#ea580c 100%);
    box-shadow: 0 4px 20px rgba(249,115,22,.28);
    transition: transform .18s, box-shadow .18s;
    text-decoration:none;
  }
  .dp-action-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(249,115,22,.38); }

  .dp-action-secondary {
    display:flex; align-items:center; gap:12px;
    padding:16px 20px; border-radius:16px; cursor:pointer; width:100%;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; text-align:left;
    color:rgba(255,255,255,0.6);
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    transition: all .18s;
    text-decoration:none;
  }
  .dp-action-secondary:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.9); transform:translateY(-2px); }

  /* ── pulse dot ── */
  .dp-dot { width:8px;height:8px;border-radius:50%; background:#22c55e; display:inline-block; box-shadow:0 0 8px rgba(34,197,94,0.5); }
  @keyframes dp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .dp-dot { animation: dp-pulse 2s infinite; }

  /* ── empty state ── */
  .dp-empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:48px 24px; text-align:center; gap:14px;
  }
  .dp-empty-icon {
    width:64px; height:64px; border-radius:18px;
    background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
    display:flex; align-items:center; justify-content:center;
  }

  /* ── spinner ── */
  .dp-spinner {
    width:30px;height:30px;border-radius:50%;
    border:2px solid rgba(255,255,255,0.07); border-top-color:#f97316;
    animation:dp-spin .65s linear infinite;
  }
  @keyframes dp-spin { to{transform:rotate(360deg)} }

  /* ── device widget item ── */
  .dp-dev-row {
    display:flex; align-items:center; gap:14px;
    padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.04);
    transition:background .15s;
  }
  .dp-dev-row:last-child { border-bottom:none; }
  .dp-dev-row:hover { background:rgba(255,255,255,0.03); }

  /* progress bar */
  .dp-prog-track { height:4px; background:rgba(255,255,255,0.06); border-radius:10px; overflow:hidden; }
  .dp-prog-fill  { height:100%; border-radius:10px; background:linear-gradient(90deg,#3b82f6,#06b6d4); }

  /* section label */
  .dp-section-lbl {
    font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase;
    color:rgba(255,255,255,0.2); margin-bottom:12px;
  }

  /* refresh btn */
  .dp-refresh {
    display:inline-flex; align-items:center; gap:8px;
    padding:10px 20px; border-radius:12px;
    border:1px solid rgba(255,255,255,0.07); background:transparent;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:500;
    color:rgba(255,255,255,0.3); cursor:pointer; transition:all .2s;
  }
  .dp-refresh:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); border-color:rgba(255,255,255,0.12); }

  /* ── Mobile Layout Fixes ── */
  @media (max-width: 1024px) {
    .dp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dp-main-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 768px) {
    .dp-actions-grid { grid-template-columns: 1fr !important; }
    .dp-stats-grid { gap: 12px !important; }
    .dp-card { overflow-x: auto !important; }
  }
  @media (max-width: 480px) {
    .dp-stats-grid { grid-template-columns: 1fr !important; }
    .dp-header-actions { flex-direction: column !important; align-items: flex-start !important; }
    .dp-root-container { padding: 24px 16px 60px !important; }
  }
`;

/* ── status badge helper ── */
const StatusBadge = ({ status }) => {
  const cls = {
    pending:     'dp-badge dp-badge-pending',
    confirmed:   'dp-badge dp-badge-confirmed',
    in_progress: 'dp-badge dp-badge-in_progress',
    completed:   'dp-badge dp-badge-completed',
    cancelled:   'dp-badge dp-badge-cancelled',
  }[status] || 'dp-badge dp-badge-pending';

  const dot = {
    pending: '#fbbf24', confirmed: '#60a5fa',
    in_progress: '#fb923c', completed: '#4ade80', cancelled: '#f87171',
  }[status] || '#fbbf24';

  return (
    <span className={cls}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:dot, display:'inline-block' }} />
      {status?.replace('_', ' ')}
    </span>
  );
};

/* ── stat card ── */
const StatCard = ({ value, label, icon: Icon, colorClass, iconBg, iconColor, badge, badgeBg, badgeColor }) => (
  <div className={`dp-stat ${colorClass}`}>
    {badge && (
      <span className="dp-stat-badge" style={{ background: badgeBg, color: badgeColor }}>{badge}</span>
    )}
    <div className="dp-stat-icon" style={{ background: iconBg }}>
      <Icon size={18} color={iconColor} />
    </div>
    <div className="dp-stat-val">{value}</div>
    <div className="dp-stat-lbl">{label}</div>
  </div>
);

/* ── main component ── */
const DashboardPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const firstName = user?.name?.split(' ')[0] || 'there';

  const [appointments, setAppointments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, upcoming: 0, devices: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (bg = false) => {
    if (!bg) setLoading(true);
    setError('');
    try {
      const [apptRes, devRes] = await Promise.all([
        appointmentAPI.getAppointments(),
        deviceAPI.getMyDevices(),
      ]);

      if (apptRes.success) {
        const all = apptRes.appointments || [];
        const active    = all.filter(a => ['pending','confirmed','in_progress'].includes(a.status));
        const completed = all.filter(a => a.status === 'completed');
        const upcoming  = all.filter(a => ['pending','confirmed'].includes(a.status) && new Date(a.appointment_date) >= new Date());
        setStats(s => ({ ...s, total: all.length, active: active.length, completed: completed.length, upcoming: upcoming.length }));
        setAppointments(all.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6));
      }

      if (devRes.data?.success) {
        const devList = devRes.data.devices || [];
        setDevices(devList.slice(0, 4));
        setStats(s => ({ ...s, devices: devList.length }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      if (!bg) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchData(true);
    const onUpdate = () => { fetchData(true); addNotification('Appointment status updated.', 'info'); };
    socket.on('refresh_data', refresh);
    socket.on('new_appointment', refresh);
    socket.on('appointment_updated', onUpdate);
    return () => {
      socket.off('refresh_data', refresh);
      socket.off('new_appointment', refresh);
      socket.off('appointment_updated', onUpdate);
    };
  }, [socket, fetchData, addNotification]);

  /* ── loading ── */
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:12 }}>
      <div className="dp-spinner" />
      <span style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontFamily:'Outfit,sans-serif' }}>Loading your dashboard…</span>
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16, fontFamily:'Outfit,sans-serif' }}>
      <AlertCircle size={28} color="#ef4444" opacity={0.7} />
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textAlign:'center', maxWidth:300 }}>{error}</p>
      <button onClick={() => fetchData()} style={{ padding:'10px 24px', borderRadius:12, background:'#f97316', border:'none', color:'#fff', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:14, cursor:'pointer' }}>Retry</button>
    </div>
  );

  return (
    <>
      <style>{S}</style>
      <div className="dp-root dp-root-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 28px 60px' }}>

        {/* ── Header ── */}
        <header style={{ marginBottom: 36 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:'1.4px', textTransform:'uppercase', color:'rgba(249,115,22,0.75)', marginBottom:6, margin:0 }}>
                Customer Portal
              </p>
              <h1 style={{ fontSize:34, fontWeight:800, color:'#fff', letterSpacing:'-1px', lineHeight:1.1, margin:'6px 0 8px', fontFamily:'Outfit,sans-serif' }}>
                Hey, {firstName} 👋
              </h1>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.32)', margin:0 }}>
                Here's a full overview of your repair activity.
              </p>
            </div>
            <div className="dp-header-actions" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:24, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.18)' }}>
                <span className="dp-dot" />
                <span style={{ fontSize:11, fontWeight:600, color:'rgba(74,222,128,0.8)', letterSpacing:'.5px' }}>All systems live</span>
              </div>
              <button className="dp-refresh" onClick={() => fetchData()}>
                <RefreshCw size={13} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <div className="dp-stagger dp-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
          <StatCard
            value={stats.active}     label="Active Repairs"
            icon={Wrench}            colorClass="dp-stat-blue"
            iconBg="rgba(59,130,246,.15)" iconColor="#60a5fa"
            badge="ACTIVE"           badgeBg="rgba(59,130,246,.12)"  badgeColor="#60a5fa"
          />
          <StatCard
            value={stats.upcoming}   label="Upcoming"
            icon={CalendarPlus}      colorClass="dp-stat-amber"
            iconBg="rgba(245,158,11,.15)" iconColor="#fbbf24"
            badge="SOON"             badgeBg="rgba(245,158,11,.12)"  badgeColor="#fbbf24"
          />
          <StatCard
            value={stats.completed}  label="Completed Jobs"
            icon={CheckCircle2}      colorClass="dp-stat-green"
            iconBg="rgba(34,197,94,.15)" iconColor="#4ade80"
            badge="DONE"             badgeBg="rgba(34,197,94,.12)"   badgeColor="#4ade80"
          />
          <StatCard
            value={stats.devices}    label="My Devices"
            icon={Smartphone}        colorClass="dp-stat-violet"
            iconBg="rgba(167,139,250,.15)" iconColor="#c4b5fd"
            badge="LINKED"           badgeBg="rgba(167,139,250,.12)" badgeColor="#c4b5fd"
          />
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ marginBottom:32 }}>
          <p className="dp-section-lbl">Quick Actions</p>
          <div className="dp-actions-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            <Link to="/find-repair" className="dp-action-primary">
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Search size={18} />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>Find Repair Center</div>
                <div style={{ fontSize:11, opacity:.65, fontWeight:400 }}>Discover nearby shops</div>
              </div>
            </Link>
            <Link to="/booking" className="dp-action-secondary">
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(249,115,22,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <CalendarPlus size={18} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>Book a Repair</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>Schedule a service</div>
              </div>
            </Link>
            <Link to="/devices" className="dp-action-secondary">
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(167,139,250,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Smartphone size={18} color="#c4b5fd" />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>My Devices</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>Manage hardware</div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="dp-main-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, alignItems:'start' }}>

          {/* Recent Appointments */}
          <div className="dp-card">
            <div className="dp-card-hd">
              <div>
                <div className="dp-card-title">Recent Repair History</div>
                <div className="dp-card-sub">Your latest service requests</div>
              </div>
              <Link to="/appointments" className="dp-card-link">
                View all <ChevronRight size={13} />
              </Link>
            </div>

            {appointments.length > 0 ? (
              <table className="dp-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Centre</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.appointment_id}>
                      <td>
                        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>
                          {app.service_name || 'Service'}
                        </div>
                        {app.device_brand && (
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>
                            {app.device_brand} {app.device_model}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:4 }}>
                          <MapPin size={11} />
                          {app.centre_name || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
                          <Clock size={11} />
                          {app.appointment_date
                            ? new Date(app.appointment_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
                            : '—'}
                        </div>
                      </td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <Link to="/appointments" style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', color:'rgba(249,115,22,0.5)', transition:'color .15s', textDecoration:'none' }}
                          onMouseEnter={e => e.currentTarget.style.color='#f97316'}
                          onMouseLeave={e => e.currentTarget.style.color='rgba(249,115,22,0.5)'}
                        >
                          <ChevronRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="dp-empty">
                <div className="dp-empty-icon">
                  <Calendar size={26} color="rgba(255,255,255,0.15)" />
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.5)', margin:'0 0 6px' }}>No repairs yet</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', margin:0, lineHeight:1.6 }}>
                    Book your first repair to get started.
                  </p>
                </div>
                <Link to="/find-repair" className="dp-action-primary" style={{ width:'auto', padding:'12px 24px', borderRadius:12 }}>
                  <Search size={16} /> Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Devices Widget */}
            <div className="dp-card">
              <div className="dp-card-hd">
                <div>
                  <div className="dp-card-title">My Devices</div>
                  <div className="dp-card-sub">{stats.devices} registered</div>
                </div>
                <Link to="/devices" className="dp-card-link">Manage <ChevronRight size={13} /></Link>
              </div>

              {devices.length > 0 ? (
                <div>
                  {devices.map((dev, i) => (
                    <div key={dev.device_id || i} className="dp-dev-row">
                      <div style={{ width:36, height:36, borderRadius:10, background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Smartphone size={16} color="#c4b5fd" />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {dev.brand} {dev.model}
                        </div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>
                          {dev.device_type || 'Device'}
                        </div>
                      </div>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.5)', flexShrink:0 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dp-empty" style={{ padding:'32px 20px' }}>
                  <div className="dp-empty-icon">
                    <Smartphone size={22} color="rgba(255,255,255,0.15)" />
                  </div>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', margin:0 }}>No devices added yet</p>
                  <Link to="/devices" className="dp-card-link" style={{ marginTop:4 }}>Add device →</Link>
                </div>
              )}
            </div>

            {/* Status Breakdown Card */}
            <div className="dp-card" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'rgba(249,115,22,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Activity size={16} color="#f97316" />
                </div>
                <div>
                  <div className="dp-card-title">Repair Overview</div>
                  <div className="dp-card-sub">Lifetime stats</div>
                </div>
              </div>

              {[
                { label:'Active',    val: stats.active,    max: Math.max(stats.total,1), color:'#60a5fa' },
                { label:'Upcoming',  val: stats.upcoming,  max: Math.max(stats.total,1), color:'#fbbf24' },
                { label:'Completed', val: stats.completed, max: Math.max(stats.total,1), color:'#4ade80' },
              ].map(row => (
                <div key={row.label} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{row.label}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:700 }}>{row.val}</span>
                  </div>
                  <div className="dp-prog-track">
                    <div className="dp-prog-fill" style={{ width:`${(row.val / row.max) * 100}%`, background:`linear-gradient(90deg,${row.color}99,${row.color})` }} />
                  </div>
                </div>
              ))}

              <Link to="/appointments" className="dp-action-secondary" style={{ marginTop:8, justifyContent:'center' }}>
                <Calendar size={15} />
                View All Appointments
              </Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default DashboardPage;