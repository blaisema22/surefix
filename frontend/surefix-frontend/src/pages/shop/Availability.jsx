import React, { useState, useEffect, useCallback } from 'react';
import { getMyCentre, updateMyCentre } from '../../api/shop';
import { Power, ShieldCheck, Info } from 'lucide-react';
import '../../styles/sf-pages.css';

const availStyles = `
.avail-toggle-card {
  background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
  border-radius:20px; padding:32px; text-align:center; position:relative; overflow:hidden;
  transition:border-color 0.3s;
}
.avail-toggle-card.open  { border-color:rgba(34,197,94,0.25); }
.avail-toggle-card.closed{ border-color:rgba(239,68,68,0.2); }
.avail-status-badge {
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 20px; border-radius:30px; margin-bottom:24px;
  font-size:13px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;
}
.avail-status-badge.open  { background:rgba(34,197,94,0.12);  color:rgba(74,222,128,0.9);  border:1px solid rgba(34,197,94,0.22);  }
.avail-status-badge.closed{ background:rgba(239,68,68,0.08);   color:rgba(252,165,165,0.85);border:1px solid rgba(239,68,68,0.18); }
.avail-big-status {
  font-size:48px; font-weight:800; letter-spacing:-2px; line-height:1;
  margin-bottom:28px;
}
.avail-big-status.open  { color:#4ade80; }
.avail-big-status.closed{ color:#f87171; }
.avail-dot { width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:4px; }
.avail-dot.open  { background:#22c55e; box-shadow:0 0 10px rgba(34,197,94,0.6); animation:sf-pulse 2s infinite; }
.avail-dot.closed{ background:#ef4444; }
.avail-toggle-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  padding:13px 36px; border-radius:14px; border:none;
  font-family:'Outfit',sans-serif; font-size:14px; font-weight:700; cursor:pointer;
  transition:all 0.2s; min-width:160px;
}
.avail-toggle-btn.to-close { background:rgba(239,68,68,0.1); color:rgba(252,165,165,0.85); border:1px solid rgba(239,68,68,0.2); }
.avail-toggle-btn.to-close:hover { background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4); color:#fca5a5; }
.avail-toggle-btn.to-open  { background:rgba(34,197,94,0.1);  color:rgba(74,222,128,0.85);  border:1px solid rgba(34,197,94,0.2); }
.avail-toggle-btn.to-open:hover  { background:rgba(34,197,94,0.2);  border-color:rgba(34,197,94,0.4);  color:#4ade80; }
.avail-toggle-btn:disabled { opacity:0.4; cursor:not-allowed; }
`;

export default function ShopAvailability() {
    const [centre, setCentre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchCentre = useCallback(async () => {
        try {
        setLoading(true); setError(null);
        const res = await getMyCentre();
        const data = res.data || res;
          if (data.success && data.centre) setCentre(data.centre);
          else setError('Could not fetch your centre profile.');
      } catch (err) { setError(err.response?.data?.message || 'An error occurred.'); }
      finally { setLoading(false); }
  }, []);

    useEffect(() => { fetchCentre(); }, [fetchCentre]);

    const handleToggle = async () => {
        if (!centre) return;
      setSaving(true); setError(null);
      try {
          const updated = { ...centre, is_active: !centre.is_active };
          await updateMyCentre(updated);
          setCentre(updated);
      } catch { setError('Failed to update status. Please try again.'); }
      finally { setSaving(false); }
  };

    const isOpen = centre?.is_active;

    return (
      <>
          <style>{availStyles}</style>
          <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="sf-page-wrap" style={{ maxWidth: 560 }}>

                  {/* Header */}
                  <div className="sf-anim-up" style={{ marginBottom: 28 }}>
                      <span className="sf-eyebrow">Availability</span>
                      <h1 className="sf-page-title">Shop Status</h1>
                      <p className="sf-page-sub">Toggle your shop visibility in customer search results.</p>
                  </div>

                  {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                          <div className="sf-spinner" style={{ width: 32, height: 32 }} />
                      </div>
                  ) : error && !centre ? (
                      <div className="sf-error">{error}</div>
                  ) : (
                      <>
                          {/* Main toggle card */}
                          <div className={`avail-toggle-card ${isOpen ? 'open' : 'closed'} sf-anim-up`}>
                              <div style={{ marginBottom: 10 }}>
                                  <span className={`avail-status-badge ${isOpen ? 'open' : 'closed'}`}>
                                      <span className={`avail-dot ${isOpen ? 'open' : 'closed'}`} />
                                      {isOpen ? 'Accepting Bookings' : 'Hidden from Search'}
                                  </span>
                              </div>
                              <div className={`avail-big-status ${isOpen ? 'open' : 'closed'}`}>
                                  {isOpen ? 'OPEN' : 'CLOSED'}
                              </div>
                              <button
                                  className={`avail-toggle-btn ${isOpen ? 'to-close' : 'to-open'}`}
                                  onClick={handleToggle}
                                  disabled={saving}
                              >
                                  {saving
                                      ? <><span className="sf-spinner" style={{ width: 16, height: 16 }} />Saving…</>
                                      : <><Power size={16} />{isOpen ? 'Close Shop' : 'Open Shop'}</>
                                  }
                              </button>
                          </div>

                          {error && <div className="sf-error" style={{ marginTop: 16 }}>{error}</div>}

                          {/* Info card */}
                          <div className="sf-glass sf-anim-up sf-s2" style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                              <Info size={15} color="rgba(249,115,22,0.6)" style={{ flexShrink: 0, marginTop: 2 }} />
                              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, margin: 0 }}>
                                  When closed, customers cannot find your shop in search or book new appointments.
                                  Existing appointments are <strong style={{ color: 'rgba(255,255,255,0.5)' }}>not affected</strong>.
                              </p>
                          </div>

                          {/* Security note */}
                          <div className="sf-anim-up sf-s3" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }}>
                              <ShieldCheck size={14} color="rgba(249,115,22,0.6)" />
                              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(249,115,22,0.6)' }}>
                                  SureFix Security Protocol 2.5
                              </span>
                          </div>
                      </>
                  )}

              </div>
          </div>
      </>
  );
}