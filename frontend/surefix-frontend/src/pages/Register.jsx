import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Phone, Mail, Lock, AlertCircle, ChevronRight, HardDrive, ShoppingBag, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role
      });
      if (res.data.success) navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isC = form.role === 'customer';
  const isR = form.role === 'repairer';

  return (
    <div className="auth-page animate-in">
        <div className="auth-card-split border-none shadow-2xl bg-transparent scale-95 origin-center">
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
                        Establish your digital identity within the most advanced hardware diagnostic ecosystem.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.05] transition-all duration-500">
                            <div className="w-10 h-10 rounded-xl bg-[var(--sf-accent)]/10 flex items-center justify-center text-[var(--sf-accent)] group-hover:scale-110 transition-transform">
                                <ShieldCheck size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Certified Network</h4>
                                <p className="text-slate-500 text-[10px] font-medium leading-relaxed">Verified repair centres and enterprise tools.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Registration Form */}
            <div className="right auth-right-pane bg-white/[0.01] backdrop-blur-3xl border-l border-white/5 p-12 overflow-y-auto custom-scrollbar">
                <div className="w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Admission Registry</h2>
                        <p className="text-slate-500 text-sm font-medium">Create your sector identification token.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-[11px] text-rose-400 font-black uppercase tracking-widest animate-shake">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Switcher */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setForm({...form, role: 'customer'})}
                                className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 group ${isC ? 'border-[var(--sf-accent)] bg-[var(--sf-accent)]/5 shadow-[0_0_20px_rgba(255,69,0,0.1)]' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isC ? 'bg-[var(--sf-accent)] text-white shadow-lg shadow-[var(--sf-accent)]/20' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                                    <User size={20} strokeWidth={1.5} />
                                </div>
                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${isC ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Customer Unit</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({...form, role: 'repairer'})}
                                className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 group ${isR ? 'border-[var(--sf-accent)] bg-[var(--sf-accent)]/5 shadow-[0_0_20px_rgba(255,69,0,0.1)]' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isR ? 'bg-[var(--sf-accent)] text-white shadow-lg shadow-[var(--sf-accent)]/20' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                                    <ShoppingBag size={20} strokeWidth={1.5} />
                                </div>
                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${isR ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Technician Node</div>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Entity Name</label>
                            <div className="auth-input-wrapper relative group">
                                <User className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Enter full identity..."
                                    className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Terminal Primary Key (Email)</label>
                            <div className="auth-input-wrapper relative group">
                                <Mail className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter secure email..."
                                    className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Communication Link (Phone)</label>
                            <div className="auth-input-wrapper relative group">
                                <Phone className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={18} strokeWidth={1.5} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+250 ..."
                                    className="auth-input w-full h-13 glass-card !rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Secret Key</label>
                                <div className="auth-input-wrapper relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        placeholder="••••"
                                        className="auth-input w-full h-13 glass-card !rounded-xl px-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono ml-1">Verify Sync</label>
                                <div className="auth-input-wrapper relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        placeholder="••••"
                                        className="auth-input w-full h-13 glass-card !rounded-xl px-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02]"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-13 rounded-2xl bg-[var(--sf-accent)] hover:bg-[#cc2200] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--sf-accent)]/20 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 mt-4"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Processing Admission...</span>
                                </>
                            ) : (
                                <>
                                    <span>Establish Identity</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 text-center border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono">Already a Member?</p>
                        <Link to="/login" className="text-[var(--sf-accent)] hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all bg-white/[0.03] px-8 py-3 rounded-xl border border-white/5 inline-block no-underline">
                            Login Protocols
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Register;
