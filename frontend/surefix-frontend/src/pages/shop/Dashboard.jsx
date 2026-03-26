import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Calendar, Users, Wrench, ArrowRight, Clock, User, Phone, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import '../../styles/sf-pages.css';

const shopStyles = `
.sh-stat {
  background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
  border-radius:18px; padding:22px 20px; position:relative; overflow:hidden;
  transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.sh-stat:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,0,0,0.25); border-color:rgba(255,255,255,0.11); }
.sh-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:18px 18px 0 0; }
.sh-stat-blue::before   { background:linear-gradient(90deg,#3b82f6,#60a5fa); }
.sh-stat-green::before  { background:linear-gradient(90deg,#10b981,#34d399); }
.sh-stat-purple::before { background:linear-gradient(90deg,#8b5cf6,#a78bfa); }
.sh-stat-icon { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sh-stat-icon-blue   { background:rgba(59,130,246,0.12);  color:#60a5fa; }
.sh-stat-icon-green  { background:rgba(16,185,129,0.12);  color:#34d399; }
.sh-stat-icon-purple { background:rgba(139,92,246,0.12);  color:#a78bfa; }
.sh-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:18px; overflow:hidden; }
.sh-booking-row {
  display:flex; align-items:center; gap:16px; padding:14px 20px;
  border-bottom:1px solid rgba(255,255,255,0.04);
  transition:background 0.18s;
}
.sh-booking-row:last-child { border-bottom:none; }
.sh-booking-row:hover { background:rgba(255,255,255,0.03); }
.sh-quick-link {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 18px; border-radius:12px;
  background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
  text-decoration:none; transition:all 0.18s; margin-bottom:8px;
}
.sh-quick-link:hover { background:rgba(255,255,255,0.07); border-color:rgba(249,115,22,0.2); transform:translateX(2px); }

@media (max-width: 1024px) {
  .sh-main-grid { grid-template-columns: 1fr !important; }
}
@media (max-width: 768px) {
  .sh-stats-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
}
`;

const STATUS_STYLES = {
    pending: { bg: 'rgba(245,158,11,0.1)', color: 'rgba(251,191,36,0.85)', label: 'Pending' },
    confirmed: { bg: 'rgba(59,130,246,0.1)', color: 'rgba(96,165,250,0.85)', label: 'Confirmed' },
    in_progress: { bg: 'rgba(139,92,246,0.1)', color: 'rgba(167,139,250,0.85)', label: 'In Progress' },
    completed: { bg: 'rgba(34,197,94,0.1)', color: 'rgba(74,222,128,0.85)', label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.08)', color: 'rgba(252,165,165,0.75)', label: 'Cancelled' },
};

const ShopDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopName, setShopName] = useState('');

    useEffect(() => {
        (async () => {
            try {
          const shopRes = await api.get('/centres/my/centre');
          if (shopRes.data.success) setShopName(shopRes.data.centre.name);

          const start = '2000-01-01'; // Get all-time stats for the main dashboard
          const end = '2099-12-31';
          const reportRes = await api.get(`/centres/my/reports?start_date=${start}&end_date=${end}`);
          if (reportRes.data.success) setStats(reportRes.data.reports);

              const apptRes = await api.get('/appointments/shop');
              if (apptRes.data.success) setRecentBookings(apptRes.data.appointments.slice(0, 5));
          } catch (err) { console.error(err); }
          finally { setLoading(false); }
      })();
  }, []);

    const data = stats || { total_appointments: 0, completed_appointments: 0, new_customers: 0 };

    if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 14, fontFamily: 'Outfit,sans-serif' }}>
          <div className="sf-spinner" style={{ width: 32, height: 32 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Loading…</span>
      </div>
  );

    return (
        <>
          <style>{shopStyles}</style>
          <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="sf-page-wrap" style={{ maxWidth: 900 }}>

                  {/* Header */}
                  <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                      <div>
                          <span className="sf-eyebrow">Shop Dashboard</span>
                          <h1 className="sf-page-title">Welcome back{shopName ? `, ${shopName}` : ''}</h1>
                          <p className="sf-page-sub">Here's what's happening at your repair centre today.</p>
                      </div>
                      <button className="sf-btn-primary" onClick={() => navigate('/shop/scan')}>
                          <QrCode size={15} /> Scan Ticket
                      </button>
                  </div>

                  {/* Stats */}
                  <div className="sf-anim-up sf-s1 sh-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                      {[
                          { label: 'Total Appointments', value: data.total_appointments, iconKey: 'blue', Icon: Calendar },
                          { label: 'Repairs Completed', value: data.completed_appointments, iconKey: 'green', Icon: Wrench },
                          { label: 'New Customers', value: data.new_customers, iconKey: 'purple', Icon: Users },
                      ].map(({ label, value, iconKey, Icon }) => (
                          <div key={label} className={`sh-stat sh-stat-${iconKey}`}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                  <div className={`sh-stat-icon sh-stat-icon-${iconKey}`}><Icon size={16} /></div>
                              </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>{label}</div>
                </div>
            ))}
                  </div>

                  {/* Main grid */}
                  <div className="sh-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

                      {/* Recent bookings */}
                      <div className="sh-card sf-anim-up sf-s2">
                          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Recent Bookings</span>
                              <Link to="/shop/appointments" style={{ fontSize: 12, color: 'rgba(249,115,22,0.75)', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
                          </div>
                          {recentBookings.length > 0 ? recentBookings.map(b => {
                              const d = new Date(b.appointment_date);
                              const st = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                              return (
                                  <div key={b.appointment_id} className="sh-booking-row">
                                      <div style={{ width: 50, flexShrink: 0, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.14)', borderRadius: 11, padding: '8px 4px', textAlign: 'center' }}>
                                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(249,115,22,0.65)' }}>{d.toLocaleDateString('en', { month: 'short' })}</div>
                                          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{d.getDate()}</div>
                                      </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{b.service_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                <User size={10} /> {b.customer_name}
                                {b.customer_phone && (
                                    <>
                                        <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                                        <Phone size={10} /> {b.customer_phone}
                                    </>
                                )}
                                <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                                <Clock size={10} /> {(b.appointment_time || '').slice(0, 5)}
                            </div>
                        </div>
                        <span style={{ padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', flexShrink: 0 }}>
                            {st.label}
                        </span>
                    </div>
                  );
              }) : (
                              <div className="sf-empty" style={{ border: 'none', padding: '32px 24px' }}>
                                  <div className="sf-empty-icon"><Calendar size={20} /></div>
                                  <p className="sf-empty-sub" style={{ marginBottom: 0 }}>No recent bookings found.</p>
                              </div>
                          )}
                      </div>

                      {/* Quick actions */}
                      <div className="sf-anim-up sf-s2">
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 14 }}>Quick Actions</p>
                          {[
                              { to: '/shop/appointments', title: 'Manage Appointments', sub: 'View upcoming jobs' },
                              { to: '/shop/services', title: 'Service Menu', sub: 'Update services' },
                              { to: '/shop/customers', title: 'Client List', sub: 'Browse customers' },
                              { to: '/shop/profile', title: 'Shop Settings', sub: 'Update location & info' },
                          ].map(({ to, title, sub }) => (
                              <Link key={to} to={to} className="sh-quick-link">
                                  <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{title}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{sub}</div>
                      </div>
                      <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                  </Link>
              ))}
                      </div>

                  </div>

              </div>
          </div>
      </>
  );
};

export default ShopDashboard;