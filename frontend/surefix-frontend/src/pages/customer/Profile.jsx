import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useNotifications } from '@/context/NotificationContext';
import { User, Lock, Bell, Trash2, Check, AlertCircle } from 'lucide-react';
import '../../styles/sf-pages.css';

/* ── Feedback ── */
const Feedback = ({ success, error }) => (
    <>
        {success && (
            <div className="sf-success sf-anim-scale">
                <span className="sf-feedback-icon"><Check size={13} /></span>
                {success}
            </div>
        )}
        {error && (
            <div className="sf-error sf-anim-scale">
                <span className="sf-feedback-icon"><AlertCircle size={13} /></span>
                {error}
            </div>
        )}
    </>
);

/* ── Profile Form ── */
const ProfileUpdateForm = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const set = field => e => { if (error) setError(null); setForm(p => ({ ...p, [field]: e.target.value })); };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true); setError(null); setSuccess(null);
        try {
            const res = await api.put('/auth/profile', form);
            if (res.data.success) {
                updateUser(form);
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) { setError(err.response?.data?.message || 'Failed to update profile.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="sf-glass">
            <div className="sf-glass-title">Personal Information</div>
            <div className="sf-glass-sub">Keep your contact details up to date.</div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="sf-field">
                    <label>Full Name</label>
                    <input type="text" value={form.name} onChange={set('name')} placeholder="Your full name" required />
                </div>
                <div className="sf-field">
                    <label>Phone Number</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" />
                </div>
                <button type="submit" className="sf-btn-primary" disabled={saving} style={{ marginTop: 6, width: '100%' }}>
                    {saving ? <><span className="sf-spinner" />Saving…</> : 'Save Changes'}
                </button>
                <Feedback success={success} error={error} />
            </form>
        </div>
    );
};

/* ── Password Form ── */
const PasswordChangeForm = () => {
    const initial = { currentPassword: '', newPassword: '', confirmPassword: '' };
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const set = field => e => { if (error) setError(null); setForm(p => ({ ...p, [field]: e.target.value })); };

    const handleSubmit = async e => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) return setError('New passwords do not match.');
        if (form.newPassword.length < 6) return setError('Password must be at least 6 characters.');
        setSaving(true); setError(null); setSuccess(null);
        try {
            const res = await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
            if (res.data.success) {
                setSuccess('Password changed successfully!');
                setForm(initial);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) { setError(err.response?.data?.message || 'Failed to change password.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="sf-glass">
            <div className="sf-glass-title">Security</div>
            <div className="sf-glass-sub">Change your password to keep your account safe.</div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                    { label: 'Current Password', field: 'currentPassword' },
                    { label: 'New Password', field: 'newPassword' },
                    { label: 'Confirm Password', field: 'confirmPassword' },
                ].map(({ label, field }) => (
                    <div key={field} className="sf-field">
                        <label>{label}</label>
                        <input type="password" value={form[field]} onChange={set(field)} required />
                    </div>
                ))}
                <button type="submit" className="sf-btn-ghost" disabled={saving} style={{ marginTop: 6, width: '100%', justifyContent: 'center', padding: '12px 0' }}>
                    {saving ? <><span className="sf-spinner" />Updating…</> : 'Change Password'}
                </button>
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
        <div className="sf-glass">
            <div className="sf-glass-title">Preferences</div>
            <div className="sf-glass-sub">Customise your alerts and availability.</div>

            <div className="sf-toggle-wrap">
                <div>
                    <div className="sf-toggle-label">Notification Sounds</div>
                    <div className="sf-toggle-sub">Play a subtle sound for new alerts.</div>
                </div>
                <label className="sf-toggle">
                    <input type="checkbox" checked={!isMuted} onChange={toggleMute} />
                    <span className="sf-toggle-slider" />
                </label>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, marginTop: 4 }}>
                <div className="sf-toggle-wrap" style={{ paddingTop: 0 }}>
                    <div>
                        <div className="sf-toggle-label">Do Not Disturb</div>
                        <div className="sf-toggle-sub">
                            {isDndActive
                                ? <span style={{ color: 'rgba(251,191,36,0.8)' }}>Silent until {new Date(dndUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                : 'Silence all incoming alerts temporarily.'}
                        </div>
                    </div>
                    {isDndActive && (
                        <button className="sf-btn-danger" style={{ padding: '6px 14px', fontSize: 11 }} onClick={disableDnd}>
                            Disable
                        </button>
                    )}
                </div>
                {!isDndActive && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {[{ label: '1 Hour', val: 60 }, { label: '8 Hours', val: 480 }, { label: '24 Hours', val: 1440 }].map(({ label, val }) => (
                            <button key={label} className="sf-dnd-btn" onClick={() => enableDnd(val)}>{label}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Delete Account ── */
const DeleteAccountSection = () => {
    const { logout } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setIsDeleting(true); setError(null);
        try { await api.delete('/auth/profile'); logout(); }
        catch (err) { setError(err.response?.data?.message || 'Failed to delete account.'); setIsDeleting(false); setShowConfirm(false); }
    };

    return (
        <div className="sf-danger-zone">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Trash2 size={16} color="rgba(239,68,68,0.7)" />
                <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(239,68,68,0.8)' }}>Danger Zone</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, marginBottom: 18 }}>
                Once you delete your account, there is no going back. All your data will be permanently removed from our servers.
            </p>
            <button className="sf-btn-danger" onClick={() => setShowConfirm(true)} disabled={isDeleting}>
                {isDeleting ? <><span className="sf-spinner" />Deleting…</> : 'Permanently Delete Account'}
            </button>
            {error && <div className="sf-error" style={{ marginTop: 12 }}>{error}</div>}
            <ConfirmModal open={showConfirm} title="Delete Account" message="This is permanent. Are you absolutely sure?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} danger />
        </div>
    );
};

/* ── Page ── */
export default function CustomerProfile() {
    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">

                {/* Header */}
                <div className="sf-anim-up" style={{ marginBottom: 32 }}>
                    <span className="sf-eyebrow">Account</span>
                    <h1 className="sf-page-title">Settings</h1>
                    <p className="sf-page-sub">Manage your profile, security, and preferences.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="sf-anim-up sf-s1"><ProfileUpdateForm /></div>
                        <div className="sf-anim-up sf-s2"><NotificationSettings /></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="sf-anim-up sf-s2"><PasswordChangeForm /></div>
                        <div className="sf-anim-up sf-s3"><DeleteAccountSection /></div>
                    </div>
                </div>

            </div>
        </div>
    );
}