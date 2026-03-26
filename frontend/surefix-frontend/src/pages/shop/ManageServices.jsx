import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getMyServices, addService, updateService, deleteService } from '../../api/shop';
import { Plus, Edit3, Trash2, Search, Clock, CheckCircle, XCircle, Layers, RefreshCw } from 'lucide-react';
import '../../styles/sf-pages.css';

const svcStyles = `
.svc-card {
  background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
  border-radius:16px; padding:20px 22px;
  transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  position:relative; overflow:hidden;
}
.svc-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#f97316,#ea580c); opacity:0; transition:opacity 0.2s; border-radius:16px 16px 0 0; }
.svc-card:hover { border-color:rgba(249,115,22,0.2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.25); }
.svc-card:hover::before { opacity:1; }
.svc-name { font-size:15px; font-weight:700; color:rgba(255,255,255,0.85); margin-bottom:5px; }
.svc-desc { font-size:12px; color:rgba(255,255,255,0.3); line-height:1.55; margin-bottom:14px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.svc-meta { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.svc-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); font-size:11px; color:rgba(255,255,255,0.4); }
.svc-avail-on  { background:rgba(34,197,94,0.08);  color:rgba(74,222,128,0.75);  border-color:rgba(34,197,94,0.18); }
.svc-avail-off { background:rgba(239,68,68,0.07);  color:rgba(252,165,165,0.65); border-color:rgba(239,68,68,0.15); }
`;

const DEVICE_CATS = ['smartphone', 'tablet', 'laptop', 'desktop', 'other'];
const INIT_FORM = { service_name: '', device_category: 'smartphone', description: '', estimated_duration_minutes: '60', base_price: '', is_available: true };

