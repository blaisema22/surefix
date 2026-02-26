import { useState } from 'react';
import { T, HERO_IMG } from '../styles/tokens';

function LoginPromptToast({ onLogin, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(10,20,60,.55)", backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        className="scale-in"
        style={{ background: "#fff", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,.3)", padding: "40px 36px", maxWidth: 420, width: "100%", textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 72, height: 72, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 18px", color: T.blue }}>
          <i className="fas fa-lock"></i>
        </div>
        <h3 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.4rem", color: T.navy, marginBottom: 8 }}>
          Login Required
        </h3>
        <p style={{ color: T.muted, fontSize: ".9rem", lineHeight: 1.6, marginBottom: 24 }}>
          You need to <strong style={{ color: T.navy }}>sign in</strong> or <strong style={{ color: T.navy }}>create an account</strong> before booking a repair. It only takes a moment!
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 22px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: "#fff", color: T.muted, fontWeight: 600, fontFamily: "Outfit,sans-serif", fontSize: ".875rem", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${T.blue},#1e40af)`, color: "#fff", fontWeight: 700, fontFamily: "Outfit,sans-serif", fontSize: ".875rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(29,78,216,.35)" }}
          >
            Sign In to Book →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onLogin, onBookClick, onShopClick }) {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleBookClick = () => setShowPrompt(true);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Outfit,sans-serif" }}>
      {showPrompt && (
        <LoginPromptToast
          onLogin={() => { setShowPrompt(false); onBookClick(); }}
          onClose={() => setShowPrompt(false)}
        />
      )}

      {/* NAVBAR */}
      <nav className="landing-nav">
        <span style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontStyle: "italic", fontSize: "1.4rem", color: T.navy }}>SureFix</span>
        <div style={{ display: "flex", gap: 28, fontSize: ".875rem", fontWeight: 500, color: T.muted }}>
          <a href="#" style={{ color: T.text, textDecoration: "none" }}>Home</a>
          <a href="#" style={{ color: T.muted, textDecoration: "none", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); handleBookClick(); }}>Book Repair</a>
          <a href="#" style={{ color: T.muted, textDecoration: "none", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); onShopClick(); }}>Find Shop</a>
          <a href="#" style={{ color: T.muted, textDecoration: "none" }}>About Us</a>
        </div>
        <button
          onClick={onLogin}
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: ".875rem", cursor: "pointer", fontFamily: "Outfit,sans-serif", transition: "all .18s" }}
          onMouseEnter={(e) => (e.target.style.background = T.navyMid)}
          onMouseLeave={(e) => (e.target.style.background = T.navy)}
        >
          Sign In
        </button>
      </nav>

      {/* HERO */}
      <section style={{ display: "flex", minHeight: 440 }}>
        <div style={{ flex: 1, background: "#eef0fa", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 60px" }}>
          <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(2rem,4vw,3rem)", color: T.navy, lineHeight: 1.15, marginBottom: 16 }}>
            Modern Solutions for<br /><span style={{ color: T.blue }}>Electronic Repairs</span>
          </h1>
          <p style={{ fontSize: ".9rem", color: T.text, maxWidth: 420, lineHeight: 1.7, marginBottom: 28 }}>
            Book your repair, track progress in real-time, and get your devices back faster with <strong style={{ color: T.blue }}>SureFix</strong>.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <button onClick={handleBookClick} style={{ background: T.blue, color: "#fff", border: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: ".9rem", cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>
              Book a Repair
            </button>
            <button onClick={onLogin} style={{ background: "transparent", color: T.blue, border: `2px solid ${T.blue}`, borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: ".9rem", cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>
              Sign In / Register
            </button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <img src={HERO_IMG} alt="Electronic repair" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 300 }} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "60px 40px", textAlign: "center", background: "#fff" }}>
        <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.8rem", color: T.blue, marginBottom: 4 }}>How It Works</h2>
        <p style={{ color: T.muted, marginBottom: 48, fontSize: ".9rem" }}>Book your repair in 5 simple steps</p>
        <div style={{ display: "flex", justifyContent: "center", maxWidth: 800, margin: "0 auto" }}>
          {[
            { n: "1", icon: "mobile-alt", title: "Select Device",  desc: "Choose your device type" },
            { n: "2", icon: "search", title: "Describe Issue", desc: "Tell us what's wrong" },
            { n: "3", icon: "calendar-alt", title: "Pick Schedule",  desc: "Choose date & time" },
            { n: "4", icon: "store", title: "Choose a Shop",  desc: "Find nearest centre" },
            { n: "5", icon: "check-circle", title: "Confirm & Done", desc: "Submit your booking" },
          ].map((s, i, arr) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : "initial" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", background: "#eff6ff", border: "2px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 10, color: T.blue }}>
                  <i className={`fas fa-${s.icon}`}></i>
                  <span style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, background: T.blue, color: "#fff", borderRadius: "50%", fontSize: ".65rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.n}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: ".85rem", color: T.text, marginBottom: 4 }}>{s.title}</p>
                <p style={{ fontSize: ".75rem", color: T.muted, maxWidth: 90, textAlign: "center" }}>{s.desc}</p>
              </div>
              {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: "#e0e7ff", margin: "0 6px", marginBottom: 40 }} />}
            </div>
          ))}
        </div>
        <button onClick={handleBookClick} style={{ marginTop: 40, background: T.navy, color: "#fff", border: "none", borderRadius: 50, padding: "14px 36px", fontWeight: 700, fontSize: ".9rem", cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>
          Start Booking Now <i className="fas fa-arrow-right" style={{ marginLeft: 8 }}></i>
        </button>
      </section>

      {/* WHY CHOOSE */}
      <section style={{ padding: "60px 40px", background: T.bg, textAlign: "center" }}>
        <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.8rem", color: T.blue, marginBottom: 4 }}>Why Choose SureFix?</h2>
        <p style={{ color: T.muted, marginBottom: 48, fontSize: ".9rem" }}>A better way to repair your tech</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28, maxWidth: 860, margin: "0 auto", textAlign: "left" }}>
          {[
            { title: "Expert Technicians", desc: "Our certified professionals have years of experience with all major electronic brands.", icon: "wrench" },
            { title: "Fast Turnaround",    desc: "Most common repairs completed within 24–48 hours with genuine replacement parts.", icon: "bolt" },
            { title: "Real-time Tracking", desc: "Know exactly where your device is in the repair process with our live status updates.", icon: "satellite-dish" },
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: "24px 22px", border: `1.5px solid ${T.border}` }}>
              <div style={{ fontSize: "2rem", marginBottom: 12, color: T.blue }}><i className={`fas fa-${f.icon}`}></i></div>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8, color: T.navy }}>{f.title}</div>
              <p style={{ color: T.muted, fontSize: ".85rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ margin: "0 40px 60px", borderRadius: 20, background: `linear-gradient(135deg,${T.navy},${T.navyMid})`, padding: "48px 52px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.8rem", marginBottom: 10 }}>Ready to fix your device?</h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".9rem", maxWidth: 480, lineHeight: 1.6 }}>Join thousands of happy customers who trust SureFix for their electronic repairs.</p>
        </div>
        <button onClick={handleBookClick} style={{ background: "#fff", color: T.navy, border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 800, fontSize: ".95rem", cursor: "pointer", fontFamily: "Outfit,sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
          <i className="fas fa-wrench" style={{ marginRight: 8 }}></i>Start Your Repair
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#fff", borderTop: `1px solid ${T.border}`, padding: "40px", textAlign: "center" }}>
        <p style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontStyle: "italic", fontSize: "1.3rem", color: T.navy, marginBottom: 8 }}>SureFix</p>
        <p style={{ color: T.muted, fontSize: ".82rem" }}>© 2026 SureFix System. All rights reserved.</p>
      </footer>
    </div>
  );
}
