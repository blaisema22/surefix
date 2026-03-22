import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { centreAPI as centerAPI } from '@/api/centres.api';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin, Search, Phone, Star, Clock, X, Compass, Map,
  SlidersHorizontal, Locate, ChevronRight, Wrench, Zap,
} from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import CentreCard from '@/components/repair/CentreCard';
import { reviewsAPI } from '@/api/reviews.api';

/* ─── Helpers ─── */
const buildMapSrc = (centre, apiKey) => {
  if (!apiKey) return null;
  if (centre?.latitude && centre?.longitude)
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${centre.latitude},${centre.longitude}&zoom=15`;
  if (centre?.address)
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(centre.address)}&zoom=15`;
  return null;
};

const dirUrl = (c) => c
  ? (c.latitude && c.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address || '')}`)
  : null;

/* ─── inline styles ─── */
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .fr-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  @keyframes fr-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fr-root { animation: fr-up .4s ease both; }

  /* hero gradient */
  .fr-hero {
    background: radial-gradient(ellipse 120% 60% at 50% -10%, rgba(255,69,0,0.1) 0%, transparent 65%);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 0 0 32px;
    margin-bottom: 32px;
  }

  /* search bar */
  .fr-search {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px; padding: 0 24px;
    height: 64px;
    transition: all .4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
  .fr-search:focus-within {
    border-color: rgba(255,69,0,0.4);
    background: rgba(255,255,255,0.04);
    box-shadow: 0 12px 40px rgba(255,69,0,0.1);
  }
  .fr-search input {
    flex: 1; background: none; border: none; outline: none;
    font-size: 15px; color: #fff;
    font-family: 'Outfit', sans-serif;
  }
  .fr-search input::placeholder { color: rgba(255,255,255,0.2); }

  /* category filter chip */
  .fr-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 12px; cursor: pointer;
    font-size: 11px; font-weight: 600; letter-spacing: .4px; text-transform: capitalize;
    color: rgba(255,255,255,0.45);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    transition: all .18s; white-space: nowrap; user-select: none;
  }
  .fr-chip:hover { border-color: rgba(255,69,0,0.3); color: #fff; }
  .fr-chip.active {
    background: rgba(255,69,0,0.1);
    border-color: rgba(255,69,0,0.4);
    color: var(--sf-accent);
  }

  /* locate btn */
  .fr-locate {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 14px; cursor: pointer;
    font-size: 12px; font-weight: 600; letter-spacing: .3px;
    color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    transition: all .18s; white-space: nowrap;
  }
  .fr-locate:hover { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.25); color: #f97316; }
  .fr-locate:disabled { opacity: .4; cursor: not-allowed; }

  /* count badge */
  .fr-count {
    font-size: 10px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    display: flex; align-items: center; gap: 6px;
  }
  .fr-count-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #f97316;
    animation: fr-pulse 2s infinite;
  }
  @keyframes fr-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* map panel */
  .fr-map-panel {
    position: sticky; top: 24px;
    height: calc(100vh - 140px);
    border-radius: 22px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    display: flex; flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.3);
  }
  .fr-map-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 32px; text-align: center;
    background: rgba(10,15,26,0.8);
  }
  .fr-map-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(10,15,26,0.95);
    backdrop-filter: blur(20px);
  }

  /* skeleton */
  .fr-skel {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 22px; padding: 24px;
    animation: fr-shimmer 1.6s infinite;
  }
  @keyframes fr-shimmer { 0%,100%{opacity:.4} 50%{opacity:.7} }
  .fr-skel-line { height: 12px; background: rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 10px; }

  /* drawer */
  .fr-drawer {
    position: fixed; inset: 0; z-index: 100; display: flex; justify-content: flex-end;
  }
  .fr-drawer-bg {
    position: absolute; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
  }
  .fr-drawer-panel {
    position: relative; width: 100%; max-width: 460px;
    background: #0d1322; border-left: 1px solid rgba(255,255,255,0.07);
    height: 100%; display: flex; flex-direction: column;
    animation: fr-slide-in .25s ease both;
    box-shadow: -20px 0 60px rgba(0,0,0,0.5);
  }
  @keyframes fr-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }

  /* drawer sections */
  .fr-section-label {
    font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    color: rgba(255,255,255,0.2); margin-bottom: 12px;
  }
  .fr-info-tile {
    padding: 14px 16px; border-radius: 14px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  }
  .fr-review-tile {
    padding: 14px 16px; border-radius: 14px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  }

  /* empty state */
  .fr-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 32px; text-align: center; gap: 14px;
    border: 1px dashed rgba(255,255,255,0.07); border-radius: 22px;
  }
`;

