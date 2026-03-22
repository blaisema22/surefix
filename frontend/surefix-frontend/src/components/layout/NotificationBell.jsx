import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const {
        unreadCount,
        notifications,
        markAsRead,
        markAllAsRead,
        clearAllNotifications
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.notification_id);
        }
        setIsOpen(false);
        // Navigate based on type (simple logic for now)
        if (notification.title.includes('Appointment')) navigate('/appointments');
        else navigate('/notifications');
    };

    return (
        <div className="relative" ref={containerRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="sf-icon-btn relative">
                <Bell size={20} />
                {unreadCount > 0 && <span className="sf-notif-dot pulse" />}
            </button>

            <NotificationDropdown
                isOpen={isOpen}
                notifications={notifications}
                onSelect={handleSelect}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
            />
        </div>
    );
};

export default NotificationBell;