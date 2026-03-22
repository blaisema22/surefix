import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, AlertCircle, HardDrive, ChevronRight } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            if (res.data.success) {
                setSuccess('If an account with that email exists, a password reset link has been sent.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
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
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Protocol Recovery</h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Enter your terminal key to initiate reset.</p>
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
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Registry Key (Email)</label>
                        <div className="auth-input-wrapper relative group">
                            <Mail className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                            <input
                                type="email"
                                required
                                placeholder="Enter associated email..."
                                className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="w-full h-13 rounded-2xl bg-[var(--sf-accent)] hover:bg-[#cc2200] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--sf-accent)]/20 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Initiating...</span>
                            </>
                        ) : (
                            <>
                                <span>Initiate Recovery</span>
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 text-center border-t border-white/5">
                    <Link to="/login" className="text-[10px] font-black text-slate-500 hover:text-[var(--sf-accent)] uppercase tracking-[0.3em] font-mono no-underline transition-all">
                        &larr; Return to Login Protocols
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;