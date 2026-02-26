// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
export const statusConfig = {
  in_progress:  { label: "In Progress",  cls: "badge-blue",  dot: "dot-blue"  },
  confirmed:    { label: "Confirmed",    cls: "badge-green", dot: "dot-green" },
  pending:      { label: "Pending",      cls: "badge-amber", dot: "dot-amber" },
  completed:    { label: "Completed",    cls: "badge-green", dot: "dot-green" },
  cancelled:    { label: "Cancelled",    cls: "badge-red",   dot: "dot-red"   },
  needs_repair: { label: "Needs Repair", cls: "badge-red",   dot: "dot-red"   },
  healthy:      { label: "Healthy",      cls: "badge-green", dot: "dot-green" },
};

// ── SHARED UI COMPONENTS ──────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const s = statusConfig[status] || { label: status, cls: "badge-gray", dot: "dot-gray" };
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`dot ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function Stars({ rating }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="rating-star">
          {i < Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export function Skeleton({ h = 40, w = "100%", mb = 0 }) {
  return <div className="sk" style={{ height: h, width: w, marginBottom: mb }} />;
}
