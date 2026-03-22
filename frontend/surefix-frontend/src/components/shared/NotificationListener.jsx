import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

const NotificationListener = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const { addNotification: addToList, playSound } = useNotifications();
    const { addToast } = useToast();

    useEffect(() => {
        if (!user || !socket) return;

        // 1. Connect if not already connected
        if (!socket.connected) {
            socket.connect();
        }

        // 2. Join the user's private room (matches backend logic)
        socket.emit('join_room', user.userId);

        // 3. Define event handlers
        const handleReceiveNotification = (data) => {
            // Add to persistent notification list (for dropdown)
            if (addToList) addToList(data);
            // Show a temporary toast for immediate feedback
            addToast(data.message, 'info', { title: data.title });
            // Play sound if not muted by user preferences
            if (playSound) playSound();
        };

        const handleRefreshData = () => {
            // Dispatch a global event that components can listen to for refetching
            window.dispatchEvent(new CustomEvent('refreshData'));
        };

        // 4. Register listeners
        socket.on('receive_notification', handleReceiveNotification);
        socket.on('refresh_data', handleRefreshData);

        // 5. Cleanup on unmount
        return () => {
            socket.off('receive_notification', handleReceiveNotification);
            socket.off('refresh_data', handleRefreshData);
        };
    }, [user, socket, addToList, addToast, playSound]);

    return null; // This component is invisible
};

export default NotificationListener;
