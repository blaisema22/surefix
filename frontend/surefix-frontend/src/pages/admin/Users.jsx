import React, { useState, useEffect, useCallback } from 'react';
import { getAdminUsers, toggleUserAuthorization } from '../../api/admin.api';
import { User, Shield, Search, Mail, Phone, Calendar, ArrowLeft, MoreHorizontal, Filter, Lock, Unlock } from 'lucide-react';

const ROLE_STYLE = {
    admin: { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
    repairer: { bg: 'rgba(255,69,0,0.1)', color: 'var(--sf-accent)', border: 'rgba(255,69,0,0.2)' },
    customer: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
};

const USERS_PER_PAGE = 10;

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAdminUsers();
            if (res.success) {
                setUsers(res.users ?? []);
                setFiltered(res.users ?? []);
            }
        } catch {
            setError('Failed to establish connection with User Registry.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        let data = users;
        if (roleFilter !== 'all') data = data.filter(u => u.role === roleFilter);
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
        }
        setFiltered(data);
        setPage(1);
    }, [roleFilter, search, users]);

    const handleToggleAuth = async (userId, currentStatus) => {
        try {
            const res = await toggleUserAuthorization(userId, !currentStatus);
            if (res.success) {
                setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_authorized: !currentStatus } : u));
            }
        } catch (err) {
            console.error('Failed to update authorization:', err);
        }
    };

    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
    const paged = filtered.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

    return (
        <main className="page-content space-y-10 animate-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-2">
                <div className="animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-0.5 h-4 bg-[var(--sf-accent)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--sf-accent)]">Security Protocols</span>
                    </div>
                    <h1 className="text-4xl font-normal text-white tracking-tight italic" style={{ fontFamily: 'var(--font-serif)' }}>
                        User Registry
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Manage cross-platform authorizations and secure identities.</p>
                </div>
            </header>

            {error && (
                <div className="glass p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                    <Shield size={16} /> {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col xl:flex-row justify-between gap-6 items-center">
                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 w-fit shadow-xl">
                    {['all', 'customer', 'repairer', 'admin'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                                roleFilter === r 
                                ? 'bg-[var(--sf-accent)] text-white shadow-lg shadow-[var(--sf-accent)]/20' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {r === 'all' ? 'All Roles' : `${r}s`}
                        </button>
                    ))}
                </div>
                
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--sf-accent)] transition-colors" size={16} strokeWidth={2.5} />
                    <input
                        className="w-full h-13 glass-card !rounded-2xl pl-13 pr-6 text-xs font-black text-white placeholder:text-slate-600 outline-none focus:ring-2 ring-[var(--sf-accent)]/20 transition-all border border-white/5 bg-white/[0.02] shadow-xl"
                        placeholder="SCAN REGISTRY FOR IDENTITIES..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-card rounded-[2.5rem] border-none bg-white/[0.01] overflow-hidden animate-slide-up shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Entity Profile</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-center">Clearance Level</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-center">Protocol Sync</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-center">Access Control</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Registration Date</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-10">
                                            <div className="h-10 bg-white/5 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : paged.length > 0 ? paged.map((u, idx) => {
                                const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.customer;
                                return (
                                    <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-5">
                                                <div 
                                                    className="w-13 h-13 rounded-[1.25rem] flex items-center justify-center text-sm font-black transition-all duration-500 group-hover:scale-110 shadow-inner"
                                                    style={{ background: `${rs.color}15`, color: rs.color, border: `1px solid ${rs.border}` }}
                                                >
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-white mb-1 group-hover:text-[var(--sf-accent)] transition-colors tracking-tight">{u.name}</div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono lowercase">
                                                            <Mail size={12} strokeWidth={1.5} /> {u.email}
                                                        </div>
                                                        {u.phone && (
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
                                                                <Phone size={12} strokeWidth={1.5} /> {u.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <span 
                                                className="inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] font-mono shadow-sm"
                                                style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <div className="flex items-center justify-center gap-2.5">
                                                <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${u.is_verified ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                    {u.is_verified ? 'VERIFIED' : 'PENDING'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <button 
                                                onClick={() => handleToggleAuth(u.user_id, u.is_authorized)}
                                                className={`group/btn relative px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 mx-auto ${
                                                    u.is_authorized 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                                                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                                }`}
                                            >
                                                {u.is_authorized 
                                                    ? <><Unlock size={12} strokeWidth={3} /> Authorized</> 
                                                    : <><Lock size={12} strokeWidth={3} /> Revoked</>
                                                }
                                            </button>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">
                                                <Calendar size={14} className="text-[var(--sf-accent)]/40" />
                                                {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center text-slate-600">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No identities found in registry</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            Sequence {page} of {totalPages} — {filtered.length} Identifications
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}