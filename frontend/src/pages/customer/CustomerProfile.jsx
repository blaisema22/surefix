import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';

export default function CustomerProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => { api("users").then((u) => setUser(u["customer-001"])); }, []);

  if (!user) return <PageWrap><Skeleton h={300} /></PageWrap>;

  return (
    <PageWrap>
      {/* Banner */}
      <div style={{ background: T.profileGrad, borderRadius: 18, padding: "28px 32px", color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "1.6rem", border: "3px solid rgba(255,255,255,.35)", flexShrink: 0 }}>
          {user.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.7rem", marginBottom: 4 }}>{user.firstName} {user.lastName}</h2>
          <div style={{ display: "flex", gap: 20, fontSize: ".85rem", opacity: .9, marginBottom: 14 }}>
            <span><i className="fas fa-envelope" style={{ marginRight: 8 }}></i>{user.email}</span><span><i className="fas fa-phone" style={{ marginRight: 8 }}></i>{user.phone}</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {[["3","Devices"],["4","Repairs"],["Feb 2026","Member since"]].map(([v, l]) => (
              <div key={l}><div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.25rem" }}>{v}</div><div style={{ fontSize: ".72rem", opacity: .75 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Personal info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.1rem", marginBottom: 20, textAlign: "center" }}>Personal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["First name","firstName"],["Last name","lastName"],["Email Address","email"],["Phone","phone"]].map(([l, k]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" defaultValue={user[k]} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Location</label>
              <input className="form-input" defaultValue={user.location} />
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <button className="btn btn-primary btn-sm">💾 Save Changes</button>
          </div>
        </div>

        {/* Preferences */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.1rem", marginBottom: 20, textAlign: "center" }}>Preferences</h3>
          {[
            ["Email Notifications","Appointment reminders and updates","email"],
            ["SMS Notifications","Get text reminders","sms"],
            ["Marketing Updates","Offers and promotions","marketing"],
          ].map(([label, desc, pref]) => (
            <div key={pref} style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".875rem" }}>{label}</div>
                <div style={{ color: T.muted, fontSize: ".78rem" }}>{desc}</div>
              </div>
              <div
                className={`toggle ${user.preferences[pref] ? "toggle-on" : "toggle-off"}`}
                onClick={() => setUser({ ...user, preferences: { ...user.preferences, [pref]: !user.preferences[pref] } })}
              />
            </div>
          ))}
        </div>
      </div>
    </PageWrap>
  );
}
