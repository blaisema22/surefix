export const statusConfig = {
  in_progress: { label:'In Progress', cls:'badge-blue',   dot:'dot-blue'  },
  confirmed:   { label:'Confirmed',   cls:'badge-green',  dot:'dot-green' },
  pending:     { label:'Pending',     cls:'badge-amber',  dot:'dot-amber' },
  completed:   { label:'Completed',   cls:'badge-green',  dot:'dot-green' },
  cancelled:   { label:'Cancelled',   cls:'badge-red',    dot:'dot-red'   },
  needs_repair:{ label:'Needs Repair',cls:'badge-red',    dot:'dot-red'   },
  healthy:     { label:'Healthy',     cls:'badge-green',  dot:'dot-green' },
  active:      { label:'Open',        cls:'badge-green',  dot:'dot-green' },
  inactive:    { label:'Closed',      cls:'badge-red',    dot:'dot-red'   },
};
export default function StatusBadge({ status }) {
  const s = statusConfig[status] || { label: status, cls:'badge-gray', dot:'dot-gray' };
  return <span className={`badge ${s.cls}`}><span className={`dot ${s.dot}`} />{s.label}</span>;
}