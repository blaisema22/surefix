import React from 'react';
import { MapPin, Phone, Star, Clock, ShieldCheck, ChevronRight, Wrench } from 'lucide-react';

const cardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  .cc-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  @keyframes cc-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .cc-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 24px;
    padding: 24px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all .4s cubic-bezier(0.16, 1, 0.3, 1);
    animation: cc-in .4s ease both;
  }
  .cc-card:hover {
    transform: translateY(-8px) scale(1.01);
    border-color: rgba(255,69,0,0.3);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,69,0,0.1);
    background: rgba(255,255,255,0.04);
  }
  .cc-card.active {
    border-color: var(--sf-accent);
    background: rgba(255,69,0,0.08);
    box-shadow: 0 0 40px rgba(255,69,0,0.15);
  }

  /* glow blob */
  .cc-glow {
    position: absolute; bottom: -60px; right: -60px;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%);
    pointer-events: none; transition: opacity .4s;
  }
  .cc-card:hover .cc-glow { opacity: 2; }

  /* top bar accent */
  .cc-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent);
    border-radius: 22px 22px 0 0;
    opacity: 0; transition: opacity .2s;
  }
  .cc-card:hover::before, .cc-card.active::before { opacity: 1; }

  /* verified badge */
  .cc-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    background: rgba(255,69,0,0.1); border: 1px solid rgba(255,69,0,0.2);
    font-size: 8px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--sf-accent);
    font-family: var(--font-mono);
  }

  /* open pill */
  .cc-open   { background:rgba(34,197,94,.1);  border:1px solid rgba(34,197,94,.2);  color:#4ade80; }
  .cc-closed { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.15); color:#f87171; }
  .cc-open, .cc-closed {
    font-size: 9px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
    padding: 3px 9px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;
  }

  /* rating stars */
  .cc-star-filled { color:#f59e0b; fill:#f59e0b; }
  .cc-star-empty  { color:rgba(255,255,255,0.1); }

  /* info row */
  .cc-info {
    display: flex; align-items: center; gap: 10px;
    font-size: 12.5px; color: rgba(255,255,255,0.4);
    transition: color .15s;
  }
  .cc-card:hover .cc-info { color: rgba(255,255,255,0.6); }
  .cc-info-icon {
    width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
    transition: border-color .15s;
  }
  .cc-card:hover .cc-info-icon { border-color: rgba(249,115,22,0.2); }

  /* category chip */
  .cc-chip {
    font-size: 9px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
    padding: 3px 10px; border-radius: 10px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.35); transition: all .15s;
  }
  .cc-card:hover .cc-chip { border-color: rgba(249,115,22,0.15); color: rgba(255,255,255,0.5); }

  /* action buttons */
  .cc-btn-primary {
    flex: 1; height: 50px; border-radius: 16px; border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 0.15em;
    color: #fff; text-transform: uppercase;
    background: linear-gradient(135deg, var(--sf-accent) 0%, #cc2200 100%);
    box-shadow: 0 8px 24px rgba(255,69,0,0.25);
    transition: all .3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .cc-btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px rgba(255,69,0,0.35); }

  .cc-btn-icon {
    width: 46px; height: 46px; border-radius: 14px; cursor: pointer; border: none;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
    color: rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center;
    transition: all .18s;
  }
  .cc-btn-icon:hover { background: rgba(255,255,255,0.09); color: #fff; border-color: rgba(255,255,255,0.16); }

  /* distance badge */
  .cc-dist {
    font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: .5px;
  }
`;

const Stars = ({ rating }) => {
  const n = Math.round(Number(rating) || 0);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11} className={i <= n ? 'cc-star-filled' : 'cc-star-empty'} />
      ))}
    </div>
  );
};

const isOpenNow = (open, close, workingDays) => {
  if (!open || !close) return null;
  const now = new Date();

  if (workingDays) {
    const dayStr = now.toLocaleDateString('en-US', { weekday: 'short' });
    if (!workingDays.includes(dayStr)) return false;
  }

  const cur = now.getHours() * 60 + now.getMinutes();
  const [oH, oM] = open.split(':').map(Number);
  const [cH, cM] = close.split(':').map(Number);
  // TEMPORARY: Forcing true for now as requested by user for testing/presentation
  return true; 
  // return cur >= oH * 60 + (oM || 0) && cur < cH * 60 + (cM || 0);
};

const CentreCard = ({ centre, isActive, onView, onBook, isPublic, style }) => {
  const rating   = centre.rating ? +centre.rating : 4.8;
  const reviews  = centre.review_count || 0;
  const services = Array.isArray(centre.services) ? centre.services : [];
  const chips    = [...new Set(services.map(s => s.device_category).filter(Boolean))].slice(0, 3);
  if (chips.length === 0) chips.push('Smartphone', 'Laptop');

  const openStatus = isOpenNow(centre.opening_time, centre.closing_time, centre.working_days);

  const fmt = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m || 0).padStart(2,'0')} ${ampm}`;
  };

  return (
    <div className="cc-root" style={style}>
      <style>{cardStyles}</style>
      <div
        className={`cc-card ${isActive ? 'active' : ''}`}
        onClick={onView}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onView?.()}
        aria-label={`View details for ${centre.name}`}
      >
        <div className="cc-glow" />

        {/* ── Top Row ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div style={{ flex:1, paddingRight:12 }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', margin:0, letterSpacing:'-0.3px', lineHeight:1.2 }}>
              {centre.name}
            </h3>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
              <Stars rating={rating} />
              <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)' }}>
                {rating.toFixed(1)}
                <span style={{ marginLeft:4, opacity:0.5 }}>({reviews})</span>
              </span>
              {centre.distance_km != null && (
                <span className="cc-dist">{Number(centre.distance_km).toFixed(1)} km</span>
              )}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
            <span className="cc-badge">
              <ShieldCheck size={9} /> Verified
            </span>
            {openStatus !== null && (
              <span className={openStatus ? 'cc-open' : 'cc-closed'}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
                {openStatus ? `Open until ${fmt(centre.closing_time)}` : `Closed until ${fmt(centre.opening_time)}`}
              </span>
            )}
          </div>
        </div>

        {/* ── Info Rows ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          <div className="cc-info">
            <div className="cc-info-icon"><MapPin size={13} color="#f97316" opacity={0.7} /></div>
            <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {centre.address}
            </span>
          </div>
          {centre.phone && (
            <div className="cc-info">
              <div className="cc-info-icon"><Phone size={13} color="#22c55e" opacity={0.7} /></div>
              <span>{centre.phone}</span>
            </div>
          )}
          {(centre.opening_time || centre.closing_time) && (
            <div className="cc-info">
              <div className="cc-info-icon"><Clock size={13} color="#60a5fa" opacity={0.7} /></div>
              <span>{fmt(centre.opening_time)} – {fmt(centre.closing_time)}</span>
            </div>
          )}
        </div>

        {/* ── Service Chips ── */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginRight:2 }}>
            <Wrench size={11} color="rgba(249,115,22,0.4)" />
          </div>
          {chips.map(chip => (
            <span key={chip} className="cc-chip">{chip}</span>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ height:1, background:'rgba(255,255,255,0.05)', marginBottom:16 }} />

        {/* ── Actions ── */}
        <div style={{ display:'flex', gap:10 }}>
          <button
            className="cc-btn-primary"
            onClick={e => { e.stopPropagation(); onBook(centre.centre_id); }}
            aria-label={isPublic ? 'Register to book' : 'Book appointment'}
          >
            {isPublic ? 'Register to Book' : 'Book Appointment'}
            <ChevronRight size={14} />
          </button>
          <button
            className="cc-btn-icon"
            onClick={e => { e.stopPropagation(); onView(); }}
            aria-label="More info"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CentreCard;
