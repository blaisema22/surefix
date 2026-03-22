import React, { useState, useEffect, useCallback } from 'react';
import { getMyServices, addService, updateService, deleteService } from '../../api/shop';

const initialFormState = {
    service_name: '',
    device_category: 'smartphone',
    description: '',
    estimated_duration_minutes: '60'
};

export default function ManageServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMyServices();
            if (response.success) {
                setServices(response.services || []);
            }
        } catch (err) {
            setError('Failed to load services.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleOpenModal = (service = null) => {
        setError(null);
        if (service) {
            setEditingId(service.service_id);
            setFormData({
                service_name: service.service_name,
                device_category: service.device_category,
                description: service.description || '',
                estimated_duration_minutes: service.estimated_duration_minutes
            });
        } else {
            setEditingId(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await deleteService(id);
            setServices(prev => prev.filter(s => s.service_id !== id));
        } catch (err) {
            alert('Failed to delete service. It might be linked to active appointments.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateService(editingId, formData);
                await fetchServices();
            } else {
                await addService(formData);
                await fetchServices();
            }
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert('Failed to save service. Please check your inputs.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-300 text-center">Loading services...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-1 font-sora tracking-tight">Manage Services</h2>
                    <p className="text-slate-400 text-sm">Define the repairs you offer and their durations.</p>
                </div>
                <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => handleOpenModal()}
                >
                    <i className="fa-solid fa-circle-plus"></i> Add New Service
                </button>
            </div>

            {error && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            {services.length === 0 && !loading ? (
                <div className="text-center p-12 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                    <p className="mb-4">No services listed yet.</p>
                    <button
                        className="btn btn-secondary flex items-center gap-2 mx-auto"
                        onClick={() => handleOpenModal()}
                    >
                        <i className="fa-solid fa-circle-plus"></i> Create your first service
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <div key={service.service_id} className="sf-card flex flex-col items-start border border-slate-700/50 hover:border-blue-500/30 transition-all bg-[#0B1120] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                            <div className="flex w-full justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-50 m-0 leading-tight">{service.service_name}</h3>
                                <span className="badge bg-slate-500/15 text-slate-300 border-slate-500/25 capitalize truncate max-w-[100px]">{service.device_category}</span>
                            </div>

                            <p className="text-sm text-slate-400 flex-grow mb-6 line-clamp-3 leading-relaxed">
                                {service.description || 'No description provided.'}
                            </p>

                            <div className="w-full flex items-center justify-between text-sm text-slate-300 mb-6 pt-4 border-t border-white/5">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <i className="fa-solid fa-clock opacity-70"></i> {service.estimated_duration_minutes} mins
                                </span>
                            </div>

                            <div className="flex gap-3 w-full mt-auto">
                                <button
                                    className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-700"
                                    onClick={() => handleOpenModal(service)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="flex-1 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-lg transition-colors border border-red-500/20"
                                    onClick={() => handleDelete(service.service_id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
                    <div className="bg-[#0F172A] p-6 lg:p-8 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-6 tracking-tight font-sora">
                            {editingId ? 'Edit Service' : 'Add New Service'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Service Name</label>
                                <input
                                    required
                                    className="w-full px-4 py-2.5 bg-[#070D1A] border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-dm-sans"
                                    value={formData.service_name}
                                    onChange={e => setFormData({ ...formData, service_name: e.target.value })}
                                    placeholder="e.g. Screen Replacement"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Device Category</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-[#070D1A] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-dm-sans"
                                    value={formData.device_category}
                                    onChange={e => setFormData({ ...formData, device_category: e.target.value })}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="smartphone">Smartphone</option>
                                    <option value="tablet">Tablet</option>
                                    <option value="laptop">Laptop</option>
                                    <option value="desktop">Desktop</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Duration (Minutes)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-2.5 bg-[#070D1A] border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-dm-sans"
                                    value={formData.estimated_duration_minutes}
                                    onChange={e => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
                                    placeholder="e.g. 60"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-[#070D1A] border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-24 font-dm-sans leading-relaxed"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Details about what is included..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-semibold text-sm"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary shadow-lg shadow-blue-500/25 px-6"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}