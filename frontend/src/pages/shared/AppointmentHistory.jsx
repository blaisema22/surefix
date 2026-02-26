import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { StatusBadge, statusConfig, Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

const ALL_STATUSES = ["all","in_progress","confirmed","pending","completed"];

export default function AppointmentHistory({ role }) {
  const [apts, setApts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  useEffect(() => {
    const key = role === "shop" ? "shopAppointments" : "appointments";
    api(key).then((d) => { setApts(d); setLoading(false); });
  }, [role]);

  const filtered = filter === "all" ? apts : apts.filter((a) => a.status === filter);

  return (
    <PageWrap>
      <SectionTitle sub={role === "shop" ? "Manage all incoming repair bookings." : "View and manage all your repair appointments."}>
        {role === "shop" ? "Appointments" : "My Appointments"}
      </SectionTitle>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {ALL_STATUSES.map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      {loading
        ? [1, 2, 3].map((i) => <div key={i} className="card sk" style={{ height: 80, marginBottom: 10 }} />)
        : filtered.length === 0
          ? (
            <div className="card empty-state">
              <div className="empty-icon">📋</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>No appointments found</div>
              <p style={{ color: T.muted, fontSize: ".875rem" }}>Try changing the filter or book a new appointment.</p>
            </div>
          )
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((a) => (
                <div key={a.id} className="card" style={{ padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
                      {role === "shop" ? (
                        <>
                          <div>
                            <div style={{ fontWeight: 700 }}>{a.customerName}</div>
                            <div style={{ color: T.muted, fontSize: ".8rem" }}>{a.phone}</div>
                            <div style={{ marginTop: 5, fontSize: ".78rem" }}>{a.date} · {a.time}</div>
                          </div>
                          <div><span style={{ fontSize: ".75rem", color: T.muted, fontWeight: 600 }}>DEVICE</span><br /><span style={{ fontWeight: 600, fontSize: ".85rem" }}>{a.device}</span></div>
                          <div><span style={{ fontSize: ".75rem", color: T.muted, fontWeight: 600 }}>SERVICE</span><br /><span style={{ fontWeight: 600, fontSize: ".85rem" }}>{a.service}</span></div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div style={{ fontWeight: 700 }}>{a.shop}</div>
                            <div style={{ color: T.muted, fontSize: ".8rem" }}>{a.address}</div>
                            <div style={{ marginTop: 5, fontSize: ".78rem" }}>{a.date} · {a.time}</div>
                          </div>
                          <div><span style={{ fontSize: ".75rem", color: T.muted, fontWeight: 600 }}>DEVICE</span><br /><span style={{ fontWeight: 600, fontSize: ".85rem" }}>{a.device}</span></div>
                          <div><span style={{ fontSize: ".75rem", color: T.muted, fontWeight: 600 }}>SERVICE</span><br /><span style={{ fontWeight: 600, fontSize: ".85rem" }}>{a.service}</span></div>
                        </>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <StatusBadge status={a.status} />
                      {role === "shop" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm">Update</button>
                          <button className="btn btn-danger btn-sm">Cancel</button>
                        </div>
                      )}
                      {role === "customer" && a.status !== "completed" && (
                        <button className="btn btn-danger btn-sm">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }
    </PageWrap>
  );
}
