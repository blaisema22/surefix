// ─── ShopCustomers.jsx ───────────────────────────────────────────────────────
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCustomers } from '../../api/shop';
import { Search, Download, RefreshCw, Users, ChevronRight, Mail, Phone } from 'lucide-react';
import '../../styles/sf-pages.css';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'recent', label: 'Recent' },
    { key: 'frequent', label: 'Frequent' },
];

export const ShopCustomers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const load = useCallback(async () => {
        try {
            setLoading(true); setError(null);
          const res = await getMyCustomers();
          if (res?.success) setCustomers(res.customers ?? []);
          else throw new Error(res?.message ?? 'Failed to load customers.');
      } catch (err) { setError(err.message ?? 'Failed to load customers.'); }
      finally { setLoading(false); }
  }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        let data = [...customers];
      if (search.trim()) {
          const q = search.toLowerCase();
          data = data.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
      }
      if (filter === 'recent') { data.sort((a, b) => new Date(b.last_appointment) - new Date(a.last_appointment)); if (!search.trim()) data = data.slice(0, 20); }
      if (filter === 'frequent') { data.sort((a, b) => b.total_bookings - a.total_bookings); if (!search.trim()) data = data.slice(0, 20); }
      return data;
  }, [customers, filter, search]);

    const handleExport = () => {
      if (!filtered.length) return;
      const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Last Visit'];
      const rows = filtered.map(c => [`"${c.name}"`, c.email, c.phone || '', c.total_bookings, new Date(c.last_appointment).toLocaleDateString()]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
  };

    return (
      <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="sf-page-wrap">

              {/* Header */}
              <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                  <div>
                      <span className="sf-eyebrow">Clientele</span>
                      <h1 className="sf-page-title">Customers</h1>
                      <p className="sf-page-sub">Users who have booked with your repair centre.</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                      <div className="sf-search-wrap" style={{ margin: 0, width: 220 }}>
                          <Search size={15} className="sf-search-icon" />
                          <input className="sf-search-input" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
                      <button className="sf-btn-ghost" onClick={handleExport} disabled={!filtered.length} title="Export CSV">
                          <Download size={14} />
                      </button>
                      <button className="sf-btn-ghost" onClick={load} disabled={loading}>
                          <RefreshCw size={14} className={loading ? 'sf-spinner' : ''} />
                      </button>
                  </div>
              </div>

              {/* Filter tabs */}
              <div className="sf-filter-bar sf-anim-up sf-s1">
                  {FILTERS.map(f => (
                      <button key={f.key} className={`sf-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                          {f.label}
                      </button>
                  ))}
              </div>

              {error && <div className="sf-error" style={{ marginBottom: 16 }}>{error}</div>}

              {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map(i => <div key={i} className="sf-skeleton" style={{ height: 68 }} />)}
                  </div>
              ) : filtered.length === 0 ? (
                  <div className="sf-empty sf-anim-up">
                      <div className="sf-empty-icon"><Users size={22} /></div>
                      <div className="sf-empty-title">No customers found</div>
                          <p className="sf-empty-sub">Try adjusting your search or filters.</p>
                      </div>
                  ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {filtered.map((c, i) => (
                                  <div key={c.user_id}
                                      className={`sf-anim-up sf-s${Math.min(i + 1, 6)}`}
                                      onClick={() => navigate(`/shop/customers/${c.user_id}`, { state: { customer: c } })}
                                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.18s' }}
                                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}
                                  >
                                      {/* Avatar */}
                                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,rgba(249,115,22,0.25),rgba(234,88,12,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#f97316', flexShrink: 0 }}>
                                          {c.name?.charAt(0).toUpperCase()}
                                      </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{c.name}</div>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                <Mail size={10} /> {c.email}
                            </span>
                            {c.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                                    <Phone size={10} /> {c.phone}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Bookings */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'rgba(249,115,22,0.85)' }}>{c.total_bookings}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>bookings</div>
                    </div>
                    <ChevronRight size={15} color="rgba(255,255,255,0.15)" style={{ flexShrink: 0 }} />
                </div>
            ))}
                          </div>
              )}

              {/* Count */}
              {!loading && filtered.length > 0 && (
                  <div style={{ marginTop: 18, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                      Showing {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
                  </div>
              )}

          </div>
      </div>
  );
};

export default ShopCustomers;