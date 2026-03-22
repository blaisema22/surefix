import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 overflow-hidden">

      {/* Mobile/Tablet Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm lg:hidden" onClick={closeSidebar}></div>
      )}


      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} className="shadow-2xl shadow-black/50" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar focus:outline-none bg-[#080c14]" tabIndex="-1">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 w-full animate-in">
             <div className="bg-[#0b0f1a] border border-white/5 shadow-2xl rounded-3xl min-h-[calc(100vh-12rem)] p-6 md:p-10 relative overflow-hidden">
                {/* Subtle cyan theme glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full z-0" />
                <div className="relative z-10">
                    <Outlet />
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
