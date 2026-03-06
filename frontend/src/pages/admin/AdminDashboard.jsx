import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, appointmentAPI, serviceAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
);

export default function AdminDashboard() {
  const [tab, setTab] = useState('centres');
  const [centres, setCentres] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes, sRes, aRes, svRes] = await Promise.all([
        adminAPI.getAllCentres(),
        adminAPI.getAllUsers(),
        adminAPI.getStats(),
        appointmentAPI.getAll(),
        serviceAPI.getAll(),
      ]);
      setCentres(cRes.data.centres);
      setUsers(uRes.data.users);
      setStats(sRes.data.stats);
      setAppointments(aRes.data.appointments || []);
      setServices(svRes.data.services || []);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggleVisibility = async (centreId, currentVal) => {
    setToggling(centreId);
    try {
      const newVal = !currentVal;
      await adminAPI.toggleVisibility(centreId, newVal);
      toast.success(newVal ? 'âœ… Centre is now visible to customers' : 'ðŸš« Centre is now hidden from customers');
      setCentres(prev => prev.map(c =>
        c.centre_id === centreId ? { ...c, is_visible: newVal } : c
      ));
    } catch {
      toast.error('Failed to update visibility.');
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container page-inner">
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: 'var(--text-primary)' }}>âš™ï¸ Admin Dashboard</h2>
          <p>Manage all repair centres, users, and platform settings.</p>
        </div>

        {/* Platform stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 36 }}>
            {[
              { icon: 'ðŸ‘¥', n: stats.total_users, label: 'Total Users', tab: 'users' },
              { icon: 'ðŸ™‹', n: stats.total_customers, label: 'Customers', tab: 'users' },
              { icon: 'ðŸ”§', n: stats.total_repairers, label: 'Repairers', tab: 'users' },
              { icon: 'ðŸª', n: stats.total_centres, label: 'All Centres', tab: 'centres' },
              { icon: 'âœ…', n: stats.visible_centres, label: 'Visible Centres', tab: 'centres' },
              { icon: 'ðŸ“…', n: stats.total_appointments, label: 'Appointments', tab: 'appointments' },
              { icon: 'âš™ï¸', n: stats.total_services, label: 'Services', tab: 'services' },
            ].map((s, i) => (
              <div key={i} className="card stat-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setTab(s.tab)}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div className="stat-number" style={{ fontSize: '1.6rem' }}>{s.n}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          {[
            ['centres', `ðŸª Repair Centres (${centres.length})`],
            ['users', `ðŸ‘¥ Users (${users.length})`],
            ['appointments', `ðŸ“… Appointments (${appointments.length})`],
            ['services', `âš™ï¸ Services (${services.length})`],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className="btn btn-ghost btn-sm" style={{
              borderRadius: '8px 8px 0 0', paddingBottom: 12,
              borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === key ? 'var(--accent)' : 'var(--text-muted)',
            }}>{label}</button>
          ))}
        </div>

        {/* â”€â”€ CENTRES TAB â”€â”€ */}
        {tab === 'centres' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Toggle the <strong style={{ color: 'var(--text-primary)' }}>Customer Visibility</strong> switch to show or hide any centre from the public search.
              Hidden centres cannot be found or booked by customers.
            </p>
            {centres.length === 0 ? (
              <div className="empty-state"><div className="icon">ðŸª</div><h3>No centres registered yet</h3></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {centres.map(c => (
                  <div key={c.centre_id} className="card" style={{
                    padding: '16px 20px',
                    borderLeft: `4px solid ${c.is_visible ? 'var(--green)' : 'var(--accent)'}`,
                    opacity: c.is_visible ? 1 : 0.75,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{c.name}</span>
                          <span className={`badge ${c.is_visible ? 'badge-confirmed' : 'badge-cancelled'}`}>
                            {c.is_visible ? 'ðŸ‘ï¸ Visible' : 'ðŸš« Hidden'}
                          </span>
                          <span className={`badge ${c.is_active ? 'badge-confirmed' : 'badge-pending'}`}>
                            {c.is_active ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          ðŸ“ {c.address}{c.district ? `, ${c.district}` : ''}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                          {c.owner_name && <span>ðŸ‘¤ Owner: <strong style={{ color: 'var(--text-secondary)' }}>{c.owner_name}</strong></span>}
                          {c.owner_email && <span>âœ‰ï¸ {c.owner_email}</span>}
                          {c.owner_phone && <span>ðŸ“ž {c.owner_phone}</span>}
                          <span>ðŸ”§ {c.service_count || 0} services</span>
                          <span>ðŸ“… {c.appointment_count || 0} appointments</span>
                        </div>
                      </div>

                      {/* Visibility Toggle */}
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {c.is_visible ? 'Visible to customers' : 'Hidden from customers'}
                        </span>
                        <button
                          className={`btn btn-sm ${c.is_visible ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => handleToggleVisibility(c.centre_id, c.is_visible)}
                          disabled={toggling === c.centre_id}
                          style={{ minWidth: 100 }}
                        >
                          {toggling === c.centre_id
                            ? '...'
                            : c.is_visible ? 'ðŸš« Hide Centre' : 'ðŸ‘ï¸ Make Visible'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ USERS TAB â”€â”€ */}
        {tab === 'users' && (
          <div>
            {users.length === 0 ? (
              <div className="empty-state"><div className="icon">ðŸ‘¥</div><h3>No users found</h3></div>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.name}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{u.phone || 'â€”'}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${
                            u.role === 'admin' ? 'badge-in_progress' :
                            u.role === 'repairer' ? 'badge-confirmed' : 'badge-pending'
                          }`}>{u.role}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: 14 }}>{u.is_verified ? 'âœ…' : 'âŒ'}</span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ APPOINTMENTS TAB â”€â”€ */}
        {tab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <div className="empty-state"><div className="icon">ðŸ“…</div><h3>No appointments found</h3></div>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['#', 'User', 'Centre', 'Device', 'Service', 'Date', 'Time', 'Status', 'Reference'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a, i) => (
                      <tr key={a.appointment_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                        <td style={{ padding: '12px' }}>{a.user_name || a.user_id}</td>
                        <td style={{ padding: '12px' }}>{a.centre_name || a.centre_id}</td>
                        <td style={{ padding: '12px' }}>{a.device_id}</td>
                        <td style={{ padding: '12px' }}>{a.service_id}</td>
                        <td style={{ padding: '12px' }}>{a.appointment_date}</td>
                        <td style={{ padding: '12px' }}>{a.appointment_time}</td>
                        <td style={{ padding: '12px' }}>{a.status}</td>
                        <td style={{ padding: '12px' }}>{a.booking_reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ SERVICES TAB â”€â”€ */}
        {tab === 'services' && (
          <div>
            {services.length === 0 ? (
              <div className="empty-state"><div className="icon">âš™ï¸</div><h3>No services found</h3></div>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Centre', 'Service Name', 'Category', 'Duration', 'Available'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s, i) => (
                      <tr key={s.service_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                        <td style={{ padding: '12px' }}>{s.centre_name || s.centre_id}</td>
                        <td style={{ padding: '12px' }}>{s.service_name}</td>
                        <td style={{ padding: '12px' }}>{s.device_category}</td>
                        <td style={{ padding: '12px' }}>{s.estimated_duration_minutes} min</td>
                        <td style={{ padding: '12px' }}>{s.is_available ? 'âœ…' : 'âŒ'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


