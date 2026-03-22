import React, { useState, useEffect } from 'react';
import { centreAPI } from '../../api/centres.api';
import { useToast } from '../../context/ToastContext';
import { Save, Loader2 } from 'lucide-react';
import '../../styles/sf-pages.css';

const ShopProfile = () => {
    const [centre, setCentre] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchCentre = async () => {
            try {
                const res = await centreAPI.getMyCentre();
                if (res.success && res.centre) {
                    setCentre(res.centre);
                    setForm({
                        name: res.centre.name || '',
                        address: res.centre.address || '',
                        phone: res.centre.phone || '',
                        email: res.centre.email || '',
                        opening_time: res.centre.opening_time?.slice(0, 5) || '08:00',
                        closing_time: res.centre.closing_time?.slice(0, 5) || '18:00',
                        working_days: res.centre.working_days || 'Mon-Sat',
                        description: res.centre.description || '',
                    });
                } else {
                    addToast('Could not find a shop profile for your account.', 'error');
                }
            } catch (err) {
                addToast('Failed to load shop profile.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCentre();
    }, [addToast]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await centreAPI.updateMyCentre(form);
            if (res.success) {
                addToast('Shop profile updated successfully!', 'success');
                setCentre(prev => ({ ...prev, ...form }));
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <main style={{ width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100 }}>
                    <div className="sf-skeleton" style={{ height: 80, marginBottom: 28 }} />
                    <div className="sf-skeleton" style={{ height: 400 }} />
                </main>
            </div>
        );
    }

    if (!centre) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <main style={{ width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100, textAlign: 'center' }}>
                    <h1 className="sf-page-title">No Shop Profile Found</h1>
                    <p className="sf-page-sub">It seems you haven't registered a repair centre yet. Please contact support.</p>
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100 }}>
                <div className="sf-anim-up mb-8">
                    <span className="sf-eyebrow">Shop Management</span>
                    <h1 className="sf-page-title">Shop Profile</h1>
                    <p className="sf-page-sub">Manage your public-facing shop details and operating hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="sf-glass sf-anim-up sf-s1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="sf-field"><label htmlFor="name">Shop Name</label><input id="name" name="name" type="text" value={form.name} onChange={handleChange} required /></div>
                        <div className="sf-field"><label htmlFor="address">Address</label><input id="address" name="address" type="text" value={form.address} onChange={handleChange} required /></div>
                        <div className="sf-field"><label htmlFor="phone">Public Phone</label><input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} /></div>
                        <div className="sf-field"><label htmlFor="email">Public Email</label><input id="email" name="email" type="email" value={form.email} onChange={handleChange} /></div>
                        <div className="sf-field"><label htmlFor="opening_time">Opening Time</label><input id="opening_time" name="opening_time" type="time" value={form.opening_time} onChange={handleChange} /></div>
                        <div className="sf-field"><label htmlFor="closing_time">Closing Time</label><input id="closing_time" name="closing_time" type="time" value={form.closing_time} onChange={handleChange} /></div>
                        <div className="sf-field md:col-span-2"><label htmlFor="working_days">Working Days</label><input id="working_days" name="working_days" type="text" value={form.working_days} onChange={handleChange} placeholder="e.g., Mon-Fri, Sun" /></div>
                        <div className="sf-field md:col-span-2"><label htmlFor="description">Shop Description</label><textarea id="description" name="description" value={form.description} onChange={handleChange} rows="4" placeholder="A brief description of your shop and services." /></div>
                    </div>
                    <div className="pt-5 mt-5 border-t border-white/5 flex justify-end">
                        <button type="submit" className="sf-btn-primary" disabled={saving}>
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ShopProfile;