// Auth Service
import api from './api';

const authService = {
    register: async(name, email, password, role) => {
        try {
            const response = await api.register({ name, email, password, role });
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    login: async(email, password) => {
        try {
            const response = await api.login({ email, password });
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken: () => localStorage.getItem('token'),

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;