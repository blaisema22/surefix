import React, { useState, useEffect, useCallback } from 'react';
import * as adminAPI from '../../api/admin.api';
import { useToast } from '../../components/shared/Toast';
import { Store, Shield, Check, X, Eye, EyeOff, MapPin, Mail, User, ShieldCheck } from 'lucide-react';

const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" disabled={disabled} />
        <div className="w-12 h-6.5 bg-white/10 rounded-full peer peer-checked:bg-[var(--sf-accent)] transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-5.5 shadow-inner border border-white/5"></div>
    </label>
);

const AdminCentres = () => {
    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { show, ToastContainer } = useToast();

    const fetchCentres = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getAdminCentres();
            if (response.success) {
                setCentres(response.centres || []);
            } else {
                setError('Failed to establish connection with Network Registry.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'A protocols error occurred while fetching network nodes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCentres(); }, [fetchCentres]);

    // Note: The logic for toggling visibility/verification might need backend support if not already there
    // Based on the old code, it used centreAPI and adminAPI
    const handleVisibilityToggle = async (centreId, currentVisibility) => {
        try {
            await adminAPI.updateCentreVisibility(centreId, !currentVisibility);
            setCentres(prev => prev.map(c => c.centre_id === centreId ? { ...c, is_visible: !c.is_visible } : c));
            show('Visibility protocol updated', 'success');
        } catch (err) {
            show('Failed to update visibility protocol.', 'error');
        }
    };

    const handleVerificationToggle = async (ownerId, currentVerification) => {
        if (!ownerId) return show("Identity error: No owner assigned to node.", 'error');
        try {
            await adminAPI.toggleUserVerification(ownerId, !currentVerification);
            setCentres(prev => prev.map(c => c.owner_id === ownerId ? { ...c, owner_is_verified: !c.owner_is_verified } : c));
            show(!currentVerification ? "Authorization granted" : "Authorization revoked", 'success');
        } catch (err) {
            show('Failed to update credentials.', 'error');
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="glass p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 max-w-lg mx-auto">
                    <Shield size={48} className="text-red-500/40 mx-auto mb-4" />
                    <p className="text-red-400 font-bold mb-4">{error}</p>
                    <button onClick={fetchCentres} className="btn btn-secondary text-xs uppercase tracking-widest font-black">Re-protocol</button>
                </div>
            </div>
        );
    }

    return (
        <main className="page-content space-y-10 animate-in">
            <ToastContainer />
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-2">
                <div className="animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-0.5 h-4 bg-[var(--sf-accent)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--sf-accent)]">Node Administration</span>
                    </div>
                    <h1 className="text-4xl font-normal text-white tracking-tight italic" style={{ fontFamily: 'var(--font-serif)' }}>
                        Repair Points
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Oversee registered repair nodes and authorize strategic partners.</p>
                </div>
            </header>

            <div className="glass-card rounded-[2.5rem] border-none bg-white/[0.01] overflow-hidden animate-slide-up shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Network Node / Owner</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">District</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-center">Public View</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-center">Auth Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Commissioned</th>
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
                            ) : centres.length > 0 ? centres.map((c) => (
                                <tr key={c.centre_id} className="hover:bg-white/[0.02] transition-all duration-500 group">
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-13 h-13 rounded-[1.25rem] bg-white/5 border border-white/5 flex items-center justify-center text-[var(--sf-accent)] group-hover:bg-[var(--sf-accent)] group-hover:text-white transition-all duration-500 shadow-inner">
                                                <Store size={22} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-bold text-white mb-1 group-hover:text-[var(--sf-accent)] transition-colors tracking-tight uppercase">{c.name}</div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
                                                        <User size={12} strokeWidth={1.5} /> {c.owner_name || 'Unassigned'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono lowercase">
                                                        <Mail size={12} strokeWidth={1.5} /> {c.owner_email || 'No Email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">
                                            <MapPin size={14} className="text-[var(--sf-accent)]/40" />
                                            {c.district}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ToggleSwitch checked={!!c.is_visible} onChange={() => handleVisibilityToggle(c.centre_id, c.is_visible)} />
                                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] font-mono ${c.is_visible ? 'text-[var(--sf-accent)]' : 'text-slate-600'}`}>
                                                {c.is_visible ? 'UPLINK ACTIVE' : 'STEALTH MODE'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ToggleSwitch checked={!!c.owner_is_verified} onChange={() => handleVerificationToggle(c.owner_id, c.owner_is_verified)} disabled={!c.owner_id} />
                                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] font-mono ${c.owner_is_verified ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                {c.owner_is_verified ? 'AUTHORIZED' : 'RESTRICTED'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center text-slate-600">
                                                <Store size={32} />
                                            </div>
                                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No network nodes registered</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default AdminCentres;