import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Plus, Edit2, Trash2, X, Save, AlertCircle,
    ArrowLeft, Loader2, DollarSign, Clock, LayoutGrid
} from 'lucide-react';

const CATEGORIES = ['smartphone', 'tablet', 'laptop', 'desktop', 'other'];

const ManageServices = () => {
    const navigate = useNavigate();
    const [centre, setCentre] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        service_name: '',
        device_category: 'smartphone',
        description: '',
        estimated_price_min: '',
        estimated_price_max: '',
        estimated_duration_minutes: 60
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Get my centre to know the ID
                const centreRes = await api.get('/centres/my/centre');
                if (centreRes.data.success && centreRes.data.centre) {
                    const c = centreRes.data.centre;
                    setCentre(c);

                    // 2. Get services for this centre
                    const servicesRes = await api.get(`/services?centre_id=${c.centre_id}`);
                    if (servicesRes.data.success) {
                        setServices(servicesRes.data.services);
                    }
                } else {
                    setError('Could not find your repair centre details. Please register your shop first.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load services. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEdit = (service) => {
        setFormData({
            service_name: service.service_name,
            device_category: service.device_category,
            description: service.description || '',
            estimated_price_min: service.estimated_price_min,
            estimated_price_max: service.estimated_price_max,
            estimated_duration_minutes: service.estimated_duration_minutes
        });
        setEditingId(service.service_id);
        setIsFormOpen(true);
        setError('');
    };

    const handleAddNew = () => {
        setFormData({
            service_name: '',
            device_category: 'smartphone',
            description: '',
            estimated_price_min: '',
            estimated_price_max: '',
            estimated_duration_minutes: 60
        });
        setEditingId(null);
        setIsFormOpen(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const payload = {
                ...formData,
                centre_id: centre.centre_id,
                estimated_price_min: Number(formData.estimated_price_min),
                estimated_price_max: Number(formData.estimated_price_max),
                estimated_duration_minutes: Number(formData.estimated_duration_minutes)
            };

            if (editingId) {
                await api.put(`/services/${editingId}`, payload);
            } else {
                await api.post('/services', payload);
            }

            // Refresh list
            const servicesRes = await api.get(`/services?centre_id=${centre.centre_id}`);
            if (servicesRes.data.success) {
                setServices(servicesRes.data.services);
            }
            setIsFormOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save service.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            await api.delete(`/services/${id}`);
            setServices(prev => prev.filter(s => s.service_id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete service.');
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0B0F1A] text-white p-6 flex justify-center items-center"><Loader2 className="animate-spin mr-2" /> Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-white">Manage Services</h1>
                        <p className="text-gray-400 text-sm mt-1">{centre?.name}</p>
                    </div>
                    {!isFormOpen && (
                        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
                            <Plus size={18} /> Add Service
                        </button>
                    )}
                </div>

                {error && <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

                {/* Form Section */}
                {isFormOpen ? (
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Service Name</label>
                                    <input type="text" required className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Screen Replacement" value={formData.service_name} onChange={e => setFormData({ ...formData, service_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <select className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.device_category} onChange={e => setFormData({ ...formData, device_category: e.target.value })}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Min Price (RWF)</label>
                                    <input type="number" required className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" value={formData.estimated_price_min} onChange={e => setFormData({ ...formData, estimated_price_min: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Max Price (RWF)</label>
                                    <input type="number" required className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" value={formData.estimated_price_max} onChange={e => setFormData({ ...formData, estimated_price_max: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Minutes)</label>
                                    <input type="number" required className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="60" value={formData.estimated_duration_minutes} onChange={e => setFormData({ ...formData, estimated_duration_minutes: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Describe the service..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">Cancel</button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Service
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* List Section */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.length > 0 ? services.map(service => (
                            <div key={service.service_id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{service.service_name}</h3>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-800 px-2 py-1 rounded">{service.device_category}</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{service.description || 'No description provided.'}</p>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-center text-sm text-gray-300 gap-2"><DollarSign size={14} className="text-green-500" /> {Number(service.estimated_price_min).toLocaleString()} - {Number(service.estimated_price_max).toLocaleString()} RWF</div>
                                    <div className="flex items-center text-sm text-gray-300 gap-2"><Clock size={14} className="text-blue-500" /> ~{service.estimated_duration_minutes} Mins</div>
                                </div>
                                <div className="flex gap-2 border-t border-gray-800 pt-4 mt-auto">
                                    <button onClick={() => handleEdit(service)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-sm font-medium flex justify-center items-center gap-2 transition-colors"><Edit2 size={14} /> Edit</button>
                                    <button onClick={() => handleDelete(service.service_id)} className="flex-1 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded text-sm font-medium flex justify-center items-center gap-2 transition-colors"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl bg-[#111827]/50">
                                <LayoutGrid size={48} className="mb-4 opacity-50" />
                                <p>No services listed yet.</p>
                                <button onClick={handleAddNew} className="mt-4 text-blue-400 hover:text-blue-300 font-medium text-sm">Add your first service</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageServices;