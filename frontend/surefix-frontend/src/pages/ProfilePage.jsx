import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

const ProfilePage = () => {
    const { user, logout, login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [avatarUrl, setAvatarUrl] = useState('');
    const [showAvatarInput, setShowAvatarInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
            setAvatarUrl(user.profileImageUrl || '');
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await api.put('/auth/profile', formData);
            if (response.data.success) {
                setSuccess('Profile updated successfully!');
                // Refetch user data to update the context and UI
                const meResponse = await api.get('/auth/me');
                if (meResponse.data.success) {
                    // The login function from AuthContext is used here to update the user's state globally.
                    // It's assumed this function can refresh the user details while keeping the session active.
                    login(meResponse.data.user, localStorage.getItem('token'));
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarSave = async () => {
        if (!avatarUrl.trim()) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await api.put('/auth/profile/picture', { profileImageUrl: avatarUrl });
            if (response.data.success) {
                const meResponse = await api.get('/auth/me');
                if (meResponse.data.success) {
                    login(meResponse.data.user, localStorage.getItem('token'));
                    setSuccess('Profile picture updated successfully!');
                    setShowAvatarInput(false);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile picture.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sf-panel text-white">
                Loading profile...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 800, padding: '36px 40px', paddingBottom: 100 }}>
        <header className="mb-10 text-center animate-fade-in">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-3 block">Security & Identity</span>
            <h1 className="text-4xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Profile Settings</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Manage your professional identity and contact preferences.</p>
        </header>

            {/* Profile Form Card */}
            <div className="glass-card premium-card p-10 animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative group p-1.5 rounded-[2.5rem] border border-white/5 bg-white/[0.03] transition-all hover:border-blue-500/30">
                        <div className="w-28 h-28 rounded-[2rem] overflow-hidden bg-slate-900 flex items-center justify-center shadow-2xl">
                            {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <span className="text-4xl font-normal text-blue-500 italic" style={{ fontFamily: 'var(--font-serif)' }}>{user.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAvatarInput(!showAvatarInput)}
                            className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-blue-600/30 border-2 border-slate-900"
                            title="Change Picture"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>

                    {showAvatarInput && (
                        <div className="mt-8 w-full max-w-sm flex gap-3 animate-slide-up">
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="Paste image URL here..."
                                className="sf-input !py-2.5 !px-4"
                            />
                            <button
                                type="button"
                                onClick={handleAvatarSave}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                Deploy
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {success && (
                        <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-sm">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Full Name</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="sf-input !bg-white/[0.02] focus:!bg-white/[0.04]" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Email Address</label>
                        <input id="email" name="email" type="email" value={formData.email} readOnly className="sf-input opacity-40 grayscale cursor-not-allowed !bg-transparent" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Phone Number</label>
                        <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="sf-input !bg-white/[0.02] focus:!bg-white/[0.04]" />
                    </div>

                    <div className="pt-6">
                        <button type="submit" disabled={loading} className="btn btn-primary w-full h-14 !rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] shadow-[0_10px_30px_rgba(45,124,246,0.3)] transition-all hover:-translate-y-1 active:scale-95">
                            {loading ? (
                                <><svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating Grid...</>
                            ) : ('Push Changes')}
                        </button>
                    </div>
                </form>
            </div>
            </main>
        </div>
    );
};

export default ProfilePage;