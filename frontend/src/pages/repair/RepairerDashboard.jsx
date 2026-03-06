import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { repairerAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ðŸ ' },
  { id: 'appointment', label: 'Appointment', icon: 'ðŸ“…' },
  { id: 'devices', label: 'Services', icon: 'ðŸ’»' },
  { id: 'customers', label: 'Customers', icon: 'ðŸ‘¥' },
  { id: 'status', label: 'Status', icon: 'ðŸ“Š' },
  { id: 'profile', label: 'Profile', icon: 'ðŸ‘¤' },
  { id: 'reports', label: 'Reports', icon: 'ðŸ“‹' },
  { id: 'settings', label: 'Settings', icon: 'âš™ï¸' },
];

const statusColor = (s) => {
  if (s === 'Completed') return { bg: '#d1fae5', color: '#065f46' };
  if (s === 'In Progress' || s === 'Pending' || s === 'Confirmed') return { bg: '#dbeafe', color: '#1e40af' };
  if (s === 'Cancelled') return { bg: '#fee2e2', color: '#991b1b' };
  return { bg: '#f3f4f6', color: '#374151' };
};

function Sidebar({ active, setPage }) {
  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: 'linear-gradient(180deg,#15253f 0%,#3761a5 100%)',
      display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 8, flexShrink: 0,
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, fontStyle: 'italic', marginBottom: 28, paddingLeft: 8, letterSpacing: -0.5 }}>SureFix</div>
      {NAV_ITEMS.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => setPage(id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
            background: isActive ? '#fff' : 'transparent',
            color: isActive ? '#1a3a6b' : '#b8cce4',
            border: isActive ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: isActive ? 700 : 500,
            transition: 'all 0.18s', textAlign: 'left',
          }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
        background: 'transparent', color: '#b8cce4', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
      }}>ðŸšª Logout</button>
    </aside>
  );
}

