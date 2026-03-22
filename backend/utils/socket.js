import { io } from 'socket.io-client';

const URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a socket instance, but don't connect automatically.
export const socket = io(URL, { autoConnect: false });