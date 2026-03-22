import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const ActiveRepairs = ({ activeRepairs, statusColors }) => {
    const navigate = useNavigate();

    return (
        <section className="mt-12 animate-in" aria-label="Active Repair Registry">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono block mb-1">Status Report</span>
                    <h3 className="text-2xl font-bold text-white m-0 tracking-tight">Active Transmissions</h3>
                </div>
                <button
                    onClick={() => navigate('/customer/appointments')}
                    className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5"
                    aria-label="Access full archives"
                >
                    View Archives
                </button>
            </div>
            {activeRepairs.length > 0 ? (
                <div className="flex flex-col gap-4" role="list">
                    {activeRepairs.map(app => (
                        <div key={app.appointment_id} className="glass-card flex items-center justify-between p-6 rounded-[1.5rem] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group" role="listitem">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-base text-white font-bold m-0 tracking-tight group-hover:text-[var(--sf-accent)] transition-colors">{app.service_name}</h4>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--sf-accent)] animate-pulse" />
                                </div>
                                <p className="text-slate-500 m-0 text-xs font-medium">
                                    {app.device_brand} {app.device_model} <span className="mx-2 text-slate-700">|</span> <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">{app.centre_name}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${app.status === 'in_progress' ? 'bg-[var(--sf-accent)]/10 border-[var(--sf-accent)]/20 text-[var(--sf-accent)]' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                    {app.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-16 rounded-[2.5rem] bg-white/[0.01] border border-dashed border-white/5 backdrop-blur-3xl">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-6 border border-white/5">
                        <Wrench size={24} className="text-slate-600 opacity-50" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Registry Empty</p>
                    <p className="text-slate-400 text-sm font-medium m-0">No active maintenance protocols detected.</p>
                </div>
            )}
        </section>
    );
};

export default ActiveRepairs;

