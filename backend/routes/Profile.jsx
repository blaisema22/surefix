import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '@/context/AuthContext';

const ShopProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        name: '', address: '', district: '', phone: '', email: '', description: '',
        opening_time: '09:00', closing_time: '18:00', working_days: 'Mon - Sat',
        latitude: '', longitude: ''
    });

    useEffect(() => {
        fetchCentre();
    }, []);

    const fetchCentre = async () => {
        try {
            const res = await api.get('/centres/my/centre');
            if (res.data.success && res.data.centre) {
                const c = res.data.centre;
                setFormData({
                    name: c.name || '',
                    address: c.address || '',
                    district: c.district || '',
                    phone: c.phone || '',
                    email: c.email || '',
                    description: c.description || '',
                    opening_time: c.opening_time || '09:00',
                    closing_time: c.closing_time || '18:00',
                    working_days: c.working_days || 'Mon - Sat',
                    latitude: c.latitude || '',
                    longitude: c.longitude || ''
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Check if we are updating or creating (simplified logic: endpoint handles update if exists)
            const res = await api.put('/centres/my/centre', formData);
            if (res.data.success) {
                setSuccess('Shop profile updated successfully');
            }
        } catch (err) {
            // If 404, it might mean no centre exists yet, try POST
            if (err.response && err.response.status === 404) {
                try {
                    const createRes = await api.post('/centres/my/centre', formData);
                    if (createRes.data.success) {
                        setSuccess('Shop profile created successfully');
                        // Refresh user context if needed to update 'hasCentre' status
                    }
                } catch (createErr) {
                    setError(createErr.response?.data?.message || 'Failed to create profile');
                }
            } else {
                setError(err.response?.data?.message || 'Failed to save changes');
            }
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, name, type = 'text', placeholder, ...props }) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="sf-input"
                {...props}
            />
        </div>
    );

    if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

    return (
        <main className="page-content">
            <header className="mb-8">
                <h1 className="page-title">Shop Profile</h1>
                <p className="page-subtitle">Manage your repair centre's public information.</p>
            </header>

            <form onSubmit={handleSubmit} className="max-w-3xl sf-card">
                {error && <div className="sf-alert sf-alert-error mb-6">{error}</div>}
                {success && <div className="sf-alert sf-alert-success mb-6">{success}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Field label="Shop Name" name="name" required />
                    <Field label="Public Email" name="email" type="email" required />
                    <Field label="Phone Number" name="phone" required />
                    <Field label="District" name="district" required />
                </div>

                <div className="mb-6">
                    <Field label="Full Address" name="address" required />
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="sf-textarea"
                    />
                </div>

                <h3 className="text-lg font-bold text-white mb-4 mt-8 border-b border-white/10 pb-2">Operations & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Field label="Opening Time" name="opening_time" type="time" />
                    <Field label="Closing Time" name="closing_time" type="time" />
                    <Field label="Working Days" name="working_days" placeholder="e.g. Mon - Sat" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Field label="Latitude" name="latitude" type="number" step="any" placeholder="-1.9441" />
                    <Field label="Longitude" name="longitude" type="number" step="any" placeholder="30.0619" />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button type="submit" disabled={saving} className="btn btn-primary px-8">
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default ShopProfile;