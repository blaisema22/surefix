import React from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

const NotificationDropdown = ({
    isOpen,
    notifications = [],
    isLoading,
    onSelect,
    onMarkAllAsRead,
    onClearAll
}) => {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-black ring-opacity-5" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#1F2937]/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </div>
                <div className="flex gap-3">
                    {unreadCount > 0 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMarkAllAsRead(); }} 
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            <Check size={12} /> Mark read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onClearAll(); }} 
                            className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 size={12} /> Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="max-h-[24rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                        <p>Loading updates...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                        <Bell size={32} className="mb-2 opacity-20" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800/50">
                        {notifications.map(notification => (
                            <div 
                                key={notification.notification_id || Math.random()} 
                                className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group ${!notification.is_read ? 'bg-blue-900/10' : ''}`} 
                                onClick={() => onSelect(notification)}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm mb-0.5 truncate ${!notification.is_read ? 'font-semibold text-white' : 'text-gray-300'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-600 mt-2 font-mono">
                                            {new Date(notification.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notification.is_read && <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;