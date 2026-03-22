import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import PublicNavbar from '../shared/PublicNavbar';

export default function PublicLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen bg-sf-base text-[#94a3b8]">

            <PublicNavbar />

            <main className="flex-1" tabIndex="-1">

                <Outlet />
            </main>

            <footer className="px-12 py-12 border-t border-white/5 bg-sf-footer relative z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div>
                        <Link to="/" className="flex items-center gap-2.5 mb-6 no-underline">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sf-shadow-blue" style={{ background: 'var(--sf-grad)' }}>
                                <Wrench size={16} strokeWidth={2.5} className="text-white" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>SureFix</span>
                        </Link>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 SUREFIX ECOSYSTEM · ALL RIGHTS RESERVED</p>
                    </div>

                    <div className="flex gap-12 text-center md:text-left">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Legal Access</span>
                            <Link to="/privacy" className="text-xs font-bold text-slate-600 hover:text-blue-400 transition-colors no-underline">Privacy Policy</Link>
                            <Link to="/terms" className="text-xs font-bold text-slate-600 hover:text-blue-400 transition-colors no-underline">Service Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
