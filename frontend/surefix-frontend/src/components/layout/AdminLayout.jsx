import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, LogOut, LayoutDashboard } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear auth tokens and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#0B0F1A] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col flex-shrink-0 transition-all duration-300 z-20">
                <div className="h-20 flex items-center px-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin<span className="text-blue-500">Portal</span></h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">SureFix System</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Management</p>

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-1'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                            }`
                        }
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Centres</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-1'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                            }`
                        }
                    >
                        <Users size={20} />
                        <span className="font-medium">Users</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-900/10 hover:text-red-400 transition-colors duration-200 font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-[#0B0F1A] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;