import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { appointmentAPI } from '../../api/appointments.api';
import { timeAgo } from '../../utils/time';
import { ArrowLeft, Mail, Phone, Calendar, Clock, MapPin, Hash } from 'lucide-react';
import '../../styles/sf-pages.css';

const STATUS_STYLES = {
    pending: { bg: 'rgba(245,158,11,0.1)', color: 'rgba(251,191,36,0.85)', label: 'Pending' },
    confirmed: { bg: 'rgba(59,130,246,0.1)', color: 'rgba(96,165,250,0.85)', label: 'Confirmed' },
    in_progress: { bg: 'rgba(139,92,246,0.1)', color: 'rgba(167,139,250,0.85)', label: 'In Progress' },
    completed: { bg: 'rgba(34,197,94,0.1)', color: 'rgba(74,222,128,0.85)', label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.08)', color: 'rgba(252,165,165,0.75)', label: 'Cancelled' },
};

const CustomerDetail = () => {
    const location = useLocation();
    const customer = location.state?.customer;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      if (!customer) { setError('No customer data. Go back and try again.'); setLoading(false); return; }
      (async () => {
          try {
              const res = await appointmentAPI.getShopAppointments();
              if (res.success) setAppointments((res.appointments || []).filter(a => a.user_id === customer.user_id));
              else setError('Failed to load appointment history.');
          } catch { setError('An error occurred while fetching appointments.'); }
          finally { setLoading(false); }
      })();
  }, [customer]);

    if (!customer) return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">
                <div className="sf-empty">
                    <div className="sf-empty-title">Customer Not Found</div>
                    <p className="sf-empty-sub">{error}</p>
                    <Link to="/shop/customers" className="sf-btn-primary" style={{ textDecoration: 'none' }}>
                        Back to Customers
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
      <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="sf-page-wrap">

              {/* Back */}
              <Link to="/shop/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: 24, fontWeight: 600, transition: 'color 0.18s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(249,115,22,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                  <ArrowLeft size={14} /> Back to Customers
              </Link>

              {/* Header */}
              <div className="sf-anim-up" style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,rgba(249,115,22,0.25),rgba(234,88,12,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#f97316', flexShrink: 0 }}>
                          {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <h1 className="sf-page-title" style={{ margin: 0 }}>{customer.name}</h1>
                          <p className="sf-page-sub" style={{ margin: 0 }}>Customer profile</p>
                      </div>
                  </div>
              </div>

              {/* 2-col layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, alignItems: 'start' }}>

                  {/* Profile card */}
                  <div className="sf-glass sf-anim-up sf-s1">
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>Details</div>
                      {[
                          { Icon: Mail, label: 'Email', value: customer.email },
                          { Icon: Phone, label: 'Phone', value: customer.phone || 'N/A' },
                          { Icon: Calendar, label: 'Member Since', value: customer.member_since ? new Date(customer.member_since).toLocaleDateString() : 'N/A' },
                          { Icon: Hash, label: 'Total Bookings', value: customer.total_bookings },
                          { Icon: Clock, label: 'Last Visit', value: timeAgo(customer.last_appointment || customer.last_visit) },
                      ].map(({ Icon, label, value }) => (
                          <div key={label} style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <Icon size={10} /> {label}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{value}</div>
                          </div>
                      ))}
                  </div>

                  {/* Appointment history */}
                  <div className="sf-anim-up sf-s2">
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 14 }}>
                          Appointment History ({appointments.length})
                      </div>

                      {loading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {[1, 2, 3].map(i => <div key={i} className="sf-skeleton" style={{ height: 80 }} />)}
                          </div>
                      ) : error ? (
                          <div className="sf-error">{error}</div>
                      ) : appointments.length === 0 ? (
                          <div className="sf-empty">
                              <div className="sf-empty-icon"><Calendar size={20} /></div>
                              <p className="sf-empty-sub" style={{ marginBottom: 0 }}>No appointment history for this customer.</p>
                          </div>
                      ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                          {appointments.map((app, i) => {
                                              const st = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
                                              return (
                                                  <div key={app.appointment_id} className={`sf-glass sf-anim-up sf-s${Math.min(i + 1, 6)}`} style={{ padding: '16px 18px' }}>
                                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{app.service_name}</span>
                                                          <span style={{ padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                              {st.label}
                                                          </span>
                                                      </div>
                                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                                                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                                              <Calendar size={10} /> {new Date(app.appointment_date).toLocaleDateString()}
                                                          </span>
                                                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                                              <Clock size={10} /> {(app.appointment_time || '').slice(0, 5)}
                                                          </span>
                                                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                                                              {app.device_brand} {app.device_model}
                                                          </span>
                                                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.5px' }}>
                                                              #{app.booking_reference}
                                                          </span>
                                                      </div>
                      </div>
                    );
                })}
                                      </div>
                      )}
                  </div>

              </div>
          </div>
      </div>
  );
};

export default CustomerDetail;