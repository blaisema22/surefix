import { io } from 'socket.io-client';

// In development, Vite proxies /api, but socket.io needs the explicit URL usually if ports differ
// or relative path if proxied correctly. Assuming localhost:5000 for backend.
const SOCKET_URL = 'http://localhost:5000';
export const socket = io(SOCKET_URL, { autoConnect: false });