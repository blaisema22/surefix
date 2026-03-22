import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications.api';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            // Update UI optimistically
            setNotifications(prev =>
                prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n)
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkRead(notification.notification_id);
        }

        if (notification.title.includes('Shop Profile')) {
            navigate('/shop/profile');
        } else if (notification.type === 'appointment') {
            navigate('/shop/appointments');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ width: '100%', maxWidth: 800, padding: '36px 40px', paddingBottom: 100 }}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all flex items-center justify-center"
                            aria-label="Go back"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 block mb-1">Communications</span>
                            <h1 className="text-3xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Alerts & Notifications</h1>
                        </div>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all border border-blue-500/20"
                        >
                            Mark all Read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="glass-card premium-card border-none bg-white/[0.02] p-12 text-center rounded-3xl">
                        <div className="w-16 h-16 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                            <span className="text-slate-600 text-2xl">📭</span>
                        </div>
                        <p className="text-slate-400 font-medium">No alerts triggered in the system.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notification_id}
                                className={`glass-card p-5 rounded-2xl transition-all cursor-pointer group hover:bg-white/[0.04] ${
                                    notification.is_read 
                                    ? 'bg-white/[0.01] border-white/5 opacity-75' 
                                    : 'bg-white/[0.03] border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)] relative overflow-hidden'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {!notification.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600"></div>}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-medium ${notification.is_read ? 'text-slate-300' : 'text-white'}`}>{notification.title}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{formatDate(notification.created_at)}</span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">{notification.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;