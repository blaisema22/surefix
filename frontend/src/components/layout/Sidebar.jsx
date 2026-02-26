import { T } from '../../styles/tokens';

const CUSTOMER_NAV = [
  { key: "dashboard",     label: "Dashboard",      icon: "th" },
  { key: "findRepair",    label: "Find Repair",     icon: "search" },
  { key: "bookRepair",    label: "Book Repair",     icon: "calendar-alt" },
  { key: "myDevices",     label: "My Devices",      icon: "mobile-alt" },
  { key: "appointments",  label: "Appointments",    icon: "clipboard" },
  { key: "repairHistory", label: "Repair History",  icon: "history" },
  { key: "profile",       label: "Profile",         icon: "user" },
];

const SHOP_NAV = [
  { key: "dashboard",    label: "Dashboard",    icon: "th" },
  { key: "appointments", label: "Appointments", icon: "calendar-alt" },
  { key: "customers",    label: "Customers",    icon: "users" },
  { key: "services",     label: "Services",     icon: "wrench" },
  { key: "status",       label: "Status",       icon: "satellite-dish" },
  { key: "reports",      label: "Reports",      icon: "chart-bar" },
  { key: "profile",      label: "Profile",      icon: "store" },
];

export default function Sidebar({ active, onChange, role, onLogout }) {
  const nav = role === "shop" ? SHOP_NAV : CUSTOMER_NAV;

  return (
    <aside
      style={{
        width: 234,
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
        padding: "22px 14px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 200,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingLeft: 6 }}>
        <div style={{ width: 36, height: 36, background: T.blue, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          <i className="fas fa-wrench"></i>
        </div>
        <span style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontStyle: "italic", fontSize: "1.4rem", color: "#fff", letterSpacing: "-.5px" }}>
          SureFix
        </span>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1 }}>
        {nav.map((n) => (
          <div
            key={n.key}
            className={`nav-link${active === n.key ? " active" : ""}`}
            onClick={() => onChange(n.key)}
          >
            <span style={{ fontSize: "1rem", minWidth: 20, textAlign: "center" }}><i className={`fas fa-${n.icon}`}></i></span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 2 }}>
        <div className="nav-link"><span><i className="fas fa-cog"></i></span><span>Settings</span></div>
        <div className="nav-link" style={{ color: "#fca5a5" }} onClick={onLogout}>
          <span><i className="fas fa-sign-out-alt"></i></span><span>Logout</span>
        </div>
      </div>
    </aside>
  );
}
