import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { centreAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { smartphone: 'fa-mobile-alt', tablet: 'fa-tablet-alt', laptop: 'fa-laptop', desktop: 'fa-desktop', other: 'fa-wrench' };

const groupByCategory = (services) =>
  services.reduce((acc, s) => {
    if (!acc[s.device_category]) acc[s.device_category] = [];
    acc[s.device_category].push(s);
    return acc;
  }, {});

export default function CentreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [centre, setCentre] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    centreAPI.getById(id)
      .then(res => { setCentre(res.data.centre); setServices(res.data.services); })
      .catch(() => toast.error('Centre not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;
  if (!centre) return <div className="page"><div className="container page-inner"><p>Centre not found.</p></div></div>;

  const grouped = groupByCategory(services);

  const handleBook = () => {
    if (!user) {
      toast.error('Please sign up or log in to book an appointment.');
      // Save intended destination so user lands back here after login
      sessionStorage.setItem('surefix_redirect', `/book/${id}`);
      navigate('/register');
      return;
    }
    navigate(`/book/${id}`);
  };

  return (
    <div className="page">
      <div className="container page-inner">
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          â† Back to Search
        </button>

        {/* Centre header */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>{centre.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}><i className="fas fa-map-marker-alt"></i> {centre.address}{centre.district ? `, ${centre.district}` : ''}</span>
                {centre.phone && <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}><i className="fas fa-phone"></i> {centre.phone}</span>}
                {centre.email && <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}><i className="fas fa-envelope"></i> {centre.email}</span>}
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  <i className="fas fa-clock"></i> Open: {centre.opening_time?.slice(0,5)} â€“ {centre.closing_time?.slice(0,5)} Â· {centre.working_days || 'Mon-Sat'}
                </span>
              </div>
              {centre.description && (
                <p style={{ marginTop: 16, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
                  {centre.description}
                </p>
              )}
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleBook}>
              <i className="fas fa-calendar-check"></i> Book Appointment
            </button>
          </div>
        </div>

        {/* Google Maps embed (if lat/lng available) */}
        {centre.latitude && centre.longitude && (
          <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <iframe
              title="Repair Centre Location"
              width="100%" height="280"
              frameBorder="0" style={{ border: 0, display: 'block' }}
              src={`https://www.google.com/maps?q=${centre.latitude},${centre.longitude}&z=16&output=embed`}
              allowFullScreen
            />
          </div>
        )}

        {/* Services */}
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 24 }}>Available Services ({services.length})</h3>

          {Object.keys(grouped).length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fas fa-wrench"></i></div>
              <h3>No services listed yet</h3>
              <p>Contact the centre directly for service information.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, svcList]) => (
              <div key={category} style={{ marginBottom: 32 }}>
                <h4 style={{
                  color: 'var(--text-primary)', fontSize: 14, textTransform: 'uppercase',
                  letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span><i className={`fas ${CATEGORY_ICONS[category]}`}></i></span> {category}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {svcList.map(s => (
                    <div key={s.service_id} className="card" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.service_name}</div>
                          {s.description && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.description}</div>}
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                            <i className="fas fa-clock"></i> Est. {s.estimated_duration_minutes < 60 ? `${s.estimated_duration_minutes}min` : `${Math.round(s.estimated_duration_minutes / 60)}h`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={handleBook}>
            <i className="fas fa-calendar-check"></i> Book an Appointment at {centre.name}
          </button>
        </div>
      </div>
    </div>
  );
}


