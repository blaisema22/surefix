import { useState } from 'react';
import { T } from '../../styles/tokens';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage({ onLogin }) {
  const { login, register, loading } = useAuth();
  const [role, setRole]         = useState("customer");
  const [view, setView]         = useState("login"); // "login" | "register"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [err, setErr]           = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setErr("Please fill in all fields."); return; }
    try {
      setErr("");
      const response = await login(email, password);
      // Fetch user profile data
      const userData = response.user || {};
      onLogin(userData);
    } catch (error) {
      setErr(error.message || "Login failed. Please try again.");
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) { setErr("All fields are required."); return; }
    try {
      setErr("");
      const userData = {
        email,
        password,
        phone,
        role,
      };
      
      if (role === "customer") {
        userData.firstName = name.split(" ")[0] || name;
        userData.lastName = name.split(" ").slice(1).join(" ") || "";
      } else {
        userData.companyName = name;
        userData.ownerName = name;
      }

      const response = await register(userData);
      const user = response.user || {};
      onLogin(user);
    } catch (error) {
      setErr(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* ── Header ── */}
        <div className="login-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
              <i className="fas fa-wrench"></i>
            </div>
            <span className="logo-text">SureFix</span>
          </div>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".82rem", marginBottom: 24 }}>Electronic Repair Platform</p>

          {/* Role selector */}
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".78rem", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
            I am a…
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { key: "customer", icon: "user", label: "Customer",  desc: "Book repairs" },
              { key: "shop",     icon: "wrench", label: "Repairer",  desc: "Manage shop"  },
            ].map((r) => (
              <button
                key={r.key}
                className={`role-btn${role === r.key ? " selected" : ""}`}
                onClick={() => { setRole(r.key); setErr(""); }}
              >
                <span className="role-icon"><i className={`fas fa-${r.icon}`}></i></span>
                <span style={{ display: "block", fontWeight: 700, fontSize: ".9rem" }}>{r.label}</span>
                <span style={{ display: "block", fontSize: ".72rem", opacity: .75, marginTop: 2 }}>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 36px 32px" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: `2px solid ${T.border}`, marginBottom: 22 }}>
            {["login", "register"].map((v) => (
              <button
                key={v}
                onClick={() => { setView(v); setErr(""); }}
                style={{
                  flex: 1, padding: "8px 0", background: "none", border: "none",
                  borderBottom: `2.5px solid ${view === v ? T.blue : "transparent"}`,
                  color: view === v ? T.blue : T.muted,
                  fontWeight: 700, fontFamily: "Outfit,sans-serif", fontSize: ".875rem",
                  cursor: "pointer", textTransform: "capitalize", marginBottom: "-2px", transition: "all .2s",
                }}
              >
                {v === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Error */}
          {err && (
            <div style={{ background: "#fee2e2", color: T.red, borderRadius: 10, padding: "10px 14px", fontSize: ".82rem", fontWeight: 600, marginBottom: 16, border: "1.5px solid #fecaca" }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>{err}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {view === "register" && (
              <div className="inp-wrap">
                <span className="inp-icon"><i className="fas fa-user"></i></span>
                <input className="auth-input" placeholder={role === "shop" ? "Company / Shop Name" : "Full Name"} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="inp-wrap">
              <span className="inp-icon"><i className="fas fa-envelope"></i></span>
              <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {view === "register" && (
              <div className="inp-wrap">
                <span className="inp-icon"><i className="fas fa-phone"></i></span>
                <input className="auth-input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            )}
            <div className="inp-wrap">
              <span className="inp-icon"><i className="fas fa-lock"></i></span>
              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (view === "login" ? handleLogin() : handleRegister())}
              />
            </div>
          </div>

          {view === "login" && (
            <div style={{ textAlign: "right", marginTop: 8, marginBottom: 4 }}>
              <button className="auth-link" style={{ fontSize: ".78rem" }}>Forgot password?</button>
            </div>
          )}

          <button
            className="auth-btn"
            style={{ marginTop: view === "login" ? 8 : 16 }}
            onClick={view === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                {view === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                {view === "login" ? "Sign In →" : "Create Account →"}
              </>
            )}
          </button>

          {/* Demo hint */}
          {view === "login" && (
            <div style={{ marginTop: 20, padding: "12px 16px", background: T.bg, borderRadius: 10, fontSize: ".75rem", color: T.muted, textAlign: "center" }}>
              <strong>Demo:</strong> {role === "customer" ? "blaise@example.com" : "techfix@example.com"} · password: <strong>demo123</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
