import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './AuthContext';
import api from '../api/axios'; // Ensure you have your axios instance imported

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('surefix_mute_sound') === 'true';
  });
  const [dndUntil, setDndUntil] = useState(null);
  
  const isMutedRef = useRef(isMuted);
  const dndUntilRef = useRef(dndUntil);
  const enableDndRef = useRef(null);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { dndUntilRef.current = dndUntil; }, [dndUntil]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('surefix_mute_sound', newValue);
      return newValue;
    });
  };

  const enableDnd = async (minutes) => {
    const endTime = new Date(new Date().getTime() + minutes * 60000);
    try {
      await api.patch('/notifications/dnd', { dnd_until: endTime.toISOString() });
      setDndUntil(endTime);
      toast.success(`Do Not Disturb enabled until ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (err) { 
      console.error(err); 
      toast.error('Failed to update DND settings'); 
    }
  };

  const disableDnd = async () => {
    try {
      await api.patch('/notifications/dnd', { dnd_until: null });
      setDndUntil(null);
      toast.info('Do Not Disturb disabled');
    } catch (err) { 
      console.error(err); 
      toast.error('Failed to update DND settings'); 
    }
  };

  // Keep ref updated for socket usage
  useEffect(() => { enableDndRef.current = enableDnd; }, []);

  useEffect(() => {
    if (!user || !token) return;

    // 1. Fetch initial data
    const fetchInitialData = async () => {
      try {
        const res = await api.get('/notifications?limit=10');
        if (res.data.success) {
          setUnreadCount(res.data.unread_count || 0);
          setNotifications(res.data.notifications || []);
          if (res.data.dnd_until) {
            setDndUntil(new Date(res.data.dnd_until));
          }
        }
      } catch (error) { console.error("Failed to fetch notifications", error); }
    };
    fetchInitialData();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.emit('join_room', user.userId);

    socket.on('receive_notification', (data) => {
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [data, ...prev]);

      const isDndActive = dndUntilRef.current && new Date() < new Date(dndUntilRef.current);
      if (!isDndActive) {
        toast.info(data.message || 'New Notification');
        if (!isMutedRef.current) {
          try {
            new Audio('/sounds/notification.mp3').play().catch(e => console.warn('Audio play blocked', e));
          } catch (e) { /* Ignore audio errors */ }
        }
      }
    });

    socket.on('refresh_data', () => {
      toast.info("Your data has been updated!");
    });

    socket.on('notification_count_update', (count) => {
      setUnreadCount(count);
    });

    return () => socket.disconnect();
  }, [user, token]);

  const addNotification = (message, type = 'info') => {
    if (toast[type]) toast[type](message);
    else toast(message);
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
    } catch (err) { console.error(err); }
  };

  const value = {
    addNotification, unreadCount, notifications, markAsRead,
    markAllAsRead, clearAllNotifications, isMuted, toggleMute,
    dndUntil, enableDnd, disableDnd
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} theme="dark" />
    </NotificationContext.Provider>
  );
};
