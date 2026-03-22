import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, AlertCircle, HardDrive, ChevronRight } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
            if (res.data.success) {
                setSuccess('Password has been reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/login', { state: { message: 'Password reset. Please log in.' } }), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page animate-in flex items-center justify-center p-6" style={{ background: 'var(--sf-base)' }}>
            <div className="auth-card glass-card w-full max-w-md p-10 rounded-[2.5rem] border-none shadow-2xl bg-white/[0.02] backdrop-blur-3xl animate-slide-up">
                <div className="flex justify-center mb-10">
                    <Link to="/" className="flex items-center gap-3 no-underline group/logo">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sf-accent)] to-[#cc2200] flex items-center justify-center shadow-lg shadow-[var(--sf-accent)]/20 group-hover/logo:scale-110 transition-transform duration-500">
                            <HardDrive size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>SureFix</span>
                    </Link>
                </div>

                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Registry Update</h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Establish your new terminal access credentials.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-[11px] text-rose-400 font-black uppercase tracking-widest animate-shake">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-[11px] text-emerald-400 font-black uppercase tracking-widest leading-relaxed">
                        <AlertCircle size={18} className="rotate-180" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">New Access Key</label>
                        <div className="auth-input-wrapper relative group">
                            <Lock className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                            <input
                                type="password"
                                name="newPassword"
                                required
                                placeholder="••••••••••••"
                                className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                value={form.newPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Confirm Update</label>
                        <div className="auth-input-wrapper relative group">
                            <Lock className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                placeholder="••••••••••••"
                                className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                value={form.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="w-full h-13 rounded-2xl bg-[var(--sf-accent)] hover:bg-[#cc2200] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--sf-accent)]/20 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 mt-4"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Updating Registry...</span>
                            </>
                        ) : (
                            <>
                                <span>Finalize Reset</span>
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;