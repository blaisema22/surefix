import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../api/notifications.api';
import { Bell, Check, Trash2, Clock, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/sf-pages.css';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const { addToast } = useToast();

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const res = await notificationsAPI.getAll(page);
            if (res.success) {
                setNotifications(res.notifications || []);
                setPagination(res.pagination || { page: 1, totalPages: 1 });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications(prev => prev.map(n =>
                n.notification_id === id ? { ...n, is_read: 1 } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            addToast('All notifications marked as read', 'success');
        } catch (err) {
            addToast('Failed to update notifications', 'error');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) return;
        try {
            await notificationsAPI.clearAll();
            setNotifications([]);
            addToast('Notifications cleared', 'success');
        } catch (err) {
            addToast('Failed to clear notifications', 'error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // If less than 24 hours, show relative time
        if (diff < 86400000) {
            if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
            return `${Math.floor(diff / 3600000)} hours ago`;
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="sf-page flex justify-center w-full">
            <div className="sf-page-wrap w-full max-w-3xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sf-anim-up">
                    <div>
                        <span className="sf-eyebrow">Activity Log</span>
                        <h1 className="sf-page-title">Notifications</h1>
                        <p className="sf-page-sub">Stay updated with your repairs and account activity.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleMarkAllRead}
                            disabled={notifications.every(n => n.is_read) || notifications.length === 0}
                            className="sf-btn-ghost text-xs"
                        >
                            <CheckCircle2 size={14} /> Mark all read
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={notifications.length === 0}
                            className="sf-btn-ghost text-xs hover:text-red-400 hover:border-red-500/30"
                        >
                            <Trash2 size={14} /> Clear all
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-20 text-slate-500">
                            <Loader2 size={32} className="animate-spin" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notif, i) => (
                            <div
                                key={notif.notification_id}
                                className={`sf-glass p-0 overflow-hidden flex transition-all sf-anim-up sf-s${Math.min(i + 1, 6)} ${!notif.is_read ? 'border-l-2 border-l-blue-500 bg-white/[0.04]' : 'opacity-75'}`}
                                onClick={() => !notif.is_read && handleMarkRead(notif.notification_id)}
                            >
                                <div className="p-5 flex-1 cursor-pointer">
                                    <div className="flex justify-between items-start gap-4 mb-1">
                                        <h4 className={`text-sm font-bold ${!notif.is_read ? 'text-white' : 'text-slate-400'}`}>{notif.title}</h4>
                                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                                            <Clock size={10} /> {formatDate(notif.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="sf-empty">
                            <div className="sf-empty-icon"><Bell size={24} /></div>
                            <div className="sf-empty-title">All caught up!</div>
                            <p className="sf-empty-sub">You have no notification history at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500 font-medium">Page {pagination.page} of {pagination.totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => fetchNotifications(pagination.page - 1)} disabled={pagination.page === 1} className="sf-pag-btn"><ChevronLeft size={16} /></button>
                            <button onClick={() => fetchNotifications(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="sf-pag-btn"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default NotificationsPage;