const ServiceForm = ({ service, onSave, onCancel, saving }) => {
    const [form, setForm] = useState(INIT_FORM);
    useEffect(() => {
      if (service) setForm({ service_name: service.service_name || '', device_category: service.device_category || 'smartphone', description: service.description || '', estimated_duration_minutes: service.estimated_duration_minutes || '60', base_price: service.base_price || '', is_available: service.is_available !== undefined ? service.is_available : true });
      else setForm(INIT_FORM);
  }, [service]);

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const handleSubmit = e => { e.preventDefault(); onSave(form); };

    return (
      <div className="sf-glass sf-anim-scale" style={{ marginBottom: 24 }}>
          <div className="sf-glass-title">{service ? 'Edit Service' : 'Add New Service'}</div>
          <div className="sf-glass-sub">Fill in the service details below.</div>
          <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="sf-field">
                      <label>Service Name</label>
                      <input type="text" value={form.service_name} onChange={set('service_name')} placeholder="e.g. Screen Replacement" required />
                  </div>
                  <div className="sf-field">
                      <label>Device Category</label>
                      <select value={form.device_category} onChange={set('device_category')}>
                          {DEVICE_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                  </div>
                  <div className="sf-field">
                      <label>Duration (minutes)</label>
                      <input type="number" value={form.estimated_duration_minutes} onChange={set('estimated_duration_minutes')} placeholder="60" />
                  </div>
                  <div className="sf-field" style={{ gridColumn: '1/-1' }}>
                      <label>Description</label>
                      <textarea value={form.description} onChange={set('description')} placeholder="What's included in this service…" />
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label className="sf-toggle" style={{ flexShrink: 0 }}>
                          <input type="checkbox" checked={form.is_available} onChange={set('is_available')} />
                          <span className="sf-toggle-slider" />
                      </label>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Service is active / available to customers</span>
                  </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button type="button" className="sf-btn-ghost" onClick={onCancel}>Cancel</button>
                  <button type="submit" className="sf-btn-primary" disabled={saving}>
                      {saving ? <><span className="sf-spinner" />Saving…</> : service ? 'Save Changes' : 'Add Service'}
                  </button>
              </div>
          </form>
      </div>
  );
};

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null); // null=hidden, true=new, service obj=edit
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true);
      try {
          const res = await getMyServices();
          if (res.success) setServices(res.services || []);
      } catch { setError('Failed to load services.'); }
      finally { setLoading(false); }
  }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const filtered = useMemo(() =>
        search ? services.filter(s => s.service_name.toLowerCase().includes(search.toLowerCase())) : services
        , [services, search]);

    const handleSave = async (formData) => {
      setSaving(true); setError('');
      try {
          if (editing && editing !== true) await updateService(editing.service_id, formData);
          else await addService(formData);
          setEditing(null);
          await fetch();
      } catch (err) { setError(err.response?.data?.message || 'Failed to save service.'); }
      finally { setSaving(false); }
  };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service? This action cannot be undone.')) return;
        try { await deleteService(id); await fetch(); }
        catch (err) { alert(err.response?.data?.message || 'Failed to delete. May be linked to active appointments.'); }
    };

    return (
      <>
          <style>{svcStyles}</style>
          <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="sf-page-wrap">

                  {/* Header */}
                  <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                      <div>
                          <span className="sf-eyebrow">Service Management</span>
                          <h1 className="sf-page-title">Manage Services</h1>
                          <p className="sf-page-sub">Define the repairs you offer and their pricing.</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                          <button className="sf-btn-ghost" onClick={fetch} disabled={loading}><RefreshCw size={14} /></button>
                          {!editing && (
                              <button className="sf-btn-primary" onClick={() => setEditing(true)}>
                                  <Plus size={15} /> Add Service
                              </button>
                          )}
                      </div>
                  </div>

                  {/* Error */}
                  {error && <div className="sf-error" style={{ marginBottom: 16 }}>{error}</div>}

                  {/* Form */}
                  {editing && (
                      <ServiceForm
                          service={editing === true ? null : editing}
                          onSave={handleSave}
                          onCancel={() => { setEditing(null); setError(''); }}
                          saving={saving}
                      />
                  )}

                  {/* Search */}
                  <div className="sf-search-wrap sf-anim-up sf-s1">
                      <Search size={15} className="sf-search-icon" />
                      <input className="sf-search-input" placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>

                  {/* Grid */}
                  {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map(i => <div key={i} className="sf-skeleton" style={{ height: 180 }} />)}
                      </div>
                  ) : filtered.length === 0 ? (
                      <div className="sf-empty sf-anim-up">
                          <div className="sf-empty-icon"><Layers size={22} /></div>
                          <div className="sf-empty-title">{search ? 'No services match your search' : 'No services yet'}</div>
                          <p className="sf-empty-sub">{search ? 'Try a different keyword.' : 'Add your first service to get started.'}</p>
                          {!search && <button className="sf-btn-primary" onClick={() => setEditing(true)}><Plus size={14} /> Add Service</button>}
                      </div>
                  ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {filtered.map((svc, i) => (
                                      <div key={svc.service_id} className={`svc-card sf-anim-up sf-s${Math.min(i + 1, 6)}`}>
                                          <div className="svc-name">{svc.service_name}</div>
                                          <div className="svc-desc">{svc.description || 'No description provided.'}</div>
                                          <div className="svc-meta">
                                              <span className="svc-pill"><Clock size={11} />{svc.estimated_duration_minutes} min</span>
                                              <span className="svc-pill" style={{ textTransform: 'capitalize' }}>{svc.device_category}</span>
                                              <span className={`svc-pill ${svc.is_available ? 'svc-avail-on' : 'svc-avail-off'}`}>
                                                  {svc.is_available ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                  {svc.is_available ? 'Active' : 'Offline'}
                                              </span>
                                          </div>
                      <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <button className="sf-btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 12, justifyContent: 'center' }} onClick={() => setEditing(svc)}>
                              <Edit3 size={13} /> Edit
                          </button>
                          <button className="sf-btn-danger" style={{ flex: 1, padding: '8px', fontSize: 12, justifyContent: 'center' }} onClick={() => handleDelete(svc.service_id)}>
                              <Trash2 size={13} /> Delete
                          </button>
                      </div>
                  </div>
              ))}
                              </div>
                  )}

              </div>
          </div>
      </>
  );
};

export default ManageServices;