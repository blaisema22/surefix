import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock, AlertCircle, ChevronRight, HardDrive, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const result = await login(form.email, form.password);
            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.message || 'Authentication failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page animate-in">
            <div className="auth-card-split border-none shadow-2xl bg-transparent">
                {/* Left Pane: Branding & Visuals */}
                <div className="left auth-left-pane relative overflow-hidden flex flex-col justify-center" style={{ background: 'var(--sf-base)' }}>
                    {/* Decorative Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[var(--sf-accent)]/10 rounded-full blur-3xl opacity-30" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl opacity-20" />

                    <div className="absolute top-10 left-10 z-20">
                        <Link to="/" className="flex items-center gap-3 no-underline group/logo">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sf-accent)] to-[#cc2200] flex items-center justify-center shadow-lg shadow-[var(--sf-accent)]/20 group-hover/logo:scale-110 transition-transform">
                                <HardDrive size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>SureFix</span>
                        </Link>
                    </div>

                    <div className="max-w-md relative z-10 px-12 animate-slide-up">
                        <div className="w-12 h-1 bg-[var(--sf-accent)] rounded-full mb-8" />
                        <h1 className="text-5xl font-normal leading-tight mb-6 text-white italic" style={{ fontFamily: 'var(--font-serif)' }}>
                            Join the <br />
                            <span className="text-[var(--sf-accent)]">Elite Service</span>
                        </h1>
                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                            Access the premium hardware diagnostic ecosystem and manage your repair network with surgical precision.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--sf-base)] bg-slate-800" />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">5k+ ACTIVE NODES</span>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Login Form */}
                <div className="right auth-right-pane bg-white/[0.01] backdrop-blur-3xl border-l border-white/5 p-12">
                    <div className="w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Login Protocols</h2>
                            <p className="text-slate-500 text-sm font-medium">Synchronize your terminal credentials.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-[11px] text-rose-400 font-black uppercase tracking-widest animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-[11px] text-emerald-400 font-black uppercase tracking-widest">
                                <AlertCircle size={18} className="rotate-180" />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Terminal Primary Key</label>
                                <div className="auth-input-wrapper relative group">
                                    <Mail className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter associated email..."
                                        className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Authorization Token</label>
                                    <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-slate-600 hover:text-[var(--sf-accent)] uppercase tracking-widest no-underline transition-colors">Lost Token?</Link>
                                </div>
                                <div className="auth-input-wrapper relative group">
                                    <Lock className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter secure password..."
                                        className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 ml-1 mb-6">
                                <input 
                                    type="checkbox" 
                                    id="rememberMe"
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--sf-accent)] focus:ring-[var(--sf-accent)] cursor-pointer"
                                    checked={form.rememberMe}
                                    onChange={e => setForm({ ...form, rememberMe: e.target.checked })}
                                />
                                <label htmlFor="rememberMe" className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] cursor-pointer">Stay Synchronized</label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-13 rounded-2xl bg-[var(--sf-accent)] hover:bg-[#cc2200] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--sf-accent)]/20 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Establishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Establish Access</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 pt-8 text-center border-t border-white/5 space-y-4">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono">Registry Admission Required?</p>
                            <Link to="/register" className="text-[var(--sf-accent)] hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all bg-white/[0.03] px-8 py-3 rounded-xl border border-white/5 inline-block no-underline">
                                Create Identity
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