/* ─── Skeleton ─── */
const Skeleton = () => (
  <div className="fr-skel">
    <div className="fr-skel-line" style={{ width:'55%' }} />
    <div className="fr-skel-line" style={{ width:'35%' }} />
    <div style={{ marginTop:16, marginBottom:16, height:1, background:'rgba(255,255,255,0.04)' }} />
    <div className="fr-skel-line" style={{ width:'80%' }} />
    <div className="fr-skel-line" style={{ width:'60%' }} />
    <div style={{ display:'flex', gap:8, marginTop:16 }}>
      <div className="fr-skel-line" style={{ width:70, height:28, marginBottom:0 }} />
      <div className="fr-skel-line" style={{ width:70, height:28, marginBottom:0 }} />
    </div>
    <div style={{ marginTop:16, height:44, background:'rgba(255,255,255,0.04)', borderRadius:12 }} />
  </div>
);

/* ─── Map Panel ─── */
const MapPanel = ({ centre, apiKey }) => {
  const src = centre ? buildMapSrc(centre, apiKey) : null;
  const dir = dirUrl(centre);
  return (
    <div className="fr-map-panel">
      {centre && src ? (
        <>
          <iframe
            key={src} className="flex-1 w-full border-none block"
            style={{ filter:'invert(90%) hue-rotate(180deg)', opacity:.9 }}
            title={`Map — ${centre.name}`} src={src}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="fr-map-footer">
            <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 2px' }}>{centre.name}</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:'0 0 14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{centre.address}</p>
            <div style={{ display:'flex', gap:10 }}>
              <a href={dir} target="_blank" rel="noopener noreferrer"
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  height:42, borderRadius:12, background:'linear-gradient(135deg, var(--sf-accent), #cc2200)',
                  color:'#fff', fontSize:11, fontWeight:800, letterSpacing:'.1em', textDecoration:'none', textTransform:'uppercase' }}>
                <Compass size={14} strokeWidth={2.5} /> Deploy Path
              </a>
              {centre.phone && (
                <a href={`tel:${centre.phone}`}
                  style={{ width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>
                  <Phone size={15} />
                </a>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="fr-map-empty">
          <div style={{ width:56, height:56, borderRadius:16, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MapPin size={24} color="#f97316" />
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.6)', margin:0 }}>
            {centre ? centre.name : 'Hover a centre'}
          </p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', margin:0, lineHeight:1.6, maxWidth:180 }}>
            {centre ? 'Loading map preview…' : 'Hover over any repair card to preview its location here.'}
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── Detail Drawer ─── */
const DetailDrawer = ({ centre, onClose, onBook, isPublic }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (centre) closeBtnRef.current?.focus();
  }, [centre]);

  useEffect(() => {
    if (!centre) return;
    setLoading(true);
    reviewsAPI.getCentreReviews(centre.centre_id)
      .then(r => { if (r.data.success) setReviews(r.data.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [centre]);

  useEffect(() => {
    if (!centre) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [centre, onClose]);

  if (!centre) return null;

  const dir = dirUrl(centre);
  const rating = centre.rating ? +centre.rating : 0;

  return (
    <div className="fr-drawer">
      <div className="fr-drawer-bg" onClick={onClose} />
      <div className="fr-drawer-panel" role="dialog" aria-modal="true" aria-label={`Details: ${centre.name}`}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(249,115,22,0.75)', display:'block', marginBottom:4 }}>
              Repair Centre
            </span>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:0, letterSpacing:'-0.5px' }}>{centre.name}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} style={{ color: i <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,0.1)', fill: i <= Math.round(rating) ? '#f59e0b' : 'none' }} />
              ))}
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>{rating.toFixed(1)} ({centre.review_count || 0} reviews)</span>
            </div>
          </div>
          <button ref={closeBtnRef} onClick={onClose}
            style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginLeft:12 }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:24 }}>

          {/* Info tiles */}
          <div>
            <p className="fr-section-label">Contact & Hours</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon: <MapPin size={15} color="#f97316" />, label:'Address', value: centre.address },
                { icon: <Phone size={15} color="#22c55e" />, label:'Phone', value: centre.phone || 'N/A' },
                { icon: <Clock size={15} color="#60a5fa" />, label:'Opens', value: centre.opening_time || 'N/A' },
                { icon: <Clock size={15} color="#60a5fa" />, label:'Closes', value: centre.closing_time || 'N/A' },
              ].map(row => (
                <div key={row.label} className="fr-info-tile">
                  <div style={{ marginBottom:6 }}>{row.icon}</div>
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', margin:'0 0 3px' }}>{row.label}</p>
                  <p style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.75)', margin:0, wordBreak:'break-word' }}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {centre.description && (
            <div>
              <p className="fr-section-label">About</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, margin:0 }}>{centre.description}</p>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <p className="fr-section-label" style={{ margin:0 }}>Customer Reviews</p>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(249,115,22,0.7)', background:'rgba(249,115,22,0.1)', padding:'3px 8px', borderRadius:8, border:'1px solid rgba(249,115,22,0.18)' }}>
                ★ {rating.toFixed(1)} · {centre.review_count || 0}
              </span>
            </div>

            {loading ? (
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', textAlign:'center', padding:'16px 0' }}>Loading reviews…</p>
            ) : reviews.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {reviews.map((r, i) => (
                  <div key={i} className="fr-review-tile">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                          {r.customer_name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{r.customer_name}</span>
                      </div>
                      <div style={{ display:'flex', gap:2 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={9} style={{ color: s <= r.rating ? '#f59e0b' : 'rgba(255,255,255,0.1)', fill: s <= r.rating ? '#f59e0b' : 'none' }} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0, lineHeight:1.6, fontStyle:'italic' }}>"{r.comment}"</p>}
                    <p style={{ fontSize:9, color:'rgba(255,255,255,0.2)', margin:'6px 0 0', textTransform:'uppercase', letterSpacing:'.5px', fontWeight:600 }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'20px', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:14 }}>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', margin:0 }}>No reviews yet</p>
              </div>
            )}
          </div>

          {/* Inline Footer actions (Moved from sticky bottom) */}
          <div style={{ padding:'16px 0', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:10, marginTop:'auto' }}>
            <a href={dir} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:48, borderRadius:14,
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700, textDecoration:'none', textTransform:'uppercase', letterSpacing:'.4px', transition:'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
            >
              <Compass size={15} /> Directions
            </a>
            <button onClick={() => onBook(centre.centre_id)}
              style={{ flex:1.6, height:48, borderRadius:14, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg, var(--sf-accent), #cc2200)',
                color:'#fff', fontSize:12, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase',
                boxShadow:'0 8px 24px rgba(255,69,0,0.25)', transition:'all .3s cubic-bezier(0.16, 1, 0.3, 1)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(255,69,0,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 24px rgba(255,69,0,0.25)'; }}
            >
              {isPublic ? 'Initiate Access' : 'Secure Booking'}
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Category Filter Chips ─── */
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Smartphone', value: 'smartphone' },
  { label: 'Laptop', value: 'laptop' },
  { label: 'Tablet', value: 'tablet' },
  { label: 'Desktop', value: 'desktop' },
];

/* ─── Main Component ─── */
const FindRepair = () => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [category, setCategory]         = useState('');
  const [centers, setCenters]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [locating, setLocating]         = useState(false);
  const [drawerCentre, setDrawerCentre] = useState(null);
  const [hoveredCentre, setHoveredCentre] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const navigate = useNavigate();
  const { user } = useAuth();
  const { show, ToastContainer } = useToast();
  const isPublic = !user;

  const fetchCentres = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await centerAPI.getCentres(params);
      if (res.data.success) setCenters(res.data.centres || []);
    } catch {
      show('Failed to load centres', 'error');
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!userLocation) fetchCentres({ search: searchTerm, category: category || undefined });
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, category, userLocation, fetchCentres]);

  const handleLocate = () => {
    if (!navigator.geolocation) return show('Geolocation not supported', 'error');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);
        fetchCentres({ ...loc, radius: 10 });
        setLocating(false);
      },
      () => { show('Could not get your location', 'error'); setLocating(false); }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    fetchCentres({ search: searchTerm });
  };

  const handleBook = (id) => {
    if (!user) navigate('/register');
    else navigate(`/book-repair/${id}`);
  };

  const displayed = searchTerm || category || userLocation ? centers : centers.slice(0, 2);

  return (
    <>
      <style>{S}</style>
      <div className="fr-root" style={{ minHeight:'100vh' }}>
        <ToastContainer />

        {/* ── Page Header / Hero ── */}
        <div className="fr-hero">
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 28px 0' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
              <div>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'1.4px', textTransform:'uppercase', color:'rgba(249,115,22,0.75)', marginBottom:6, margin:'0 0 6px' }}>
                  Repair Network
                </p>
                <h1 style={{ fontSize:34, fontWeight:800, color:'#fff', letterSpacing:'-1px', lineHeight:1.1, margin:'0 0 8px', fontFamily:'Outfit,sans-serif' }}>
                  Find a Repair Centre
                </h1>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.3)', margin:0 }}>
                  Discover certified repair partners near you — book in seconds.
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:24, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.18)' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block', boxShadow:'0 0 8px rgba(34,197,94,0.5)' }} />
                <span style={{ fontSize:11, fontWeight:600, color:'rgba(74,222,128,0.8)', letterSpacing:'.5px' }}>All Centres Live</span>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ maxWidth:680 }}>
              <div className="fr-search">
                <Search size={18} color="rgba(255,255,255,0.25)" />
                <input
                  id="find-search"
                  type="text"
                  placeholder="Search by name, district, or service…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', display:'flex' }}>
                    <X size={16} />
                  </button>
                )}
                <div style={{ width:1, height:28, background:'rgba(255,255,255,0.08)', margin:'0 4px' }} />
                <button
                  className="fr-locate"
                  style={{ border:'none', background:'none', padding:'6px 12px' }}
                  onClick={userLocation ? handleClearLocation : handleLocate}
                  disabled={locating}
                  title={userLocation ? 'Clear location filter' : 'Use my location'}
                >
                  <Locate size={14} color={userLocation ? '#f97316' : undefined} />
                  {locating ? 'Locating…' : userLocation ? 'Near Me ✓' : 'Near Me'}
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingTop:16, paddingBottom:2, scrollbarWidth:'none' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`fr-chip ${category === cat.value ? 'active' : ''}`}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.value && <Wrench size={10} />}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 28px 60px' }}>

          {/* Result count */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div className="fr-count">
              <span className="fr-count-dot" />
              {loading ? 'Searching…' : `${displayed.length} centre${displayed.length !== 1 ? 's' : ''} found`}
            </div>
            {userLocation && (
              <button onClick={handleClearLocation} style={{ fontSize:11, fontWeight:600, color:'rgba(249,115,22,0.7)', background:'none', border:'none', cursor:'pointer', letterSpacing:'.4px' }}>
                Clear location ×
              </button>
            )}
          </div>

          {/* Two-column layout: cards + map */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:20, alignItems:'start' }}>

            {/* Cards List */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {loading ? (
                [1,2].map(i => <Skeleton key={i} />)
              ) : displayed.length > 0 ? (
                displayed.map((c, i) => (
                  <div
                    key={c.centre_id}
                    style={{ animationDelay:`${i * 60}ms`,
                      transform: hoveredCentre?.centre_id === c.centre_id ? 'translateX(4px)' : undefined,
                      transition: 'transform .2s' }}
                    onMouseEnter={() => setHoveredCentre(c)}
                  >
                    <CentreCard
                      centre={c}
                      isActive={drawerCentre?.centre_id === c.centre_id}
                      onView={() => setDrawerCentre(c)}
                      onBook={handleBook}
                      isPublic={isPublic}
                    />
                  </div>
                ))
              ) : (
                <div className="fr-empty">
                  <div style={{ width:60, height:60, borderRadius:18, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Search size={24} color="rgba(255,255,255,0.15)" />
                  </div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.5)', margin:'0 0 6px' }}>No centres found</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', margin:0, lineHeight:1.6, maxWidth:250 }}>
                      Try adjusting your search terms or removing filters.
                    </p>
                  </div>
                  <button onClick={() => { setSearchTerm(''); setCategory(''); }}
                    style={{ padding:'10px 24px', borderRadius:12, background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.25)', color:'#f97316', fontSize:12, fontWeight:700, cursor:'pointer', letterSpacing:'.4px' }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Map Panel — hidden on mobile */}
            <div style={{ display:'none' }} className="lg-map-col">
              <MapPanel centre={hoveredCentre || displayed[0]} apiKey={MAPS_API_KEY} />
            </div>
            <div className="hidden lg:block">
              <MapPanel centre={hoveredCentre || displayed[0]} apiKey={MAPS_API_KEY} />
            </div>
          </div>
        </div>

        {/* Detail Drawer */}
        {drawerCentre && (
          <DetailDrawer
            centre={drawerCentre}
            onClose={() => setDrawerCentre(null)}
            onBook={handleBook}
            isPublic={isPublic}
          />
        )}
      </div>
    </>
  );
};

export default FindRepair;
