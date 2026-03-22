import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import '../../styles/sf-pages.css';

const STATUS_CLASSES = {
    pending: 'sf-badge-pending',
    confirmed: 'sf-badge-confirmed',
    in_progress: 'sf-badge-progress',
};

const UpcomingAppointments = ({ appointments = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="sf-glass sf-anim-up" style={{ marginTop: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="rgba(249,115,22,0.7)" />
                    <span className="sf-glass-title" style={{ margin: 0 }}>Upcoming Appointments</span>
                </div>
                <button
                    className="sf-btn-ghost"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={() => navigate('/shop/appointments')}
                >
                    View All <ChevronRight size={13} />
                </button>
            </div>

            {appointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {appointments.map((app, i) => {
                        const d = new Date(app.appointment_date);
                        const month = d.toLocaleString('default', { month: 'short' });
                        const day = d.getDate();
                        const time = (app.appointment_time || '').substring(0, 5);
                        const statusCls = STATUS_CLASSES[app.status] || 'sf-badge-completed';

                        return (
                            <div key={app.appointment_id} className={`sf-appt-row sf-anim-up sf-s${Math.min(i + 1, 6)}`}>
                                {/* Date block */}
                                <div className="sf-date-block" style={{ flexShrink: 0 }}>
                                    <div className="sf-date-month">{month}</div>
                                    <div className="sf-date-day">{day}</div>
                                    <div className="sf-date-time">{time}</div>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {app.service_name}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                            {app.customer_name}
                                        </span>
                                        {app.device_brand && (
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                                                {app.device_brand} {app.device_model}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Badge */}
                                <span className={`sf-badge ${statusCls}`} style={{ flexShrink: 0 }}>
                                    {app.status.replace('_', ' ')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="sf-empty" style={{ padding: '36px 24px' }}>
                    <div className="sf-empty-icon"><Calendar size={20} /></div>
                    <div className="sf-empty-title" style={{ fontSize: 13 }}>No upcoming appointments</div>
                    <p className="sf-empty-sub" style={{ fontSize: 12, marginBottom: 0 }}>When customers book, their appointments will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingAppointments;