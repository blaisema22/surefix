import { useState } from 'react';
import { T } from '../../styles/tokens';

export default function Topbar({ user, onLogout }) {
  const [notifs] = useState(3);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 234,
        right: 0,
        height: 62,
        background: "#fff",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 28px",
        gap: 18,
        zIndex: 100,
        boxShadow: "0 1px 8px rgba(15,32,68,.05)",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative" }}>
        <input
          className="form-input"
          placeholder="Search anything…"
          style={{ width: 220, background: T.bg, border: "none" }}
        />
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.muted }}>
          <i className="fas fa-search"></i>
        </span>
      </div>

      {/* Notifications */}
      <div style={{ position: "relative", cursor: "pointer", fontSize: "1.25rem", color: T.blue }}>
        <i className="fas fa-bell"></i>
        {notifs > 0 && <span className="notif-pill">{notifs}</span>}
      </div>

      {/* User avatar / logout */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={onLogout}
        title="Logout"
      >
        <div
          style={{
            width: 36, height: 36, background: T.blue, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: ".85rem",
          }}
        >
          {user?.avatar || "?"}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: ".85rem", lineHeight: 1.2 }}>
            {user?.firstName || user?.companyName}
          </div>
          <div style={{ fontSize: ".72rem", color: T.muted, textTransform: "capitalize" }}>
            {user?.role === "shop" ? "Repairer" : "Customer"}
          </div>
        </div>
      </div>
    </header>
  );
}
