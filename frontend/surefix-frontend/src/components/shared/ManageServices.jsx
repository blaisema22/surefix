import React, { useState, useEffect } from 'react';
import { centreAPI } from '../../components/shared/centres.api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { Plus, Edit3, Trash2, Smartphone, Laptop, Tablet, Monitor, Wrench, X, Loader2 } from 'lucide-react';
import '../../styles/sf-pages.css';

const SERVICE_CATEGORIES = [
    { value: 'smartphone', label: 'Smartphone', icon: <Smartphone size={16} /> },
    { value: 'laptop', label: 'Laptop', icon: <Laptop size={16} /> },
    { value: 'tablet', label: 'Tablet', icon: <Tablet size={16} /> },
    { value: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
    { value: 'other', label: 'Other', icon: <Wrench size={16} /> },
];

const ServiceForm = ({ service, onSave, onCancel, saving }) => {
    const [form, setForm] = useState({
        service_name: service?.service_name || '',
        device_category: service?.device_category || 'smartphone',
        estimated_price_min: service?.estimated_price_min || '',
        estimated_duration_minutes: service?.estimated_duration_minutes || '60'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="sf-modal-overlay" onClick={onCancel}>
            <div className="sf-modal" onClick={e => e.stopPropagation()}>
                <div className="sf-modal-header">
                    <span className="sf-modal-title">{service ? 'Edit Service' : 'Add New Service'}</span>
                    <button className="sf-modal-close" onClick={onCancel}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="sf-modal-body">
                    <div className="sf-field">
                        <label>Service Name</label>
                        <input
                            required
                            value={form.service_name}
                            onChange={e => setForm({ ...form, service_name: e.target.value })}
                            placeholder="e.g. Screen Replacement"
                        />
                    </div>
                    <div className="sf-field">
                        <label>Device Category</label>
                        <select
                            value={form.device_category}
                            onChange={e => setForm({ ...form, device_category: e.target.value })}
                        >
                            {SERVICE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="sf-field">
                        <label>Duration (Min)</label>
                        <input
                            type="number"
                            min="5"
                            value={form.estimated_duration_minutes}
                            onChange={e => setForm({ ...form, estimated_duration_minutes: e.target.value })}
                        />
                    </div>
                    <div className="sf-modal-footer">
                        <button type="button" className="sf-btn-ghost" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="sf-btn-primary" disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" size={16} /> : (service ? 'Save Changes' : 'Add Service')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await centreAPI.getMyServices();
            if (res.success) {
                setServices(res.services || []);
            }
        } catch (err) {
            addToast('Failed to load services', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (editingService) {
                await centreAPI.updateService(editingService.service_id, formData);
                addToast('Service updated successfully', 'success');
            } else {
                await centreAPI.addService(formData);
                addToast('Service added successfully', 'success');
            }
            setIsFormOpen(false);
            setEditingService(null);
            fetchServices();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to save service', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await centreAPI.deleteService(deleteId);
            addToast('Service deleted', 'success');
            setServices(prev => prev.filter(s => s.service_id !== deleteId));
        } catch (err) {
            addToast('Failed to delete service', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100 }}>
                <div className="flex justify-between items-end mb-8 sf-anim-up">
                    <div>
                        <span className="sf-eyebrow">Offerings</span>
                        <h1 className="sf-page-title">Manage Services</h1>
                        <p className="sf-page-sub">Define the repair services and pricing for your shop.</p>
                    </div>
                    <button className="sf-btn-primary" onClick={() => { setEditingService(null); setIsFormOpen(true); }}>
                        <Plus size={16} /> Add Service
                    </button>
                </div>

                {loading ? (
                    <div className="sf-skeleton h-24 mb-4" />
                ) : services.length === 0 ? (
                    <div className="sf-empty sf-anim-up">
                        <div className="sf-empty-icon"><Wrench size={24} /></div>
                        <div className="sf-empty-title">No services listed</div>
                        <p className="sf-empty-sub">Add your first service to start accepting bookings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service, i) => (
                            <div key={service.service_id} className={`sf-select-card flex justify-between items-center sf-anim-up sf-s${Math.min(i + 1, 6)}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-bold">{service.service_name}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">{service.device_category}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {service.estimated_duration_minutes} mins
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" onClick={() => { setEditingService(service); setIsFormOpen(true); }}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="p-2 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" onClick={() => setDeleteId(service.service_id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isFormOpen && (
                    <ServiceForm
                        service={editingService}
                        onSave={handleSave}
                        onCancel={() => setIsFormOpen(false)}
                        saving={saving}
                    />
                )}

                <ConfirmModal
                    open={!!deleteId}
                    title="Delete Service"
                    message="Are you sure? This will remove the service from your shop listing."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                    danger
                />
            </main>
        </div>
    );
};

export default ManageServices;