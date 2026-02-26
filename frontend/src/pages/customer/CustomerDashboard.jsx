import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { useAppointments } from '../../hooks/useAppointments';
import { useDevices } from '../../hooks/useDevices';
import { StatusBadge, Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

export default function CustomerDashboard({ onNavigate, currentUser }) {
  const [stats, setStats] = useState(null);
  const { data: apts, loading: aptsLoading } = useAppointments();
  const { data: devices, loading: devicesLoading } = useDevices();

  useEffect(() => {
    // Fetch appointments and devices on mount
    const fetchData = async () => {
      try {
        // Appointments will be fetched via the hook
        // Calculate stats based on appointments and devices
        if (apts && devices) {
          const upcoming = apts.filter((a) => a.status === "confirmed").length;
          const active = apts.filter((a) => a.status === "in_progress").length;
          const completed = apts.filter((a) => a.status === "completed").length;
          setStats({
            upcoming,
            active,
            completed,
            devices: devices.length || 0,
          });
        }
      } catch (error) {
        console.error("Failed to calculate stats:", error);
      }
    };

    fetchData();
  }, [apts, devices]);

  const quickActions = [
    { icon: "search", title: "Find Repair Centre", desc: "Search nearby shops with live availability",     page: "findRepair", color: T.blue   },
    { icon: "calendar-alt", title: "Book Appointment",   desc: "Schedule a repair at your preferred centre",     page: "bookRepair", color: T.teal   },
    { icon: "mobile-alt", title: "Register Device",    desc: "Add a device to track its repair history",       page: "myDevices",  color: "#7c3aed" },
    { icon: "clipboard", title: "My Appointments",    desc: "View and manage all your bookings",              page: "appointments", color: T.amber },
  ];

  return (
    <PageWrap>
      <div className="fade-up">
        <p style={{ color: T.muted, fontSize: ".9rem", marginBottom: 4 }}>Good morning <i className="fas fa-hand-wave" style={{ marginLeft: 4 }}></i></p>
        <SectionTitle sub="Here's what's happening with your devices today.">
          Welcome back, {currentUser?.firstName || 'User'}
        </SectionTitle>
      </div>

      {/* Stats */}
      <div className="fade-up fade-up-1" style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        {[["Upcoming", stats?.upcoming], ["Active Repairs", stats?.active], ["Completed Repairs", stats?.completed], ["My Devices", stats?.devices]].map(([l, v]) => (
          <div key={l} className="stat-card card-hover">
            {stats ? <div className="stat-num">{v}</div> : <Skeleton h={44} />}
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="fade-up fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
        {quickActions.map((a) => (
          <div key={a.page} className="card card-hover" style={{ padding: "20px 22px", cursor: "pointer", border: `1.5px solid ${T.border}` }} onClick={() => onNavigate(a.page)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, background: a.color + "18", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, color: a.color }}><i className={`fas fa-${a.icon}`}></i></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 3 }}>{a.title}</div>
                <div style={{ color: T.muted, fontSize: ".8rem" }}>{a.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active appointments */}
      <div className="fade-up fade-up-3">
        <SectionTitle sub="Your currently active repairs" action={<button className="btn btn-ghost btn-sm" onClick={() => onNavigate("appointments")}>View all →</button>}>
          Active Appointments
        </SectionTitle>
        {aptsLoading ? (
          <div className="card">
            <Skeleton h={100} />
          </div>
        ) : !apts || apts.filter((a) => a.status === "in_progress").length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📋</div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.05rem" }}>No active repairs</div>
            <p style={{ color: T.muted, marginBottom: 20, fontSize: ".875rem" }}>Book your first repair appointment to get started</p>
            <button className="btn btn-primary" onClick={() => onNavigate("findRepair")}><i className="fas fa-search" style={{ marginRight: 8 }}></i>Find a Repair Centre</button>
          </div>
        ) : (
          apts.filter((a) => a.status === "in_progress").map((a) => (
            <div key={a.id} className="card" style={{ padding: "20px 24px", marginBottom: 12, border: `1.5px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{a.shopName || a.shop}</div>
                    <div style={{ color: T.muted, fontSize: ".8rem" }}>{a.shopAddress || a.address}</div>
                    <div style={{ marginTop: 8, fontSize: ".8rem" }}><span style={{ fontWeight: 600, color: T.muted }}>Date: </span><span>{a.appointmentDate || a.date} · {a.appointmentTime || a.time}</span></div>
                  </div>
                  <div><div style={{ fontSize: ".75rem", color: T.muted, fontWeight: 600, marginBottom: 3 }}>DEVICE</div><div style={{ fontWeight: 600, fontSize: ".875rem" }}>{a.deviceName || a.device}</div></div>
                  <div><div style={{ fontSize: ".75rem", color: T.muted, fontWeight: 600, marginBottom: 3 }}>SERVICE</div><div style={{ fontWeight: 600, fontSize: ".875rem" }}>{a.serviceName || a.service}</div></div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              {a.technicianNote && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "#f0f7ff", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: ".8rem" }}>
                  <span style={{ fontWeight: 700, color: T.blue }}><i className="fas fa-wrench" style={{ marginRight: 8 }}></i>Technician: </span>
                  <span style={{ color: T.navyMid }}>{a.technicianNote}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </PageWrap>
  );
}
