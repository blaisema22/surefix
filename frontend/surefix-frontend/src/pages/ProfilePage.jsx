import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/api/axios';
import { 
    User, Lock, Bell, Trash2, Check, AlertCircle, 
    Camera, ShieldCheck, Mail, Phone, ChevronRight 
} from 'lucide-react';
import '../styles/sf-pages.css';

/* ── Feedback Component ── */
const Feedback = ({ success, error }) => (
    <div className="mt-4">
        {success && (
            <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-sm animate-in fade-in zoom-in-95">
                <Check size={16} />
                {success}
            </div>
        )}
        {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm animate-in fade-in zoom-in-95">
                <AlertCircle size={16} />
                {error}
            </div>
        )}
    </div>
);

/* ── Profile Form ── */
const ProfileUpdateForm = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
    });
    const [avatarUrl, setAvatarUrl] = useState(user.profileImageUrl || '');
    const [showAvatarInput, setShowAvatarInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        try {
            const response = await api.put('/auth/profile', formData);
            if (response.data.success) {
                const meResponse = await api.get('/auth/me');
                if (meResponse.data.success) {
                    updateUser(meResponse.data.user);
                    setSuccess('Profile updated successfully!');
                    setTimeout(() => setSuccess(''), 3000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally { setLoading(false); }
    };

    const handleAvatarSave = async () => {
        if (!avatarUrl.trim()) return;
        setLoading(true); setError(''); setSuccess('');
        try {
            const response = await api.put('/auth/profile/picture', { profileImageUrl: avatarUrl });
            if (response.data.success) {
                const meResponse = await api.get('/auth/me');
                if (meResponse.data.success) {
                    updateUser(meResponse.data.user);
                    setSuccess('Profile picture updated successfully!');
                    setShowAvatarInput(false);
                    setTimeout(() => setSuccess(''), 3000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile picture.');
        } finally { setLoading(false); }
    };

    return (
        <div className="glass-card premium-card p-8 md:p-10 animate-slide-up relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30" />
            
            <div className="flex flex-col items-center mb-10">
                <div className="relative group p-1 rounded-[2.5rem] border border-white/5 bg-white/[0.03] transition-all hover:border-blue-500/30">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-slate-900 flex items-center justify-center shadow-2xl">
                        {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" />
                        ) : (
                            <span className="text-3xl font-normal text-blue-500 italic" style={{ fontFamily: 'var(--font-serif)' }}>{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <button type="button" onClick={() => setShowAvatarInput(!showAvatarInput)} className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-all shadow-xl border-2 border-slate-900">
                        <Camera size={14} />
                    </button>
                </div>

                {showAvatarInput && (
                    <div className="mt-6 w-full max-w-sm flex gap-2 animate-in slide-in-from-top-2 duration-300">
                        <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Paste image URL..." className="sf-input !py-2 !px-4 text-xs" />
                        <button type="button" onClick={handleAvatarSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50">Deploy</button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                    <div className="relative group">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                        <input name="name" type="text" value={formData.name} onChange={handleChange} required className="sf-input !pl-11 !bg-white/[0.01]" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                    <div className="relative opacity-50">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input type="email" value={user.email} readOnly className="sf-input !pl-11 !bg-transparent cursor-not-allowed" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Phone Number</label>
                    <div className="relative group">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="sf-input !pl-11 !bg-white/[0.01]" />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} className="sf-btn-primary w-full h-12 !rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                        {loading ? 'Updating Grid...' : 'Push Changes'}
                    </button>
                </div>
                <Feedback success={success} error={error} />
            </form>
        </div>
    );
};

/* ── Password Form ── */
const PasswordChangeForm = () => {
    const initial = { currentPassword: '', newPassword: '', confirmPassword: '' };
    const [form, setForm] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const set = field => e => { if (error) setError(''); setForm(p => ({ ...p, [field]: e.target.value })); };

    const handleSubmit = async e => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match.');
        if (form.newPassword.length < 6) return setError('At least 6 characters required.');
        setLoading(true); setError(''); setSuccess('');
        try {
            const res = await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
            if (res.data.success) {
                setSuccess('Security credentials updated.');
                setForm(initial);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) { setError(err.response?.data?.message || 'Failed to update security.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="glass-card premium-card p-8 md:p-10 animate-slide-up h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Lock size={16} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Security</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Credentials</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {[
                    { label: 'Current Password', field: 'currentPassword' },
                    { label: 'New Password', field: 'newPassword' },
                    { label: 'Confirm New Password', field: 'confirmPassword' },
                ].map(({ label, field }) => (
                    <div key={field} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</label>
                        <input type="password" value={form[field]} onChange={set(field)} required className="sf-input !bg-white/[0.01]" />
                    </div>
                ))}
                
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="sf-btn bg-white/5 hover:bg-white/10 text-white w-full h-12 !rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/5 transition-all active:scale-95">
                        {loading ? 'Processing...' : 'Change Security Key'}
                    </button>
                </div>
                <Feedback success={success} error={error} />
            </form>
        </div>
    );
};

/* ── Notification Settings ── */
const NotificationSettings = () => {
    const { isMuted, toggleMute, dndUntil, enableDnd, disableDnd } = useNotifications();
    const isDndActive = dndUntil && new Date() < new Date(dndUntil);

    return (
        <div className="glass-card premium-card p-8 md:p-10 animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Bell size={16} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Preferences</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alert Protocols</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div>
                        <div className="text-sm font-bold text-white mb-1">Alert Audio</div>
                        <div className="text-xs text-slate-500">Play sounds for incoming transmissions.</div>
                    </div>
                    <label className="sf-toggle">
                        <input type="checkbox" checked={!isMuted} onChange={toggleMute} />
                        <span className="sf-toggle-slider" />
                    </label>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-sm font-bold text-white mb-1">Silence Mode (DND)</div>
                            <div className="text-xs text-slate-500">
                                {isDndActive 
                                    ? `Silent until ${new Date(dndUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'Suspend all active alerts temporarily.'}
                            </div>
                        </div>
                        {isDndActive && (
                            <button onClick={disableDnd} className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/30 transition-all">Disable</button>
                        )}
                    </div>
                    {!isDndActive && (
                        <div className="flex gap-2">
                            {[{ l: '1H', v: 60 }, { l: '8H', v: 480 }, { l: '24H', v: 1440 }].map(t => (
                                <button key={t.l} onClick={() => enableDnd(t.v)} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/20 transition-all">{t.l}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Delete Account ── */
const DeleteAccountStatus = () => {
    const { logout } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setIsDeleting(true); setError('');
        try { await api.delete('/auth/profile'); logout(); }
        catch (err) { setError(err.response?.data?.message || 'Purge protocol failed.'); setIsDeleting(false); setShowConfirm(false); }
    };

    return (
        <div className="p-8 rounded-[2rem] border-2 border-dashed border-red-500/10 bg-red-500/[0.01] animate-slide-up mt-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <Trash2 size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-tighter">Emergency Purge</h3>
                    <p className="text-[10px] text-red-500/40 font-black uppercase tracking-widest">Irreversible Action</p>
                </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Initiating termination will permanently erase your digital identity and all associated hardware records from the SureFix grid.
            </p>
            <button onClick={() => setShowConfirm(true)} disabled={isDeleting} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95">
                {isDeleting ? 'Erasing...' : 'Execute Account Termination'}
            </button>
            {error && <div className="mt-4 text-[10px] font-black text-red-400 uppercase tracking-widest">{error}</div>}
            <ConfirmModal open={showConfirm} title="Final Confirmation" message="This protocol is irreversible. Your data will be purged. Continue?" confirmText="Confirm Purge" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} danger />
        </div>
    );
};

/* ── Main Page Component ── */
export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="sf-spinner" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Syncing Identity...</span>
            </div>
        );
    }

    return (
        <div className="sf-page flex justify-center w-full">
            <div className="sf-page-wrap w-full max-w-5xl">
                
                <header className="mb-12 animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-6 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Identity Terminal</span>
                    </div>
                    <h1 className="text-5xl font-normal text-white italic tracking-tighter leading-none mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                        User <span className="text-slate-500">Positioning.</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Manage your system credentials and communication parameters.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-8">
                        <ProfileUpdateForm />
                        <NotificationSettings />
                    </div>
                    <div className="space-y-8">
                        <PasswordChangeForm />
                        <DeleteAccountStatus />
                    </div>
                </div>

            </div>
        </div>
    );
}