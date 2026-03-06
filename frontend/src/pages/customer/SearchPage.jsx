import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { centreAPI } from '../../utils/api';

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --navy: #0f1f3d;
    --navy-mid: #162847;
    --blue: #1a6fd4;
    --blue-light: #3b8fee;
    --accent: #00c2ff;
    --surface: #f4f7fb;
    --card: #ffffff;
    --text: #0d1b2a;
    --muted: #6b7f97;
    --border: #dce5f0;
  }

  .find-centers-page {
    min-height: 100vh;
    background: var(--surface);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
  }

  .find-centers-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px 60px;
  }

  .find-centers-header {
    margin-bottom: 28px;
  }

  .find-centers-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    font-style: italic;
    color: var(--text);
  }

  .find-centers-header p {
    color: var(--muted);
    font-size: 0.92rem;
    margin-top: 4px;
  }

  .find-centers-layout {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: 24px;
    align-items: start;
  }

  .centers-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .center-card {
    background: var(--card);
    border-radius: 16px;
    padding: 20px 22px;
    border: 1.5px solid var(--border);
    transition: border-color .2s, box-shadow .2s, transform .2s;
    cursor: pointer;
    animation: fadeUp .4s ease both;
  }

  .center-card:hover,
  .center-card.active {
    border-color: var(--blue-light);
    box-shadow: 0 6px 24px rgba(26,111,212,.12);
    transform: translateY(-2px);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 8px;
  }

  .center-name {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text);
  }

  .distance-badge {
    background: #eff6ff;
    color: var(--blue);
    font-size: .75rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    white-space: nowrap;
  }

  .center-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-size: .83rem;
  }

  .meta-icon {
    width: 18px;
    display: inline-flex;
    justify-content: center;
  }

  .card-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn-open {
    flex: 1;
    min-width: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 9px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    transition: background .18s, border-color .18s;
    text-decoration: none;
  }

  .btn-open:hover {
    background: var(--surface);
    border-color: var(--blue-light);
  }

  .btn-open .open-dot {
    width: 22px;
    height: 22px;
    background: var(--blue);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 11px;
  }

  .btn-book {
    background: var(--blue);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 9px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .18s, transform .15s;
  }

  .btn-book:hover {
    background: var(--blue-light);
    transform: scale(1.03);
  }

  .map-panel {
    background: var(--card);
    border-radius: 20px;
    overflow: hidden;
    border: 1.5px solid var(--border);
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    animation: fadeUp .4s .1s ease both;
    position: sticky;
    top: 80px;
  }

  .map-header {
    background: var(--navy);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .map-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    color: #fff;
    font-size: .95rem;
    letter-spacing: .5px;
  }

  .map-tabs {
    display: flex;
    background: rgba(255,255,255,.12);
    border-radius: 8px;
    overflow: hidden;
  }

  .map-tab {
    background: none;
    border: none;
    color: rgba(255,255,255,.6);
    font-family: 'DM Sans', sans-serif;
    font-size: .75rem;
    font-weight: 600;
    padding: 5px 12px;
  }

  .map-tab.active {
    background: var(--accent);
    color: #fff;
  }

  .map-frame-wrap {
    height: 380px;
    position: relative;
    overflow: hidden;
  }

  .map-frame {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  .selected-centre-label {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(0,194,255,.18);
    border: 1px solid rgba(0,194,255,.3);
    border-radius: 8px;
    padding: 4px 10px;
    color: #00c2ff;
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .5px;
    max-width: calc(100% - 28px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .map-footer {
    padding: 12px 18px;
    background: var(--navy-mid);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .severity-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .75rem;
    color: rgba(255,255,255,.6);
  }

  .sev-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .sev-high { background: #ef4444; }
  .sev-med { background: #f59e0b; }
  .sev-low { background: #22c55e; }

  .map-alert {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 10px 18px;
    font-size: .8rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .map-alert strong {
    color: var(--blue);
  }

  .state-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    color: var(--muted);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1024px) {
    .find-centers-layout { grid-template-columns: 1fr; }
    .map-panel { position: static; }
  }
`;

const formatTime = (value) => {
  if (!value) return 'N/A';
  const [h = '00', m = '00'] = value.split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  const labelHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${labelHour}:${m} ${period}`;
};

const formatPhoneHref = (phone) => (phone ? `tel:${phone.replace(/\s+/g, '')}` : '#');
const buildMapSrc = (centre) => {
  if (!centre) return 'https://maps.google.com/maps?q=Kigali&z=12&output=embed';
  if (centre.latitude && centre.longitude) {
    return `https://maps.google.com/maps?q=${centre.latitude},${centre.longitude}&z=15&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(centre.address || centre.name || 'Kigali')}&z=15&output=embed`;
};

export default function SearchPage() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCentres = async () => {
      setLoading(true);
      try {
        const res = await centreAPI.getAll();
        const fetched = res.data?.centres || [];
        const visible = fetched.filter((centre) => centre.is_visible !== false);
        setCentres(visible);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load repair centers.');
        setCentres([]);
      } finally {
        setLoading(false);
      }
    };

    loadCentres();
  }, []);

  const selectedCentre = useMemo(() => centres[selectedIndex] || null, [centres, selectedIndex]);
  const mapSrc = useMemo(() => buildMapSrc(selectedCentre), [selectedCentre]);

  return (
    <div className="find-centers-page page">
      <style>{PAGE_STYLES}</style>

      <main className="find-centers-main container">
        <div className="find-centers-header">
          <h1>Find a Repair Center</h1>
          <p>Visit any of our authorized service centers for on-the-spot diagnostics.</p>
        </div>

        {loading ? (
          <div className="state-card">Loading repair centers...</div>
        ) : centres.length === 0 ? (
          <div className="state-card">No repair centers available right now.</div>
        ) : (
          <div className="find-centers-layout">
            <div className="centers-list">
              {centres.map((centre, index) => (
                <div
                  key={centre.centre_id || index}
                  className={`center-card${selectedIndex === index ? ' active' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="card-top">
                    <span className="center-name">{centre.name}</span>
                    <span className="distance-badge">{centre.district || 'Centre'}</span>
                  </div>

                  <div className="center-meta">
                    <div className="meta-row">
                      <span className="meta-icon">??</span>
                      <span>{centre.address || 'Address unavailable'}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-icon">??</span>
                      <span>{centre.phone || 'Phone unavailable'}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-icon">??</span>
                      <span>{formatTime(centre.opening_time)} - {formatTime(centre.closing_time)}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <Link
                      className="btn-open"
                      to={`/centres/${centre.centre_id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open
                      <span className="open-dot">?</span>
                    </Link>
                    <button
                      type="button"
                      className="btn-book"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${centre.centre_id}`);
                      }}
                    >
                      Book Repair
                    </button>
                    <a
                      className="btn-open"
                      href={formatPhoneHref(centre.phone)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Call
                      <span className="open-dot">?</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="map-panel">
              <div className="map-header">
                <span className="map-title">REPAIR CENTERS MAP</span>
                <div className="map-tabs">
                  <button className="map-tab active" type="button">MAP</button>
                  <button className="map-tab" type="button">LIVE</button>
                  <button className="map-tab" type="button">LIST</button>
                </div>
              </div>

              <div className="map-frame-wrap">
                <iframe
                  key={selectedCentre?.centre_id || 'map-default'}
                  className="map-frame"
                  title={selectedCentre?.name ? `Map for ${selectedCentre.name}` : 'Repair centers map'}
                  src={mapSrc}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="selected-centre-label">
                  {selectedCentre?.name || 'No center selected'}
                </div>
              </div>

              <div className="map-footer">
                <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.72rem', fontWeight: 600, marginRight: 4 }}>Severity:</span>
                <span className="severity-item"><span className="sev-dot sev-high"></span>High</span>
                <span className="severity-item"><span className="sev-dot sev-med"></span>Medium</span>
                <span className="severity-item"><span className="sev-dot sev-low"></span>Low</span>
              </div>

              <div className="map-alert">
                <span>?</span>
                {selectedCentre?.address ? (
                  <>
                    {selectedCentre.address}: <strong>{selectedCentre.description || 'Authorized repair center near you.'}</strong>
                  </>
                ) : (
                  <>Select a center to view details.</>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

