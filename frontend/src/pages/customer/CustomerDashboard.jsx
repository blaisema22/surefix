import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, centreAPI, deviceAPI } from '../../utils/api';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = Number(h);
  if (Number.isNaN(hr)) return t;
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [apptsRes, devicesRes, centresRes] = await Promise.all([
          appointmentAPI.getAll(),
          deviceAPI.getAll(),
          centreAPI.getAll(),
        ]);

        if (cancelled) return;

        setAppointments(apptsRes.data?.appointments || []);
        setDevices(devicesRes.data?.devices || []);
        setCentres(centresRes.data?.centres || []);
      } catch (err) {
        if (!cancelled) {
          toast.error(err.response?.data?.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const today = startOfDay(new Date());

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        if (!appt?.appointment_date) return false;
        try {
          return isAfter(parseISO(appt.appointment_date), today) || appt.status === 'pending' || appt.status === 'confirmed';
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
  }, [appointments, today]);

  const completedRepairs = useMemo(
    () => appointments.filter((appt) => appt.status === 'completed').length,
    [appointments]
  );

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container page-inner">
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h2>
          <p>Your repair activity at a glance.</p>
        </div>

        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card">
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Registered Devices</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{devices.length}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Upcoming Appointments</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{upcomingAppointments.length}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Completed Repairs</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{completedRepairs}</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>Upcoming appointments</h3>
            <Link to="/appointments" className="btn btn-ghost btn-sm">View all</Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="empty-state" style={{ padding: '12px 0' }}>
              <div className="icon"><i className="fas fa-calendar-check"></i></div>
              <h3>No upcoming appointments</h3>
              <p>Book your next repair appointment when you are ready.</p>
              <Link to="/search" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Find a Repair Centre
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingAppointments.slice(0, 3).map((appt) => (
                <div key={appt.appointment_id} className="appt-card" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{appt.service_name || 'Repair Service'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {appt.centre_name || 'Service centre'}
                  </div>
                  <div className="appt-meta">
                    <span className="appt-meta-item">
                      <i className="fas fa-calendar"></i>{' '}
                      {appt.appointment_date ? format(parseISO(appt.appointment_date), 'EEE, MMM d yyyy') : 'Date not set'}
                    </span>
                    <span className="appt-meta-item">
                      <i className="fas fa-clock"></i>{' '}
                      {formatTime(appt.appointment_time) || 'Time not set'}
                    </span>
                    {appt.device_brand && (
                      <span className="appt-meta-item">
                        <i className="fas fa-mobile-alt"></i>{' '}
                        {appt.device_brand} {appt.device_model}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid-3">
          <Link to="/search" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>Find Repair Centres</div>
            <p style={{ margin: 0 }}>Browse {centres.length} available centres.</p>
          </Link>
          <Link to="/devices" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>Manage Devices</div>
            <p style={{ margin: 0 }}>Add, edit, and track your devices.</p>
          </Link>
          <Link to="/profile" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>Profile Settings</div>
            <p style={{ margin: 0 }}>Update your account details.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
