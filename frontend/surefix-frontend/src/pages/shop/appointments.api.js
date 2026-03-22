import api from './axios';

export const appointmentAPI = {
    // --- Customer Methods ---

    getMyCustomerAppointments: async () => {
        const { data } = await api.get('/appointments');
        return data;
    },

    createAppointment: async (formData) => {
        const { data } = await api.post('/appointments', formData);
        return data;
    },

    cancelMyAppointment: async (id) => {
        const { data } = await api.patch(`/appointments/${id}/cancel`);
        return data;
    },

    rateAppointment: async (id, ratingData) => {
        const { data } = await api.post(`/appointments/${id}/rate`, ratingData);
        return data;
    },

    // --- Shop/Repairer Methods ---

    getShopAppointments: async () => {
        // Fetches appointments for the repair centre owned by the logged-in user
        const { data } = await api.get('/centres/my/appointments');
        return data;
    },

    updateAppointmentStatus: async (id, statusOrData) => {
        // Supports both simple status string or FormData object (for image uploads)
        let payload = statusOrData;
        if (typeof statusOrData === 'string') {
            payload = { status: statusOrData };
        }
        const { data } = await api.patch(`/appointments/${id}/status`, payload);
        return data;
    }
};
