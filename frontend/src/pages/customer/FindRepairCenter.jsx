import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { StatusBadge, Stars, Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

export default function FindRepairCenter() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("");

  useEffect(() => {
    api("repairCenters").then((d) => { setCenters(d); setLoading(false); });
  }, []);

  const filtered = centers.filter(
    (c) => c.name.toLowerCase().includes(filter.toLowerCase()) || c.address.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <PageWrap>
      <SectionTitle sub="Visit any of our authorized service centers.">Find a Repair Centre</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
        {/* List */}
        <div>
          <input className="form-input" placeholder="Search by name or location…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginBottom: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loading
              ? [1, 2, 3].map((i) => <div key={i} className="card sk" style={{ height: 180 }} />)
              : filtered.map((c) => (
                  <div key={c.id} className="card card-hover" style={{ padding: "18px 20px", border: `1.5px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{c.name}</div>
                      <StatusBadge status={c.status === "Open" ? "confirmed" : "pending"} />
                    </div>
                    <div style={{ color: T.muted, fontSize: ".82rem", marginBottom: 6 }}><i className="fas fa-map-marker-alt" style={{ marginRight: 6 }}></i>{c.address}</div>
                    <div style={{ color: T.muted, fontSize: ".82rem", marginBottom: 10 }}><i className="fas fa-clock" style={{ marginRight: 6 }}></i>{c.hours} · <i className="fas fa-phone" style={{ marginRight: 6 }}></i>{c.phone}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {c.specializations.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ fontSize: ".8rem" }}><Stars rating={c.rating} /><span style={{ marginLeft: 5, color: T.muted }}>{c.rating} ({c.reviews})</span></div>
                      <span style={{ fontSize: ".78rem", color: c.capacity.includes("Full") ? T.red : T.green }}>• {c.capacity}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book Appointment</button>
                      <button className="btn btn-outline btn-sm"><i className="fas fa-phone" style={{ marginRight: 6 }}></i>Call</button>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="card" style={{ background: T.navy, minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 20, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 30% 40%,rgba(29,78,216,.3) 0%,transparent 60%),radial-gradient(circle at 70% 70%,rgba(14,165,233,.2) 0%,transparent 50%)` }} />
          <div style={{ textAlign: "center", color: "#fff", zIndex: 1 }}>
            <div style={{ fontSize: "3rem", marginBottom: 14, color: T.blue }}><i className="fas fa-map"></i></div>
            <div style={{ fontFamily: "Fraunces,serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>Interactive Map</div>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".85rem" }}>Repair centres near you</p>
          </div>
          {[{ top: "30%", left: "35%", c: "#ef4444" }, { top: "55%", left: "60%", c: "#f59e0b" }, { top: "70%", left: "30%", c: "#06b6d4" }].map((p, i) => (
            <div key={i} style={{ position: "absolute", top: p.top, left: p.left, width: 16, height: 16, background: p.c, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", border: "2px solid rgba(255,255,255,.8)" }} />
          ))}
        </div>
      </div>
    </PageWrap>
  );
}
