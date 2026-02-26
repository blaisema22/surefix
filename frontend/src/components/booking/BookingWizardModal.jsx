import { useState } from 'react';
import { T, DEVICE_IMGS, ISSUES, SHOPS_BK, TIMES_BK, BOOKING_STEPS } from '../../styles/tokens';

// ── Step sub-components ────────────────────────────────────────────────────────

function StepDevice({ data, upd }) {
  return (
    <div>
      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 4 }}>Select Your Device</h3>
      <p style={{ color: T.muted, fontSize: ".85rem", marginBottom: 20 }}>What type of device needs repair?</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {Object.entries(DEVICE_IMGS).map(([d, img]) => (
          <button
            key={d}
            onClick={() => upd("device", d)}
            style={{
              borderRadius: 12, overflow: "hidden",
              border: `2px solid ${data.device === d ? T.blue : T.border}`,
              background: "none", cursor: "pointer", transition: "all .2s",
              transform: data.device === d ? "scale(1.04)" : "scale(1)",
            }}
          >
            <img src={img} alt={d} style={{ width: "100%", height: 80, objectFit: "cover" }} />
            <p style={{ fontSize: ".78rem", fontWeight: 700, padding: "8px 0", color: data.device === d ? T.blue : T.muted, background: data.device === d ? "#eff6ff" : "#f9fafb" }}>
              {d}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepIssue({ data, upd }) {
  const issues = ISSUES[data.device] || [];
  return (
    <div>
      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 4 }}>Describe the Issue</h3>
      <p style={{ color: T.muted, fontSize: ".85rem", marginBottom: 16 }}>
        Problem with your <strong style={{ color: T.blue }}>{data.device}</strong>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {issues.map((iss) => (
          <button
            key={iss}
            onClick={() => upd("issue", iss)}
            style={{
              textAlign: "left", padding: "12px 16px", borderRadius: 10,
              border: `2px solid ${data.issue === iss ? T.blue : T.border}`,
              background: data.issue === iss ? "#eff6ff" : "#fff",
              color: data.issue === iss ? T.blue : T.text,
              fontWeight: 600, fontSize: ".85rem", cursor: "pointer", transition: "all .15s",
            }}
          >
            {iss}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="Additional details (optional)…"
        value={data.note}
        onChange={(e) => upd("note", e.target.value)}
        style={{ width: "100%", border: `2px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: ".85rem", fontFamily: "Outfit,sans-serif", resize: "none", outline: "none" }}
      />
    </div>
  );
}

function StepSchedule({ data, upd }) {
  return (
    <div>
      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 16 }}>Choose Date & Time</h3>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: ".78rem", fontWeight: 700, marginBottom: 8, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>
          Preferred Date
        </label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={data.date}
          onChange={(e) => upd("date", e.target.value)}
          className="form-input"
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: ".78rem", fontWeight: 700, marginBottom: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>
          Preferred Time
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TIMES_BK.map((t) => (
            <button
              key={t}
              onClick={() => upd("time", t)}
              style={{
                padding: "8px 16px", borderRadius: 50,
                border: `2px solid ${data.time === t ? T.blue : T.border}`,
                background: data.time === t ? T.blue : "#fff",
                color: data.time === t ? "#fff" : T.text,
                fontWeight: 600, fontSize: ".8rem", cursor: "pointer", transition: "all .15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepShop({ data, upd }) {
  return (
    <div>
      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 4 }}>Find a Repair Shop</h3>
      <p style={{ color: T.muted, fontSize: ".85rem", marginBottom: 16 }}>
        Available on <strong style={{ color: T.blue }}>{data.date}</strong> at <strong style={{ color: T.blue }}>{data.time}</strong>
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SHOPS_BK.map((s) => (
          <button
            key={s.name}
            onClick={() => upd("shop", s)}
            style={{
              textAlign: "left", display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 12,
              border: `2px solid ${data.shop?.name === s.name ? T.blue : T.border}`,
              background: data.shop?.name === s.name ? "#eff6ff" : "#fff",
              cursor: "pointer", transition: "all .15s",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, color: T.blue }}>
              <i className="fas fa-store"></i>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{s.name}</p>
              <p style={{ color: T.muted, fontSize: ".75rem" }}>{s.addr}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: ".75rem" }}>
              <p style={{ color: "#f59e0b", fontWeight: 700 }}>★ {s.rating}</p>
              <p style={{ color: T.muted }}>{s.dist}</p>
              <p style={{ color: T.green, fontWeight: 600 }}>{s.wait}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepConfirm({ data, upd }) {
  return (
    <div>
      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 16 }}>Confirm Booking</h3>
      <div style={{ background: "#f0f4ff", borderRadius: 12, padding: "16px 18px", marginBottom: 20, border: `1px solid #bfdbfe` }}>
        <p style={{ fontSize: ".72rem", fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Summary</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ icon: "mobile-alt", label: "Device", val: data.device }, { icon: "search", label: "Issue", val: data.issue }, { icon: "calendar-alt", label: "Date", val: data.date }, { icon: "clock", label: "Time", val: data.time }, { icon: "store", label: "Shop", val: data.shop?.name }, { icon: "map-marker-alt", label: "Location", val: data.shop?.addr }].map(({ icon, label, val }) => (
            <div key={label}>
              <p style={{ fontSize: ".7rem", color: T.muted, fontWeight: 600 }}><i className={`fas fa-${icon}`} style={{ marginRight: 6 }}></i>{label}</p>
              <p style={{ fontWeight: 700, fontSize: ".8rem", color: T.text }}>{val || "—"}</p>
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: ".78rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Contact Info</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="Jane Doe" value={data.name} onChange={(e) => upd("name", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input className="form-input" placeholder="+250 7XX XXX XXX" value={data.phone} onChange={(e) => upd("phone", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ── Main Modal Component ───────────────────────────────────────────────────────

export default function BookingWizardModal({ onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ device: "", issue: "", date: "", time: "", shop: null, name: "", phone: "", note: "" });
  const [done, setDone] = useState(false);

  const upd = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!data.device;
    if (step === 1) return !!data.issue;
    if (step === 2) return !!data.date && !!data.time;
    if (step === 3) return !!data.shop;
    if (step === 4) return !!data.name && !!data.phone;
    return true;
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(10,20,60,.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,.35)", width: 700, maxWidth: "95vw", overflow: "hidden", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${T.navy},${T.navyMid})`, padding: "24px 32px 20px" }}>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem", marginBottom: 16 }}><i className="fas fa-mobile-alt" style={{ marginRight: 8 }}></i>Book a Repair</p>
          <div style={{ display: "flex", alignItems: "center" }}>
            {BOOKING_STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < BOOKING_STEPS.length - 1 ? 1 : "initial" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", border: "2px solid",
                    borderColor: i < step ? "#4ade80" : i === step ? "#fff" : "rgba(255,255,255,.3)",
                    background: i < step ? "#4ade80" : i === step ? "#fff" : "transparent",
                    color: i < step ? "#fff" : i === step ? T.navy : "rgba(255,255,255,.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".82rem",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <p style={{ fontSize: ".65rem", color: i <= step ? "#fff" : "rgba(255,255,255,.35)", marginTop: 4, fontWeight: 600 }}>{s}</p>
                </div>
                {i < BOOKING_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? "#4ade80" : "rgba(255,255,255,.2)", margin: "0 4px", marginBottom: 16 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px", minHeight: 300 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12, color: "#059669" }}><i className="fas fa-check-circle"></i></div>
              <h3 style={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: 8 }}>Booking Confirmed!</h3>
              <p style={{ color: T.muted, marginBottom: 4, fontSize: ".875rem" }}>
                {data.device} ({data.issue}) at <strong>{data.shop?.name}</strong>
              </p>
              <p style={{ color: T.muted, fontSize: ".82rem", marginBottom: 20 }}>{data.date} at {data.time}</p>
              <div style={{ background: T.bg, borderRadius: 12, padding: "12px 20px", display: "inline-block", marginBottom: 20 }}>
                <p style={{ fontSize: ".72rem", color: T.muted }}>Booking ID</p>
                <p style={{ color: T.blue, fontWeight: 800, fontSize: "1.2rem" }}>
                  #{Math.floor(Math.random() * 90000 + 10000)}
                </p>
              </div>
              <br />
              <button className="btn btn-primary" onClick={onClose}>Back to Home</button>
            </div>
          ) : (
            <>
              {step === 0 && <StepDevice data={data} upd={upd} />}
              {step === 1 && <StepIssue data={data} upd={upd} />}
              {step === 2 && <StepSchedule data={data} upd={upd} />}
              {step === 3 && <StepShop data={data} upd={upd} />}
              {step === 4 && <StepConfirm data={data} upd={upd} />}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 32px 24px", borderTop: `1px solid ${T.border}` }}>
            <button className="btn btn-outline btn-sm" onClick={() => setStep((s) => Math.max(0, s - 1))} style={{ opacity: step === 0 ? .4 : 1 }} disabled={step === 0}>
              ← Back
            </button>
            <button
              className="btn btn-primary"
              style={{ opacity: canNext() ? 1 : .35 }}
              disabled={!canNext()}
              onClick={() => { if (step < 4) setStep((s) => s + 1); else setDone(true); }}
            >
              {step === 4 ? "Confirm Booking <i className='fas fa-check'></i>" : "Continue <i className='fas fa-arrow-right'></i>"}   
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "rgba(255,255,255,.6)", fontSize: "1.3rem", cursor: "pointer", fontWeight: 700 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
