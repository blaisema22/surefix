import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../../utils/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending: 'Pending Approval',
  confirmed: 'Approved',
  cancelled: 'Not Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{STATUS_LABELS[status] || status.replace('_', ' ')}</span>
);

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];
const TAB_STATUSES = {
  Upcoming: ['pending', 'confirmed', 'in_progress'],
  Completed: ['completed'],
  Cancelled: ['cancelled'],
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [cancelling, setCancelling] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.appointments);
    } catch {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(id);
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled. A confirmation email has been sent.');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = tab === 'All'
    ? appointments
    : appointments.filter(a => TAB_STATUSES[tab].includes(a.status));

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)' }}>My Appointments</h2>
            <p>View and manage all your repair bookings</p>
          </div>
          <Link to="/search" className="btn btn-primary">+ New Appointment</Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
          {TABS.map(t => {
            const count = t === 'All' ? appointments.length
              : appointments.filter(a => TAB_STATUSES[t].includes(a.status)).length;
            return (
              <button
                key={t}
                className={`btn btn-ghost btn-sm`}
                style={{
                  borderRadius: '8px 8px 0 0', paddingBottom: 12,
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                }}
                onClick={() => setTab(t)}
              >
                {t} {count > 0 && <span style={{
                  marginLeft: 4, background: tab === t ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: tab === t ? 'white' : 'var(--text-muted)',
                  borderRadius: 10, padding: '1px 6px', fontSize: 11,
                }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Appointments list */}
        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="icon">ðŸ“…</div>
              <h3>No appointments found</h3>
              {tab === 'All' ? (
                <p>You haven't booked any appointments yet.</p>
              ) : (
                <p>No {tab.toLowerCase()} appointments.</p>
              )}
              <Link to="/search" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                Find a Repair Centre
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(a => (
              <div key={a.appointment_id} className="card appt-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="appt-ref">REF: {a.booking_reference}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {a.service_name}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      ðŸ“ {a.centre_name}
                    </div>
                    <div className="appt-meta">
                      <span className="appt-meta-item">ðŸ“… {format(parseISO(a.appointment_date), 'EEE, MMM d yyyy')}</span>
                      <span className="appt-meta-item">â° {formatTime(a.appointment_time)}</span>
                      <span className="appt-meta-item">ðŸ“± {a.device_brand} {a.device_model}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <StatusBadge status={a.status} />
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(a.appointment_id)}
                        disabled={cancelling === a.appointment_id}
                      >
                        {cancelling === a.appointment_id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
                {a.notes && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-muted)' }}>
                    ðŸ“ {a.notes}
                  </div>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  ðŸ“ž {a.centre_phone} Â· Booked on {format(parseISO(a.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




