import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { StatusBadge, Stars } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

const STEPS = ["Choose Centre", "Your Device", "Service", "Date & Time", "Confirm"];
const TIMES  = ["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM"];

export default function BookRepairFlow({ onDone }) {
  const [step, setStep]       = useState(0);
  const [selected, setSelected] = useState({ center: null, device: null, service: null, date: "", time: "" });
  const [centers, setCenters]   = useState([]);
  const [devices, setDevices]   = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    api("repairCenters").then(setCenters);
    api("devices").then(setDevices);
    api("services").then(setServices);
  }, []);

  const canNext = [
    !!selected.center, !!selected.device, !!selected.service,
    !!(selected.date && selected.time), true,
  ];

  if (step === 5) return (
    <PageWrap>
      <div className="card" style={{ padding: 56, textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 20px", color: "#059669" }}><i className="fas fa-check-circle"></i></div>
        <h2 className="heading" style={{ fontSize: "1.5rem", marginBottom: 10 }}>Booking Confirmed!</h2>
        <p style={{ color: T.muted, marginBottom: 24, fontSize: ".875rem" }}>
          Your appointment at <strong>{selected.center?.name}</strong> · {selected.date} at {selected.time}
        </p>
        <button className="btn btn-primary" onClick={() => { setStep(0); setSelected({ center: null, device: null, service: null, date: "", time: "" }); }}>
          Book Another
        </button>
      </div>
    </PageWrap>
  );

  return (
    <PageWrap>
      <SectionTitle sub="Follow the steps below to schedule your repair appointment.">Book a Repair</SectionTitle>

      {/* Stepper */}
      <div className="step-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="step-item" style={{ flex: i < STEPS.length - 1 ? 1 : "initial" }}>
            <div className={`step-item ${i < step ? "step-done" : i === step ? "step-active" : "step-pending"}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="step-circle">{i < step ? "✓" : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? "step-line-done" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        {/* Step 0 – Centre */}
        {step === 0 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Select a Repair Centre</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {centers.map((c) => (
                <div key={c.id} onClick={() => setSelected((p) => ({ ...p, center: c }))}
                  style={{ padding: "14px 18px", borderRadius: 12, border: `2px solid ${selected.center?.id === c.id ? T.blue : T.border}`, cursor: "pointer", background: selected.center?.id === c.id ? "#eff6ff" : "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <StatusBadge status={c.status === "Open" ? "confirmed" : "pending"} />
                  </div>
                  <div style={{ color: T.muted, fontSize: ".82rem", marginTop: 4 }}>{c.address} · {c.distance}</div>
                  <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: ".8rem", color: T.muted }}>
                    <span><Stars rating={c.rating} /> {c.rating}</span>
                    <span><i className="fas fa-clock" style={{ marginRight: 6 }}></i>{c.waitTime}</span>
                    <span style={{ color: c.capacity.includes("Full") ? T.red : T.green }}>• {c.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 – Device */}
        {step === 1 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Which device needs repair?</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {devices.map((d) => (
                <div key={d.id} onClick={() => setSelected((p) => ({ ...p, device: d }))}
                  style={{ padding: "14px 18px", borderRadius: 12, border: `2px solid ${selected.device?.id === d.id ? T.blue : T.border}`, cursor: "pointer", background: selected.device?.id === d.id ? "#eff6ff" : "#fff", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: "1.8rem", color: T.blue }}><i className={`fas fa-${d.type === "Smartphone" ? "mobile-alt" : "laptop"}`}></i></span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{d.name}</div>
                    <div style={{ color: T.muted, fontSize: ".8rem" }}>{d.type} · SN: {d.serial}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 – Service */}
        {step === 2 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Select a Service</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {services.map((s) => (
                <div key={s.id} onClick={() => setSelected((p) => ({ ...p, service: s }))}
                  style={{ padding: "16px 18px", borderRadius: 12, border: `2px solid ${selected.service?.id === s.id ? T.blue : T.border}`, cursor: "pointer", background: selected.service?.id === s.id ? "#eff6ff" : "#fff" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 8, color: T.blue }}><i className={`fas fa-${s.icon}`}></i></div>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: ".9rem" }}>{s.name}</div>
                  <div style={{ color: T.muted, fontSize: ".78rem" }}><i className="fas fa-clock" style={{ marginRight: 4 }}></i>{s.duration}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 – Date & Time */}
        {step === 3 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Choose Date & Time</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input type="date" className="form-input" value={selected.date} onChange={(e) => setSelected((p) => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Time Slots</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TIMES.map((t) => (
                    <div key={t} onClick={() => setSelected((p) => ({ ...p, time: t }))}
                      style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${selected.time === t ? T.blue : T.border}`, cursor: "pointer", fontSize: ".82rem", fontWeight: 600, background: selected.time === t ? T.blue : "#fff", color: selected.time === t ? "#fff" : T.text, transition: "all .15s" }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 – Confirm */}
        {step === 4 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Confirm Your Booking</h3>
            <div style={{ background: T.bg, borderRadius: 14, padding: 20, display: "grid", gap: 14 }}>
              {[["Repair Centre", selected.center?.name, selected.center?.address], ["Device", selected.device?.name], ["Service", selected.service?.name, selected.service?.duration ? `Est: ${selected.service.duration}` : null], ["Date & Time", selected.date, selected.time]].map(([k, v, sub]) => (
                <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 90, color: T.muted, fontSize: ".8rem", fontWeight: 600, paddingTop: 2 }}>{k}</div>
                  <div><div style={{ fontWeight: 700, fontSize: ".9rem" }}>{v}</div>{sub && <div style={{ color: T.muted, fontSize: ".8rem" }}>{sub}</div>}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button className="btn btn-outline" onClick={() => setStep((p) => Math.max(0, p - 1))} disabled={step === 0} style={{ opacity: step === 0 ? .4 : 1 }}>← Back</button>
        <button className="btn btn-primary" disabled={!canNext[step]} style={{ opacity: canNext[step] ? 1 : .4 }} onClick={() => { if (step < 4) setStep((p) => p + 1); else setStep(5); }}>
          {step === 4 ? "<i className='fas fa-check'></i> Confirm" : "Next <i className='fas fa-arrow-right'></i>"}
        </button>
      </div>
    </PageWrap>
  );
}
