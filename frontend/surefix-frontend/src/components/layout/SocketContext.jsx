import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { socket } from '@/utils/socket';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('surefix_token');

        if (isAuthenticated && token) {
            if (!socket.connected) {
                socket.connect();
            }
            socket.emit('authenticate', token);
        } else {
            if (socket.connected) {
                socket.disconnect();
            }
        }

        // Cleanup handled by dependency change or app unmount
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};