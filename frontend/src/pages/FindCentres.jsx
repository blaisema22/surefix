import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

/* ============================================================
   SUREFIX - Electronic Repair Appointment & Availability System
   Full flow: Customer ↔ Repair Shop
   REQUIREMENT: Users must register before booking
   ============================================================ */

// ─── MOCK DATABASE ────────────────────────────────────────────────────────────
const DB = {
  users: {
    "customer-001": {
      id: "customer-001", role: "customer",
      firstName: "Blaise", lastName: "Manishimwe",
      email: "blaise@example.com", phone: "+250 78 123 4567",
      location: "Kigali, Rwanda", avatar: "BM",
      memberSince: "Feb 2026",
      preferences: { email: true, sms: false, marketing: true },
    },
    "shop-001": {
      id: "shop-001", role: "shop",
      companyName: "TechFix Pro Centre", ownerName: "Alice K.",
      email: "techfix@example.com", phone: "+250 78 000 1234",
      address: "KG 15 Ave, Kicukiro, Kigali", tinNumber: "TIN-123456789",
      openHours: "9:00 AM - 7:00 PM", specialization: "Mobile Devices",
      rating: 4.8, verified: true, avatar: "TF",
      slots: { Mon: ["9:00","10:00","14:00"], Tue: ["9:00","11:00","15:00"], Wed: ["10:00","13:00"], Thu: ["9:00","10:30","14:00"], Fri: ["9:00","11:00"] },
    },
  },
  repairCenters: [
    { id: "rc-001", name: "TechFix Pro Centre", address: "KG 15 Ave, Kicukiro, Kigali", distance: "1.2 km", phone: "+250 78 000 1234", hours: "9:00 AM - 7:00 PM", rating: 4.8, reviews: 124, specializations: ["Smartphone","Tablet","Laptop"], status: "Open", waitTime: "~20 min", capacity: "3 slots today", lat: -1.9536, lng: 30.0620 },
    { id: "rc-002", name: "DigiCare Solutions", address: "KN 5 Rd, Nyarugenge, Kigali", distance: "2.4 km", phone: "+250 78 111 2222", hours: "8:00 AM - 6:00 PM", rating: 4.5, reviews: 89, specializations: ["Laptop","Desktop","Printer"], status: "Open", waitTime: "~45 min", capacity: "1 slot today", lat: -1.9480, lng: 30.0680 },
    { id: "rc-003", name: "SmartRepair Hub", address: "KG 7 Rd, Gasabo, Kigali", distance: "3.1 km", phone: "+250 78 333 4444", hours: "9:00 AM - 7:00 PM", rating: 4.2, reviews: 56, specializations: ["Smartphone","Tablet"], status: "Busy", waitTime: "~1.5 hr", capacity: "Full today", lat: -1.9460, lng: 30.0470 },
  ],
  services: [
    { id: "svc-001", category: "Screen Repair", name: "Screen Replacement", duration: "2-4 hours", icon: "📱" },
    { id: "svc-002", category: "Battery", name: "Battery Replacement", duration: "30-60 min", icon: "🔋" },
    { id: "svc-003", category: "Water Damage", name: "Water Damage Repair", duration: "24-48 hours", icon: "💧" },
    { id: "svc-004", category: "Software", name: "Software Fix / Virus Removal", duration: "1-3 hours", icon: "💻" },
    { id: "svc-005", category: "Charging", name: "Charging Port Repair", duration: "1-2 hours", icon: "⚡" },
    { id: "svc-006", category: "Keyboard", name: "Keyboard Replacement", duration: "2-3 hours", icon: "⌨️" },
  ],
  devices: [
    { id: "dev-001", userId: "customer-001", name: "Samsung Galaxy S22", type: "Smartphone", brand: "Samsung", model: "Galaxy S22", serial: "SG22-KGL-001", status: "needs_repair", issue: "Screen cracked after fall, touch still works", addedAt: "2026-02-01" },
    { id: "dev-002", userId: "customer-001", name: "HP Laptop 15", type: "Laptop", brand: "HP", model: "Laptop 15s", serial: "HP15-KGL-002", status: "healthy", issue: "", addedAt: "2026-01-15" },
  ],
  appointments: [
    { id: "apt-001", customerId: "customer-001", shopId: "rc-001", deviceId: "dev-001", serviceId: "svc-001", status: "in_progress", date: "2026-02-19", time: "10:30 AM", device: "Samsung Galaxy S22", service: "Screen Replacement", shop: "TechFix Pro Centre", address: "KG 15 Ave, Kicukiro, Kigali", technicianNote: "Device received. Screen sourced.", createdAt: "2026-02-15" },
    { id: "apt-002", customerId: "customer-001", shopId: "rc-002", deviceId: "dev-002", serviceId: "svc-004", status: "completed", date: "2026-01-28", time: "2:00 PM", device: "HP Laptop 15", service: "Software Fix", shop: "DigiCare Solutions", address: "KN 5 Rd, Nyarugenge, Kigali", technicianNote: "Virus removed. System restored.", createdAt: "2026-01-25" },
  ],
  shopAppointments: [
    { id: "sapt-001", customerName: "Blaise M.", device: "Samsung Galaxy S22", service: "Screen Replacement", date: "2026-02-19", time: "10:30 AM", status: "in_progress", phone: "+250 78 123 4567" },
    { id: "sapt-002", customerName: "Jean P.", device: "iPhone 13", service: "Battery Replacement", date: "2026-02-20", time: "9:00 AM", status: "confirmed", phone: "+250 78 555 6666" },
    { id: "sapt-003", customerName: "Marie N.", device: "Samsung Tab S7", service: "Screen Replacement", date: "2026-02-21", time: "11:00 AM", status: "pending", phone: "+250 78 777 8888" },
  ],
  customers: [
    { id: "c-001", name: "Blaise M.", email: "blaise@example.com", phone: "+250 78 123 4567", devices: 2, totalRepairs: 4, joinedAt: "2026-02-01", lastVisit: "2026-02-19" },
    { id: "c-002", name: "Jean P.", email: "jean@example.com", phone: "+250 78 555 6666", devices: 1, totalRepairs: 1, joinedAt: "2026-01-10", lastVisit: "2026-02-20" },
    { id: "c-003", name: "Marie N.", email: "marie@example.com", phone: "+250 78 777 8888", devices: 3, totalRepairs: 5, joinedAt: "2025-12-01", lastVisit: "2026-02-21" },
  ],
};