function Topbar({ title, user }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {title ? <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, fontStyle: 'italic' }}>{title}</h1> : <div />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9',
          border: '1px solid #e2e8f0', borderRadius: 24, padding: '7px 16px',
        }}>
          <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 14, width: 160, background: 'transparent' }} />
          <span style={{ fontSize: 16 }}>ðŸ”</span>
        </div>
        <span style={{ fontSize: 22, cursor: 'pointer' }}>ðŸ””</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {user?.name?.charAt(0) || 'R'}
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{user?.name?.split(' ')[0] || 'Repairer'}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ setPage, appointments, services, centre, openServiceModal, handleDeleteService }) {
  const upcoming = useMemo(() => {
    const next = [...appointments]
      .filter(a => a.status !== 'cancelled')
      .sort((a, b) => new Date(a.appointment_date || '') - new Date(b.appointment_date || ''));
    return next[0];
  }, [appointments]);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Dashboard" />
      <div style={{ padding: '32px 36px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>Welcome back{centre?.name ? `, ${centre.name}` : ''}</h2>
        <p style={{ color: '#64748b', margin: '0 0 28px', fontSize: 15 }}>Here is a quick overview of your operations.</p>
        <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
          {[
            { val: services.length, label: 'Services Listed' },
            { val: appointments.length, label: 'Total Appointments' },
            { val: completed, label: 'Completed Repairs' },
          ].map(({ val, label }) => (
            <div key={label} style={{
              flex: 1, background: '#fff', borderRadius: 18, padding: '28px 20px',
              boxShadow: '0 2px 16px rgba(30,58,107,0.08)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#2563eb' }}>{val}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
          <button onClick={() => setPage('devices')} style={{
            flex: 1, background: '#fff', borderRadius: 18, padding: '28px 24px',
            boxShadow: '0 2px 16px rgba(30,58,107,0.08)', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>ðŸ“‹</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Manage Services</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Keep your service list up to date.</div>
          </button>
          <button onClick={() => setPage('appointment')} style={{
            flex: 1.2, background: 'linear-gradient(135deg,#e8eef7,#dce6f5)', borderRadius: 18, padding: '28px 24px',
            boxShadow: '0 2px 16px rgba(30,58,107,0.08)', border: '2px solid #bfcfe8', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>ðŸ“</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Find a Repair Centre</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Share availability instantly.</div>
          </button>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px', textAlign: 'left', boxShadow: '0 2px 16px rgba(30,58,107,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 22 }}>Next Appointment</div>
            <span style={{ fontSize: 14, color: '#64748b' }}>{pending} pending</span>
          </div>
          {!upcoming ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>ðŸ“‹</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>No appointments scheduled</div>
              <div style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Once customers book, you will see the details here.</div>
            </>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Customer</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{upcoming.customer_name}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Schedule</div>
                <div style={{ fontWeight: 700 }}>{format(parseISO(upcoming.appointment_date), 'EEE, MMM d')}</div>
                <div style={{ color: '#64748b' }}>{upcoming.appointment_time}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Device</div>
                <div style={{ fontWeight: 700 }}>{upcoming.device_brand} {upcoming.device_model}</div>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32, background: '#fff', borderRadius: 18, padding: '24px', boxShadow: '0 2px 16px rgba(30,58,107,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Services</div>
            <button onClick={() => openServiceModal('new')} style={{
              border: 'none', background: '#2563eb', color: '#fff', borderRadius: 10,
              padding: '8px 16px', cursor: 'pointer', fontWeight: 700,
            }}>+ Add Service</button>
          </div>
          {services.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>No services listed yet. Add one to appear in search.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {services.slice(0, 4).map(service => (
                <div key={service.service_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{service.service_name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{service.device_category} Â· {service.estimated_duration_minutes} min</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openServiceModal(service)} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={() => handleDeleteService(service.service_id)} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              ))}
              {services.length > 4 && <p style={{ fontSize: 12, color: '#94a3b8' }}>Showing latest 4 services.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentSection({ appointments, handleStatusUpdate }) {
  const getDecisionLabel = (status) => {
    if (status === 'confirmed') return 'Approved';
    if (status === 'cancelled') return 'Not Approved';
    if (status === 'pending') return 'Waiting for decision';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'completed') return 'Completed';
    return status;
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Appointments" />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Phone', 'Email', 'Date', 'Time', 'Device', 'Decision'].map(h => (
                  <th key={h} style={{ padding: '16px 18px', textAlign: 'left', fontWeight: 800, fontSize: 13, fontStyle: 'italic' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={a.appointment_id || i} style={{ borderTop: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600 }}>{a.customer_name || '—'}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>{a.customer_phone || '—'}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#2563eb' }}>{a.customer_email || '—'}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>{a.appointment_date ? format(parseISO(a.appointment_date), 'MMM d, yyyy') : '—'}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>{formatTime(a.appointment_time)}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>{a.device_brand || 'Device'} {a.device_model || ''}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>
                    {a.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(a.appointment_id, 'confirmed')}>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(a.appointment_id, 'cancelled')}>
                          Not Approve
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#1e40af', fontSize: 12 }}>
                        {getDecisionLabel(a.status)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersSection({ customers }) {
  const [list, setList] = useState(customers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', phone: '', status: 'Pending' });

  useEffect(() => setList(customers), [customers]);

  const add = () => {
    if (!form.name.trim()) return;
    setList(prev => [...prev, { ...form }]);
    setForm({ name: '', location: '', phone: '', status: 'Pending' });
    setShowModal(false);
  };

  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Customers" />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button onClick={() => setShowModal(true)} style={{
            background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>+ Add Customer</button>
        </div>
        <div style={{ background: '#e8eef7', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Location', 'Phone', 'Status'].map(h => (
                  <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 800, fontSize: 14, fontStyle: 'italic' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '18px 24px', fontSize: 14 }}>{c.name}</td>
                  <td style={{ padding: '18px 24px', fontSize: 14, color: '#64748b' }}>{c.location}</td>
                  <td style={{ padding: '18px 24px', fontSize: 14 }}>{c.phone}</td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      ...statusColor(c.status), textTransform: 'capitalize',
                    }}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 20px', fontWeight: 800 }}>Add Customer</h3>
              {['name', 'location', 'phone'].map((key) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <input value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                    borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none',
                  }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: 12, border: '1.5px solid #e2e8f0', borderRadius: 10,
                  background: '#fff', cursor: 'pointer', fontWeight: 600,
                }}>Cancel</button>
                <button onClick={add} style={{
                  flex: 1, padding: 12, background: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
                }}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusSection({ statusData }) {
  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Status" />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ background: '#e8eef7', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Location', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '16px 28px', textAlign: 'left', fontWeight: 800, fontSize: 14, fontStyle: 'italic' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusData.map((s, i) => (
                <tr key={i} style={{ borderTop: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '20px 28px', fontSize: 14, fontWeight: 600 }}>{s.customer}</td>
                  <td style={{ padding: '20px 28px', fontSize: 14, color: '#64748b' }}>{s.location}</td>
                  <td style={{ padding: '20px 28px', fontSize: 14 }}>{s.date}</td>
                  <td style={{ padding: '20px 28px' }}>
                    <span style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      ...statusColor(s.status),
                    }}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MyDevices({ devices }) {
  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="My Devices" />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {devices.map((d, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 20, padding: '24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '2px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{d.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{d.brand} {d.model}</div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Type: {d.device_type}</div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>Serial: {d.serial}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  ...statusColor(d.status === 'Active' ? 'Completed' : 'Pending'),
                }}>{d.status}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.addedOn}</span>
              </div>
            </div>
          ))}
          <div style={{
            background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: 20, padding: '24px',
            border: '2px dashed #93c5fd', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 160,
          }}>
            <div style={{ fontSize: 36 }}>âž•</div>
            <div style={{ fontWeight: 700, color: '#2563eb' }}>Add New Device</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports({ appointments }) {
  const monthlySeries = useMemo(() => {
    if (!appointments.length) return { labels: [], values: [] };
    const counts = {};
    appointments.forEach(a => {
      if (!a.appointment_date) return;
      const label = format(parseISO(a.appointment_date), 'MMM yyyy');
      counts[label] = (counts[label] || 0) + 1;
    });
    const labels = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b)).slice(-6);
    const values = labels.map(l => counts[l]);
    return { labels, values };
  }, [appointments]);

  const maxValue = Math.max(...monthlySeries.values, 1);

  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Reports" />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, marginBottom: 24 }}>
          {[
            { label: 'Total Appointments', val: appointments.length, icon: 'ðŸ“…', color: '#dbeafe', tc: '#1d4ed8' },
            { label: 'Completed This Week', val: appointments.filter(a => a.status === 'completed').length, icon: 'âœ…', color: '#d1fae5', tc: '#065f46' },
            { label: 'Pending Follow-ups', val: appointments.filter(a => a.status === 'pending').length, icon: 'â³', color: '#fef3c7', tc: '#92400e' },
            { label: 'Cancelled', val: appointments.filter(a => a.status === 'cancelled').length, icon: 'ðŸš«', color: '#fee2e2', tc: '#991b1b' },
          ].map(({ label, val, icon, color, tc }) => (
            <div key={label} style={{
              background: '#fff', borderRadius: 18, padding: '24px 28px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 18,
            }}>
              <div style={{ background: color, borderRadius: 14, padding: '14px 16px', fontSize: 26 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 900, fontSize: 24, color: tc }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 800, margin: '0 0 24px' }}>Monthly Bookings</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160 }}>
            {monthlySeries.labels.map((label, i) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{monthlySeries.values[i]}</div>
                <div style={{
                  width: '100%', borderRadius: '8px 8px 0 0',
                  background: 'linear-gradient(180deg,#3b82f6,#1d4ed8)',
                  height: `${(monthlySeries.values[i] / maxValue) * 120}px`,
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 12, color: '#64748b' }}>{label.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile({ centre, onSave }) {
  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Profile" />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: 24, fontWeight: 800 }}>Repair Centre Details</h3>
          <CentreForm centre={centre} onSave={onSave} />
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const SETTINGS_SCHEMA = [
    { title: 'Notifications', desc: 'Email and SMS alerts for repair updates', key: 'notifications' },
    { title: 'Dark Mode', desc: 'Switch to dark theme', key: 'darkMode' },
    { title: 'Language', desc: 'English (EN)', key: 'language' },
    { title: 'Two-Factor Auth', desc: 'Enhanced account security', key: 'twoFactor' },
  ];
  const [toggles, setToggles] = useState(() => SETTINGS_SCHEMA.map((item, index) => ({
    ...item,
    enabled: index % 2 === 0,
  })));

  const toggle = (key) => {
    setToggles(prev => prev.map(item => item.key === key ? { ...item, enabled: !item.enabled } : item));
  };

  return (
    <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <Topbar title="Settings" />
      <div style={{ padding: '28px 36px' }}>
        {toggles.map(({ title, desc, key, enabled }) => (
          <div key={key} style={{
            background: '#fff', borderRadius: 18, padding: '20px 28px', marginBottom: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{desc}</div>
            </div>
            <div onClick={() => toggle(key)} style={{
              width: 48, height: 26, borderRadius: 13, background: enabled ? '#2563eb' : '#e2e8f0',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: enabled ? 25 : 3,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CentreForm({ centre, onSave }) {
  const emptyForm = {
    name: '', address: '', district: '', latitude: '', longitude: '',
    phone: '', email: '', opening_time: '08:00', closing_time: '18:00',
    working_days: 'Mon-Sat', description: '', is_active: true,
  };
  const [form, setForm] = useState(centre || emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(centre || emptyForm);
  }, [centre]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) { toast.error('Name and address are required.'); return; }
    setLoading(true);
    try {
      if (centre) {
        await repairerAPI.updateMyCentre(form);
        toast.success('Centre updated successfully!');
      } else {
        await repairerAPI.createMyCentre(form);
        toast.success('Repair centre registered!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save centre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Centre Name *</label>
          <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="TechFix Kigali" />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+250788..." />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address *</label>
        <input name="address" className="form-input" value={form.address} onChange={handleChange} placeholder="KG 15 Ave, Remera" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">District</label>
          <input name="district" className="form-input" value={form.district} onChange={handleChange} placeholder="Gasabo" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Latitude (optional)</label>
          <input name="latitude" className="form-input" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="-1.9441" />
        </div>
        <div className="form-group">
          <label className="form-label">Longitude (optional)</label>
          <input name="longitude" className="form-input" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="30.0786" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Opening Time</label>
          <input name="opening_time" className="form-input" type="time" value={form.opening_time} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Closing Time</label>
          <input name="closing_time" className="form-input" type="time" value={form.closing_time} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Working Days</label>
        <input name="working_days" className="form-input" value={form.working_days} onChange={handleChange} placeholder="Mon-Sat" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="About your repair centre..." />
      </div>
      {centre && (
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange} />
          <label htmlFor="is_active" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Centre is open / accepting appointments
          </label>
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : centre ? 'Update Centre' : 'Register Centre'}
      </button>
    </form>
  );
}

function ServiceModal({ service, onClose, onSave }) {
  const DEVICE_TYPES = ['smartphone', 'tablet', 'laptop', 'desktop', 'other'];
  const emptyForm = {
    service_name: '', description: '', device_category: 'smartphone',
    estimated_duration_minutes: 60, is_available: true,
  };
  const [form, setForm] = useState(service || emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(service || emptyForm);
  }, [service]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_name.trim()) { toast.error('Service name required.'); return; }
    setLoading(true);
    try {
      if (service) {
        await repairerAPI.updateService(service.service_id, form);
        toast.success('Service updated!');
      } else {
        await repairerAPI.addService(form);
        toast.success('Service added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: 'var(--text-primary)' }}>{service ? 'Edit Service' : 'Add New Service'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service Name *</label>
              <input name="service_name" className="form-input" value={form.service_name} onChange={handleChange} placeholder="Screen Replacement" />
            </div>
            <div className="form-group">
              <label className="form-label">Device Category *</label>
              <select name="device_category" className="form-select" value={form.device_category} onChange={handleChange}>
                {DEVICE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} style={{ minHeight: 72 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Duration (minutes)</label>
            <input name="estimated_duration_minutes" className="form-input" type="number" value={form.estimated_duration_minutes} onChange={handleChange} />
          </div>
          {service && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" id="svc_avail" name="is_available" checked={form.is_available} onChange={handleChange} />
              <label htmlFor="svc_avail" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Service is available</label>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : service ? 'Update' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RepairerDashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [centre, setCentre] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([repairerAPI.getMyCentre(), repairerAPI.getMyAppointments()]);
      setCentre(cRes.data.centre);
      setServices(cRes.data.services || []);
      setAppointments(aRes.data.appointments || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await repairerAPI.deleteService(id);
      toast.success('Service deleted.');
      fetchAll();
    } catch {
      toast.error('Failed to delete service.');
    }
  };

  const handleStatusUpdate = async (apptId, status) => {
    try {
      await repairerAPI.updateAppointmentStatus(apptId, status);
      toast.success(status === 'confirmed' ? 'Appointment approved.' : status === 'cancelled' ? 'Appointment not approved.' : `Status updated to "${status}"`);
      fetchAll();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const openServiceDialog = (service) => setServiceModal(service || 'new');

  const customers = useMemo(() => {
    const map = new Map();
    appointments.forEach(a => {
      if (!a.customer_name) return;
      const key = a.customer_email || a.customer_phone || a.customer_name;
      if (!map.has(key)) {
        map.set(key, {
          name: a.customer_name,
          location: a.centre_name || centre?.district || 'â€”',
          phone: a.customer_phone || 'â€”',
          status: a.status === 'completed' ? 'Completed' : a.status === 'cancelled' ? 'Cancelled' : 'Pending',
        });
      }
    });
    return Array.from(map.values());
  }, [appointments, centre]);

  const devices = useMemo(() => {
    const map = new Map();
    appointments.forEach(a => {
      const key = `${a.device_brand}-${a.device_model}-${a.device_type}`;
      if (!map.has(key)) {
        map.set(key, {
          brand: a.device_brand || 'Unknown',
          model: a.device_model || 'Device',
          device_type: a.device_type === 'smartphone' ? 'Phone' : a.device_type || 'Other',
          serial: a.device_serial || 'â€”',
          status: a.status === 'completed' ? 'Active' : a.status === 'cancelled' ? 'Inactive' : 'In Repair',
          addedOn: a.created_at ? format(parseISO(a.created_at), 'MMM yyyy') : 'N/A',
          icon: a.device_type === 'phone' ? 'ðŸ“±' : a.device_type === 'laptop' ? 'ðŸ’»' : 'ðŸ–¥ï¸',
        });
      }
    });
    const list = Array.from(map.values());
    if (!list.length) {
      list.push({
        brand: 'No devices yet',
        model: '',
        device_type: 'Other',
        serial: 'â€”',
        status: 'Pending',
        addedOn: format(new Date(), 'MMM yyyy'),
        icon: 'ðŸ–¥ï¸',
      });
    }
    return list;
  }, [appointments]);

  const statusData = useMemo(() => appointments.map(a => ({
    customer: a.customer_name || 'Unknown',
    location: a.centre_name || centre?.district || 'â€”',
    date: a.appointment_date ? format(parseISO(a.appointment_date), 'dd/MM/yyyy') : 'â€”',
    status: a.status === 'cancelled' ? 'Cancelled' : a.status === 'completed' ? 'Completed' : 'In Progress',
  })).slice(0, 6), [appointments, centre]);

  const pageMap = {
    dashboard: <Dashboard setPage={setPage} appointments={appointments} services={services} centre={centre} openServiceModal={openServiceDialog} handleDeleteService={handleDeleteService} />,
    appointment: <AppointmentSection appointments={appointments} handleStatusUpdate={handleStatusUpdate} />,
    devices: <MyDevices devices={devices} />,
    customers: <CustomersSection customers={customers} />,
    status: <StatusSection statusData={statusData} />,
    profile: <Profile centre={centre} onSave={fetchAll} />,
    reports: <Reports appointments={appointments} />,
    settings: <Settings />,
  };

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar active={page} setPage={setPage} />
        {pageMap[page]}
      </div>
      {serviceModal && (
        <ServiceModal
          service={serviceModal === 'new' ? null : serviceModal}
          onClose={() => setServiceModal(null)}
          onSave={() => { setServiceModal(null); fetchAll(); }}
        />
      )}
    </>
  );
}



