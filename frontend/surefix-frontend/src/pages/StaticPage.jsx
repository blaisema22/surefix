import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StaticPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Capitalize the first letter of the path for the title
    const pathName = location.pathname.substring(1).replace('-', ' ');
    const pageTitle = pathName.charAt(0).toUpperCase() + pathName.slice(1) || 'Page content coming soon...';

    return (
        <div className="bg-[#080c14] min-h-[calc(100vh-80px)] text-slate-100 flex flex-col items-center justify-center p-8 animate-in">
            <div className="max-w-2xl w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)] mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold font-serif text-lg">SF</span>
                    </div>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    {pageTitle}
                </h1>
                
                <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                    This page is currently under construction. We are working hard to bring you the full content soon.
                </p>
                
                <div className="pt-8 flex justify-center">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-bold tracking-wide uppercase text-slate-300 hover:text-white flex items-center gap-2 group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaticPage;
