import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { StatusBadge, Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

const DEVICE_TYPES = ["Smartphone","Tablet","Laptop","Desktop","Other"];
const BRANDS       = ["Samsung","Apple","Huawei","HP","Dell","Lenovo","Asus","Tecno"];

export default function MyDevices({ onBook }) {
  const [devices, setDevices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ type: "Smartphone", brand: "Samsung", model: "", serial: "", issue: "" });

  useEffect(() => { api("devices").then((d) => { setDevices(d); setLoading(false); }); }, []);

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <PageWrap>
      <SectionTitle
        sub="Manage your registered devices and track their repair history."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Add Device"}
          </button>
        }
      >
        My Devices
      </SectionTitle>

      {/* Add device form */}
      {showForm && (
        <div className="card fade-up" style={{ padding: 24, marginBottom: 24, border: `1.5px solid ${T.blue}` }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Register New Device</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Device Type</label>
              <select className="form-input" value={form.type} onChange={(e) => upd("type", e.target.value)}>
                {DEVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select className="form-input" value={form.brand} onChange={(e) => upd("brand", e.target.value)}>
                {BRANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" placeholder="e.g. Galaxy S22" value={form.model} onChange={(e) => upd("model", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number (optional)</label>
              <input className="form-input" value={form.serial} onChange={(e) => upd("serial", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Issue Description</label>
              <textarea className="form-input" rows={2} value={form.issue} onChange={(e) => upd("issue", e.target.value)} style={{ resize: "none" }} placeholder="Describe the problem…" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(false)}>💾 Register Device</button>
          </div>
        </div>
      )}

      {/* Device grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
        {loading
          ? [1, 2].map((i) => <div key={i} className="card sk" style={{ height: 220 }} />)
          : devices.map((d) => (
              <div key={d.id} className="card card-hover" style={{ padding: 22, border: `1.5px solid ${T.border}` }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: "2.8rem", marginBottom: 10, color: T.blue }}><i className={`fas fa-${d.type === "Smartphone" ? "mobile-alt" : "laptop"}`}></i></div>
                  <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 3 }}>{d.name}</div>
                  <div style={{ color: T.muted, fontSize: ".75rem", marginBottom: 8 }}>SN: {d.serial}</div>
                  <StatusBadge status={d.status} />
                </div>
                {d.issue && <div style={{ fontSize: ".8rem", color: T.muted, textAlign: "center", marginBottom: 14, fontStyle: "italic" }}>"{d.issue}"</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onBook && onBook()}>Book Repair</button>
                  <button className="btn btn-ghost btn-sm">Edit</button>
                </div>
              </div>
            ))}

        {/* Add card */}
        <div className="card card-hover" style={{ padding: 22, border: `2px dashed ${T.border}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180 }} onClick={() => setShowForm(true)}>
          <div style={{ width: 48, height: 48, background: T.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 10, color: T.blue }}>+</div>
          <div style={{ fontWeight: 600, color: T.muted }}>Add Another Device</div>
        </div>
      </div>
    </PageWrap>
  );
}
