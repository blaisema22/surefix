import api from './axios';

export const notificationsAPI = {
    getAll: async (page = 1, limit = 20) => {
        const response = await api.get('/notifications', { params: { page, limit } });
        return response.data;
    },

    markRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    clearAll: async () => {
        const response = await api.delete('/notifications/clear-all');
        return response.data;
    }
};