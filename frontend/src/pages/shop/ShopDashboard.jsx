import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { StatusBadge } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

export default function ShopDashboard({ onNavigate }) {
  const [apts, setApts] = useState([]);
  useEffect(() => { api("shopAppointments").then(setApts); }, []);

  const stats = [
    { label: "Today's Appointments", val: apts.length },
    { label: "In Progress",          val: apts.filter((a) => a.status === "in_progress").length },
    { label: "Pending Confirmation", val: apts.filter((a) => a.status === "pending").length },
    { label: "Completed Today",      val: 2 },
  ];

  const quickActions = [
    { icon: "calendar-alt", title: "Manage Appointments", desc: "View and update all bookings",          page: "appointments", color: T.blue   },
    { icon: "users", title: "Customer List",        desc: "Browse and manage your customers",     page: "customers",    color: T.teal   },
    { icon: "satellite-dish", title: "Availability Status",  desc: "Update your capacity & time slots",   page: "status",       color: "#7c3aed" },
  ];

  return (
    <PageWrap>
      <div className="fade-up">
        <p style={{ color: T.muted, fontSize: ".9rem", marginBottom: 4 }}>Good morning <i className="fas fa-hand-wave" style={{ marginLeft: 4 }}></i></p>
        <SectionTitle sub="Here's an overview of your repair centre today.">Welcome back, TechFix Pro</SectionTitle>
      </div>

      {/* Stats */}
      <div className="fade-up fade-up-1" style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card card-hover">
            <div className="stat-num">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="fade-up fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {quickActions.map((a) => (
          <div key={a.page} className="card card-hover" style={{ padding: "18px 20px", cursor: "pointer", border: `1.5px solid ${T.border}` }} onClick={() => onNavigate(a.page)}>
            <div style={{ width: 42, height: 42, background: a.color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", marginBottom: 12, color: a.color }}><i className={`fas fa-${a.icon}`}></i></div>
            <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 4 }}>{a.title}</div>
            <div style={{ color: T.muted, fontSize: ".78rem" }}>{a.desc}</div>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="fade-up fade-up-3">
        <SectionTitle sub="Appointments for today" action={<button className="btn btn-ghost btn-sm" onClick={() => onNavigate("appointments")}>View all →</button>}>
          Today's Schedule
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {apts.map((a) => (
            <div key={a.id} className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{a.customerName}</div>
                  <div style={{ color: T.muted, fontSize: ".78rem" }}>{a.phone}</div>
                </div>
                <div style={{ fontSize: ".85rem" }}><span style={{ fontSize: ".72rem", color: T.muted, fontWeight: 600 }}>DEVICE</span><br />{a.device}</div>
                <div style={{ fontSize: ".85rem" }}><span style={{ fontSize: ".72rem", color: T.muted, fontWeight: 600 }}>SERVICE</span><br />{a.service}</div>
                <div style={{ fontSize: ".85rem" }}><span style={{ fontSize: ".72rem", color: T.muted, fontWeight: 600 }}>TIME</span><br />{a.time}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <StatusBadge status={a.status} />
                  <button className="btn btn-ghost btn-sm">Update</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrap>
  );
}