const api = (key, delay = 350) => new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(DB[key]))), delay));

const T = {
  navy: "#0f2044",
  navyMid: "#1a3260",
  blue: "#1d4ed8",
  blueHover: "#2563eb",
  accent: "#0ea5e9",
  teal: "#0891b2",
  bg: "#eef2fb",
  bgCard: "#ffffff",
  text: "#0c1830",
  muted: "#5a6a8a",
  border: "#d8e1f3",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#d97706",
  profileGrad: "linear-gradient(135deg, #1d8fe0 0%, #0f6bb5 60%, #0a4d8f 100%)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,400;0,700;1,400;1,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Outfit',sans-serif;background:${T.bg};color:${T.text};min-height:100vh;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:6px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.fade-up{animation:fadeUp .4s ease both;}
.sk{background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
.heading{font-family:'Fraunces',serif;font-weight:700;font-style:italic;}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 10px rgba(15,32,68,.07);}
.card-hover{transition:transform .2s,box-shadow .2s;}
.card-hover:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(15,32,68,.12);}
.btn{border:none;border-radius:9px;padding:10px 20px;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:'Outfit',sans-serif;display:inline-flex;align-items:center;gap:7px;}
.btn-primary{background:${T.blue};color:#fff;}
.btn-primary:hover{background:${T.blueHover};transform:translateY(-1px);box-shadow:0 4px 14px rgba(29,78,216,.35);}
.btn-outline{background:transparent;color:${T.blue};border:1.5px solid ${T.blue};}
.btn-outline:hover{background:${T.blue};color:#fff;}
.btn-ghost{background:rgba(29,78,216,.06);color:${T.blue};}
.btn-ghost:hover{background:rgba(29,78,216,.12);}
.btn-sm{padding:7px 14px;font-size:.8rem;}
.form-input{border:1.5px solid ${T.border};border-radius:9px;padding:10px 14px;font-size:.875rem;font-family:'Outfit',sans-serif;color:${T.text};background:#f8fafc;outline:none;transition:all .2s;width:100%;}
.form-input:focus{border-color:${T.blue};background:#fff;box-shadow:0 0 0 3px rgba(29,78,216,.08);}
.form-label{font-size:.8rem;font-weight:700;color:${T.text};}
.form-group{display:flex;flex-direction:column;gap:5px;}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
.badge-blue{background:#dbeafe;color:#1d4ed8;}
.badge-green{background:#dcfce7;color:#15803d;}
.badge-amber{background:#fef3c7;color:#92400e;}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
.dot-green{background:${T.green};}
.dot-amber{background:${T.amber};}
.rating-star{color:#f59e0b;font-size:.9rem;}
.empty-state{text-align:center;padding:56px 24px;}
.empty-icon{font-size:3rem;margin-bottom:12px;}
@media(max-width:1024px){
  .find-centers-container{grid-template-columns:1fr!important;}
  h1.heading{font-size:1.5rem!important;}
}
@media(max-width:768px){
  .find-centers-container{padding:20px 16px!important;grid-template-columns:1fr!important;}
  h1.heading{font-size:1.25rem!important;}
  .btn-sm{padding:6px 12px;font-size:.75rem;}
  .card{border-radius:12px;}
  .badge{font-size:.65rem;padding:2px 8px;}
}
@media(max-width:640px){
  body{font-size:.85rem;}
  h1.heading{font-size:1.125rem!important;}
  .find-centers-container{padding:16px 12px!important;}
  .btn{padding:8px 16px;font-size:.8rem;}
  .btn-sm{padding:6px 10px;font-size:.7rem;}
  .form-input{padding:8px 12px;font-size:.8rem;}
  .card{border-radius:12px;padding:14px 16px!important;}
  p{font-size:.8rem!important;}
}
`;

const statusConfig = {
  in_progress: { label: "In Progress", cls: "badge-blue", dot: "dot-green" },
  confirmed:   { label: "Confirmed",   cls: "badge-green", dot: "dot-green" },
  pending:     { label: "Pending",     cls: "badge-amber", dot: "dot-amber" },
  completed:   { label: "Completed",   cls: "badge-green", dot: "dot-green" },
};

const StatusBadge = ({ status }) => {
  const s = statusConfig[status] || { label: status, cls: "badge-blue" };
  return <span className={`badge ${s.cls}`}><span className={`dot ${s.dot}`} />{s.label}</span>;
};

const Stars = ({ rating }) => (
  <span>{Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="rating-star">{i < Math.round(rating) ? "★" : "☆"}</span>
  ))}</span>
);

const Skeleton = ({ h = 40, w = "100%", mb = 0 }) => (
  <div className="sk" style={{ height: h, width: w, marginBottom: mb }} />
);

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [userType, setUserType] = useState("customer");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.email && form.password) {
      onSuccess({ email: form.email, role: userType });
      onClose();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,60,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
      <div className="card" style={{ maxWidth: 420, padding: 32, animation: "fadeUp .3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 className="heading" style={{ fontSize: "1.4rem", marginBottom: 4 }}>{mode === "login" ? "Sign In" : "Create Account"}</h2>
          <p style={{ color: T.muted, fontSize: ".85rem" }}>
            {mode === "login" ? "Access your account" : "Join SureFix to book repairs"}
          </p>
        </div>

        {mode === "register" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, padding: "10px", background: T.bg, borderRadius: 10 }}>
            {["customer", "shop"].map(t => (
              <button key={t} onClick={() => setUserType(t)}
                style={{ flex: 1, padding: "6px", borderRadius: 8, border: "none", background: userType === t ? T.blue : "transparent", color: userType === t ? "#fff" : T.muted, fontWeight: 700, cursor: "pointer", fontSize: ".8rem", transition: "all .2s" }}>
                {t === "customer" ? "👤 Customer" : "🏪 Repair Shop"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <>
              <div className="form-group">
                <label className="form-label">{userType === "customer" ? "First Name" : "Company Name"}</label>
                <input className="form-input" placeholder={userType === "customer" ? "John" : "TechFix Pro"} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              {userType === "customer" && (
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="Doe" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+250 78 123 4567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: ".8rem", color: T.muted }}>
          {mode === "login" ? (
            <>
              Don't have an account? <button onClick={() => setMode("register")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontWeight: 700 }}>Sign up</button>
            </>
          ) : (
            <>
              Already registered? <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontWeight: 700 }}>Sign in</button>
            </>
          )}
        </div>

        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: T.muted }}>✕</button>
      </div>
    </div>
  );
}

function FindRepairCenter({ isAuthenticated, onBookClick }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const mapRef = useRef(null);

  const mapOptions = {
    zoom: 13,
    center: { lat: -1.9536, lng: 30.0620 },
    styles: [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
      { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
      { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    ],
  };

  useEffect(() => {
    api("repairCenters").then(d => { setCenters(d); setLoading(false); });
  }, []);

  const filtered = centers.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.address.toLowerCase().includes(filter.toLowerCase()));

  const handleBooking = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      onBookClick && onBookClick();
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "32px 20px" }}>
      <style>{CSS}</style>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); }} />
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="heading" style={{ fontSize: "2rem", marginBottom: 6 }}>Find a Repair Centre</h1>
          <p style={{ color: T.muted, fontSize: ".95rem" }}>Visit any of our authorized service centers for on-the-spot diagnostics</p>
        </div>

        <div className="find-centers-container" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24, alignItems: "start" }}>
          {/* Left: Shop Cards */}
          <div>
            <input className="form-input" placeholder="Search by name or location…" value={filter} onChange={e => setFilter(e.target.value)} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: 8 }}>
              {loading ? [1,2,3].map(i => <div key={i} className="card sk" style={{ height: 180 }} />) :
                filtered.length > 0 ? filtered.map(c => (
                  <div 
                    key={c.id} 
                    className="card card-hover" 
                    style={{ 
                      padding: "16px 18px", 
                      border: `2px solid ${selectedCenter?.id === c.id ? T.blue : T.border}`,
                      cursor: "pointer",
                      transition: "all .2s",
                      background: selectedCenter?.id === c.id ? "#f0f7ff" : T.bgCard,
                    }}
                    onMouseEnter={() => setSelectedCenter(c)}
                    onClick={() => setSelectedCenter(c)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{c.name}</div>
                      <StatusBadge status={c.status === "Open" ? "confirmed" : "pending"} />
                    </div>
                    <div style={{ color: T.muted, fontSize: ".78rem", marginBottom: 5 }}>📍 {c.address}</div>
                    <div style={{ color: T.muted, fontSize: ".78rem", marginBottom: 8, wordBreak: "break-word" }}>📞 {c.phone}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                      {c.specializations.slice(0, 2).map(s => <span key={s} className="badge badge-blue" style={{ fontSize: ".65rem" }}>{s}</span>)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                      <div style={{ fontSize: ".75rem" }}>
                        <Stars rating={c.rating} /><span style={{ marginLeft: 4, color: T.muted }}>{c.rating}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", fontSize: ".7rem", color: T.muted }}>
                        <span>🕐 {c.waitTime}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ width: "100%", fontSize: ".75rem" }} onClick={handleBooking}>
                      {isAuthenticated ? "Book Now" : "🔒 Register"}
                    </button>
                  </div>
                )) : (
                  <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                    <div className="empty-icon">🔍</div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>No centres found</div>
                    <p style={{ color: T.muted }}>Try adjusting your search filters</p>
                  </div>
                )
              }
            </div>
          </div>

          {/* Right: Google Map */}
          <div style={{ minHeight: "600px", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,32,68,.12)" }}>
            <LoadScript googleMapsApiKey="AIzaSyAiJXgDtLPnEGZLfKUP3AqO3Z8Z7W9J0Cw">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "600px" }}
                center={mapOptions.center}
                zoom={mapOptions.zoom}
                options={{ styles: mapOptions.styles, streetViewControl: false, mapTypeControl: false }}
                ref={mapRef}
              >
                {filtered.map(center => (
                  <Marker
                    key={center.id}
                    position={{ lat: center.lat, lng: center.lng }}
                    onClick={() => setSelectedCenter(center)}
                    icon={{
                      path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
                      fillColor: selectedCenter?.id === center.id ? T.blue : T.accent,
                      fillOpacity: 1,
                      strokeColor: "#fff",
                      strokeWeight: 2,
                      scale: 1.8,
                    }}
                  />
                ))}
                {selectedCenter && (
                  <InfoWindow
                    position={{ lat: selectedCenter.lat, lng: selectedCenter.lng }}
                    onCloseClick={() => setSelectedCenter(null)}
                  >
                    <div style={{ padding: "10px", background: "#fff", borderRadius: "8px", maxWidth: "250px" }}>
                      <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 6 }}>{selectedCenter.name}</div>
                      <div style={{ fontSize: ".8rem", color: T.muted, marginBottom: 4 }}>📍 {selectedCenter.address}</div>
                      <div style={{ fontSize: ".8rem", color: T.muted, marginBottom: 4 }}>📞 {selectedCenter.phone}</div>
                      <div style={{ fontSize: ".8rem", color: T.muted, marginBottom: 8 }}>⏰ {selectedCenter.hours}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                        {selectedCenter.specializations.map(s => <span key={s} className="badge badge-blue" style={{ fontSize: ".65rem" }}>{s}</span>)}
                      </div>
                      <Stars rating={selectedCenter.rating} />
                      <span style={{ fontSize: ".78rem", color: T.muted, marginLeft: 6 }}>{selectedCenter.rating} ({selectedCenter.reviews})</span>
                      <div style={{ marginTop: 10 }}>
                        <button className="btn btn-primary btn-sm" style={{ width: "100%", fontSize: ".75rem" }} onClick={handleBooking}>
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindCentres() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return <FindRepairCenter isAuthenticated={isAuthenticated} onBookClick={() => {}} />;
}
