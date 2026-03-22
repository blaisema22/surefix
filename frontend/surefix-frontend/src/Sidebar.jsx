import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Smartphone,
    Settings,
    Search,
    Users,
    Store,
    Wrench,
    LogOut,
    User
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const role = user?.role || 'customer';

    const getNavItems = () => {
        switch (role) {
            case 'admin':
                return [
                    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                    { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
                    { path: '/admin/centres', label: 'Repair Centres', icon: <Store size={20} /> },
                ];
            case 'repairer':
            case 'shop':
                return [
                    { path: '/shop/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                    { path: '/shop/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
                    { path: '/shop/services', label: 'Services', icon: <Wrench size={20} /> },
                    { path: '/shop/customers', label: 'Customers', icon: <Users size={20} /> },
                    { path: '/shop/profile', label: 'Shop Profile', icon: <Store size={20} /> },
                ];
            case 'customer':
            default:
                return [
                    { path: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
                    { path: '/find-repair', label: 'Find Repair', icon: <Search size={20} /> },
                    { path: '/appointments', label: 'My Bookings', icon: <Calendar size={20} /> },
                    { path: '/devices', label: 'My Devices', icon: <Smartphone size={20} /> },
                    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
                ];
        }
    };

    const navItems = getNavItems();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B1120] text-slate-300 border-r border-white/5 flex flex-col z-50 transition-all">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Link to="/" className="flex items-center gap-3 no-underline group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        <Wrench size={16} className="text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">SureFix</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium'
                                : 'hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {user?.name?.charAt(0) || <User size={16} />}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <div className="text-xs font-bold text-white truncate">{user?.name || 'Guest'}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{role}</div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-400 text-xs font-bold uppercase tracking-wider transition-all"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;