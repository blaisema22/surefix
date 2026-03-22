import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { centreAPI as centerAPI } from '../../api/centres.api';
import {
    Search, X, MapPin, Phone, Clock, Star,
    ArrowRight, ShieldCheck, CheckCircle, Wrench, ChevronRight
} from 'lucide-react';
import CentreCard from '../../components/repair/CentreCard';

/* ─────────────────────────────────────────────
   Styles
   ───────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.frd-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

@keyframes frd-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes frd-right {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
.frd-fade  { animation: frd-up    0.4s ease both; }
.frd-slide { animation: frd-right 0.35s ease both; }
.frd-s1 { animation-delay: 0.04s; }
.frd-s2 { animation-delay: 0.10s; }
.frd-s3 { animation-delay: 0.16s; }
.frd-s4 { animation-delay: 0.22s; }
.frd-s5 { animation-delay: 0.28s; }

/* ── Search bar ── */
.frd-search-wrap {
  position: relative; max-width: 600px; margin: 0 auto 32px;
}
.frd-search-input {
  width: 100%; height: 52px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px; outline: none;
  padding: 0 46px 0 48px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px; color: rgba(255,255,255,0.8);
  transition: border-color 0.2s, background 0.2s;
}
.frd-search-input::placeholder { color: rgba(255,255,255,0.22); }
.frd-search-input:focus {
  border-color: rgba(249,115,22,0.45);
  background: rgba(249,115,22,0.04);
}
.frd-search-icon {
  position: absolute; left: 16px; top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.25); pointer-events: none;
  transition: color 0.2s;
}
.frd-search-wrap:focus-within .frd-search-icon { color: rgba(249,115,22,0.7); }
.frd-clear-btn {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.25); padding: 4px;
  border-radius: 6px; display: flex; align-items: center;
  transition: color 0.18s;
}
.frd-clear-btn:hover { color: rgba(255,255,255,0.6); }

/* ── Centre card ── */
.frd-centre-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px; padding: 22px 24px;
  display: flex; align-items: center;
  justify-content: space-between; gap: 20px;
  transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
  cursor: pointer; position: relative; overflow: hidden;
}
.frd-centre-card::before {
  content: ''; position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #f97316, #ea580c);
  opacity: 0; transition: opacity 0.22s;
}
.frd-centre-card:hover {
  border-color: rgba(249,115,22,0.22);
  transform: translateX(4px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.25);
}
.frd-centre-card:hover::before { opacity: 1; }

.frd-centre-avatar {
  width: 50px; height: 50px; border-radius: 14px;
  background: rgba(249,115,22,0.12);
  display: flex; align-items: center; justify-content: center;
  color: #f97316; flex-shrink: 0;
  font-size: 18px; font-weight: 800;
}
.frd-centre-name {
  font-size: 16px; font-weight: 700; color: #fff;
  letter-spacing: -0.2px; margin-bottom: 4px;
}
.frd-centre-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
}
.frd-meta-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 500;
}
.frd-verified-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 3px 10px; border-radius: 20px;
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.2);
  color: rgba(74,222,128,0.8);
}
.frd-book-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 11px; border: none;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff; font-family: 'Outfit', sans-serif;
  font-size: 12.5px; font-weight: 700; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(249,115,22,0.28);
  transition: all 0.18s;
}
.frd-book-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(249,115,22,0.38); }

/* ── Skeleton ── */
.frd-skeleton {
  height: 90px; border-radius: 18px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  animation: frd-pulse 1.6s ease infinite;
}
@keyframes frd-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ── Empty ── */
.frd-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 24px; text-align: center;
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 20px;
  background: rgba(255,255,255,0.015);
}

/* ── Side panel overlay ── */
.frd-overlay-bg {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  z-index: 99;
}
.frd-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 100%; max-width: 460px;
  background: #0d1424;
  border-left: 1px solid rgba(255,255,255,0.07);
  display: flex; flex-direction: column;
  z-index: 100; overflow: hidden;
}

/* panel scrollbar */
.frd-panel-scroll::-webkit-scrollbar { width: 3px; }
.frd-panel-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

.frd-panel-header {
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.frd-panel-close {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.3); font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 500; padding: 6px 10px;
  border-radius: 8px; border: 1px solid rgba(255,255,255,0.07);
  transition: all 0.18s;
}
.frd-panel-close:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }

