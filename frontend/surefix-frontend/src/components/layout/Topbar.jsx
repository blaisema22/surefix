import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Search, Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Topbar = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAllNotifications
    } = useNotifications();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.notification_id);
        }
        setIsDropdownOpen(false);

        // Simple navigation logic based on assumed notification content or type
        // You might want to enhance this if your notification object has a specific 'link' or 'type' field
        navigate('/notifications');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

    return (
        <header className="app-topbar h-18 px-6 py-4 animate-in flex items-center justify-between">
            {/* Left: Mobile Menu Toggle */}
            <button
                onClick={toggleSidebar}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 lg:hidden hover:text-white hover:bg-white/10 transition-all shadow-lg mx-1 px-4 py-2.5"
                aria-label="Open sidebar"
            >
                <Menu size={20} />
            </button>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="flex items-center gap-3">
                    <div className="relative mx-1" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center transition-all group relative px-4 py-2.5 ${isDropdownOpen ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10'}`}
                            aria-label={`Notifications, ${unreadCount} unread`}
                        >
                            <Bell size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-0' : 'group-hover:rotate-[15deg]'}`} aria-hidden="true" />
                            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,69,0,0.8)] animate-pulse" aria-hidden="true" />}
                        </button>

                        <NotificationDropdown
                            isOpen={isDropdownOpen}
                            notifications={notifications}
                            isLoading={false}
                            onSelect={handleNotificationClick}
                            onMarkAllAsRead={markAllAsRead}
                            onClearAll={clearAllNotifications}
                        />
                    </div>

                    <div className="h-6 w-px bg-white/5 mx-1" />

                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-3 px-4 py-2.5 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all group text-left mx-1"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:shadow-orange-500/20">
                            {initials}
                        </div>
                        <div className="hidden lg:block pr-2 min-w-0">
                            <div className="text-sm font-semibold text-white truncate leading-tight">{user?.name || 'User'}</div>
                            <div className="text-xs font-medium text-slate-400 capitalize">{user?.role || 'Client'}</div>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;