import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../shared/PublicNavbar';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-sf-base text-[#F8FAFC] antialiased">
            {/* Navbar */}
            <PublicNavbar />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
                <Outlet />

            </main>

            {/* Page Footer */}
            <footer className="py-5 border-t border-[rgba(255,255,255,0.06)] text-center">
                <p className="text-xs text-[#64748B]">© {new Date().getFullYear()} SureFix. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AuthLayout;