.frd-panel-body { flex: 1; overflow-y: auto; padding: 24px; }

/* info grid in panel */
.frd-info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;
}
.frd-info-tile {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 13px; padding: 14px 16px;
}
.frd-info-tile-label {
  font-size: 9px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: rgba(255,255,255,0.2);
  margin-bottom: 6px;
}
.frd-info-tile-value {
  font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75);
  display: flex; align-items: center; gap: 7px;
}

/* service row */
.frd-service-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px; border-radius: 12px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 8px;
  transition: border-color 0.18s;
}
.frd-service-row:hover { border-color: rgba(249,115,22,0.2); }
.frd-service-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
.frd-service-cat  { font-size: 10px; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-top: 2px; }
.frd-service-price { font-size: 13px; font-weight: 700; color: #f97316; white-space: nowrap; }

/* CTA card in panel */
.frd-cta-card {
  margin-top: 24px; padding: 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(234,88,12,0.1) 100%);
  border: 1px solid rgba(249,115,22,0.2);
  position: relative; overflow: hidden;
}
.frd-cta-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.frd-cta-sub   { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 20px; line-height: 1.5; }
.frd-cta-btn {
  width: 100%; padding: 13px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff; font-family: 'Outfit', sans-serif;
  font-size: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 6px 20px rgba(249,115,22,0.35);
  transition: all 0.2s;
}
.frd-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(249,115,22,0.45); }
`;

/* ─────────────────────────────────────────────
   CentreListCard (inline, consistent with design)
   ───────────────────────────────────────────── */
const CentreListCard = ({ centre, onView, onBook, index }) => {
    const initials = centre.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'RC';

    return (
        <div className={`frd-centre-card frd-fade frd-s${Math.min(index + 1, 5)}`} onClick={() => onView(centre)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                <div className="frd-centre-avatar">{initials}</div>
                <div style={{ minWidth: 0 }}>
                    <div className="frd-centre-name">{centre.name}</div>
                    <div className="frd-centre-meta">
                        {centre.address && (
                            <span className="frd-meta-item">
                                <MapPin size={12} /> {centre.address}
                            </span>
                        )}
                        {centre.phone && (
                            <span className="frd-meta-item">
                                <Phone size={12} /> {centre.phone}
                            </span>
                        )}
                        <span className="frd-verified-badge">
                            <CheckCircle size={10} /> Verified
                        </span>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button
                    className="frd-book-btn"
                    onClick={(e) => { e.stopPropagation(); onBook(centre.centre_id); }}
                >
                    Book <ArrowRight size={13} />
                </button>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────── */
const FindRepairDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [centers, setCenters] = useState([]);
    const [originalCenters, setOriginalCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCentre, setActiveCentre] = useState(null);
    const navigate = useNavigate();

    const fetchCentres = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const res = await centerAPI.getCentres(params);
            if (res.data.success) {
                setCenters(res.data.centres || []);
                if (!params.search) setOriginalCenters(res.data.centres || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCentres(); }, [fetchCentres]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        const timer = setTimeout(() => {
            if (val.trim() === '') setCenters(originalCenters);
            else fetchCentres({ search: val });
        }, 500);
        return () => clearTimeout(timer);
    };

    const clearSearch = () => { setSearchTerm(''); setCenters(originalCenters); };

    // Close panel on Escape
    useEffect(() => {
        const handle = (e) => { if (e.key === 'Escape') setActiveCentre(null); };
        document.addEventListener('keydown', handle);
        return () => document.removeEventListener('keydown', handle);
    }, []);

    return (
        <>
            <style>{styles}</style>
            <div className="frd-root" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <main style={{ width: '100%', maxWidth: 820, padding: '36px 40px 60px' }}>

                    {/* ── Header ── */}
                    <header className="frd-fade" style={{ marginBottom: 28, textAlign: 'center' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(249,115,22,0.75)', marginBottom: 8 }}>
                            Service Network
                        </p>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', margin: '0 0 8px', lineHeight: 1.1 }}>
                            Find a Repair Centre
                        </h1>
                        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                            Search verified repair centres near you and book your slot in seconds.
                        </p>
                    </header>

                    {/* ── Search ── */}
                    <div className="frd-search-wrap frd-fade frd-s1">
                        <Search size={17} className="frd-search-icon" />
                        <input
                            id="centre-search"
                            type="text"
                            className="frd-search-input"
                            placeholder="Search by name or location…"
                            value={searchTerm}
                            onChange={handleSearch}
                            aria-label="Search repair centres"
                        />
                        {searchTerm && (
                            <button className="frd-clear-btn" onClick={clearSearch} aria-label="Clear search">
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* ── Results count ── */}
                    {!loading && centers.length > 0 && (
                        <div className="frd-fade" style={{ marginBottom: 14, fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.2)' }}>
                            {searchTerm ? centers.length : Math.min(centers.length, 2)} centre{centers.length !== 1 ? 's' : ''} found
                        </div>
                    )}

                    {/* ── List ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="frd-skeleton" />)
                        ) : centers.length > 0 ? (
                            (searchTerm ? centers : centers.slice(0, 2)).map((c, i) => (
                                <CentreListCard
                                    key={c.centre_id}
                                    centre={c}
                                    index={i}
                                    onView={setActiveCentre}
                                    onBook={(id) => navigate(`/book-repair/${id}`)}
                                />
                            ))
                        ) : (
                            <div className="frd-empty frd-fade">
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
                                    <Search size={24} />
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>No centres found</div>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', maxWidth: 280, lineHeight: 1.55 }}>
                                    Try a different name or location to find repair centres near you.
                                </p>
                            </div>
                        )}
                    </div>

                </main>
            </div>

            {/* ── Side panel ── */}
            {activeCentre && (
                <>
                    <div className="frd-overlay-bg" onClick={() => setActiveCentre(null)} />
                    <div
                        className="frd-panel frd-slide"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Details for ${activeCentre.name}`}
                    >
                        {/* Panel header */}
                        <div className="frd-panel-header">
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(249,115,22,0.7)', marginBottom: 4 }}>
                                    Centre Details
                                </div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                                    {activeCentre.name}
                                </div>
                            </div>
                            <button className="frd-panel-close" onClick={() => setActiveCentre(null)}>
                                <X size={15} /> Close
                            </button>
                        </div>

                        {/* Panel body */}
                        <div className="frd-panel-body frd-panel-scroll">

                            {/* Verified + address */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <span className="frd-verified-badge">
                                    <CheckCircle size={10} /> Verified Centre
                                </span>
                                {activeCentre.address && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                                        <MapPin size={12} color="#f97316" /> {activeCentre.address}
                                    </span>
                                )}
                            </div>

                            {/* Info tiles */}
                            <div className="frd-info-grid">
                                <div className="frd-info-tile">
                                    <div className="frd-info-tile-label">Contact</div>
                                    <div className="frd-info-tile-value">
                                        <Phone size={13} color="#f97316" />
                                        {activeCentre.phone || '+250 78 000 1234'}
                                    </div>
                                </div>
                                <div className="frd-info-tile">
                                    <div className="frd-info-tile-label">Hours Today</div>
                                    <div className="frd-info-tile-value">
                                        <Clock size={13} color="#f97316" />
                                        9:00 AM – 7:00 PM
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div style={{ marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <ShieldCheck size={15} color="#f97316" />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Services Offered</span>
                                </div>

                                {activeCentre.services?.length > 0 ? (
                                    activeCentre.services.map((s, idx) => (
                                        <div key={idx} className="frd-service-row">
                                            <div>
                                                <div className="frd-service-name">{s.service_name}</div>
                                                <div className="frd-service-cat">{s.device_category}</div>
                                            </div>
                                            <div className="frd-service-price">
                                                {s.base_price ? `${Number(s.base_price).toLocaleString()} RWF` : 'Inquire'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', padding: '12px 0' }}>
                                        General hardware & software repairs available.
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="frd-cta-card">
                                <div className="frd-cta-title">Ready to fix it?</div>
                                <p className="frd-cta-sub">
                                    Book your slot at {activeCentre.name} and skip the queue.
                                </p>
                                <button
                                    className="frd-cta-btn"
                                    onClick={() => navigate(`/book-repair/${activeCentre.centre_id}`)}
                                >
                                    Book Appointment <ArrowRight size={16} />
                                </button>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default FindRepairDashboard;