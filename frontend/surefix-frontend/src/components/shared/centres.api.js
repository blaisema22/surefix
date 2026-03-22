import api from './axios';

/**
 * API methods for interacting with the repair centres endpoints.
 */
export const centreAPI = {
    /**
     * Fetches a list of publicly visible repair centres.
     * Can be filtered by search, category, and location.
     * @param {object} params - Query parameters (search, category, lat, lng).
     */
    getCentres: async (params) => {
        const response = await api.get('/centres', { params });
        return response.data;
    },

    /**
     * Fetches a single repair centre by its ID, including its services.
     * @param {string|number} id - The ID of the centre.
     */
    getCentreById: async (id) => {
        const response = await api.get(`/centres/${id}`);
        return response.data;
    },

    /**
     * Fetches the available time slots for a given centre and date.
     * @param {string|number} id - The ID of the centre.
     * @param {string} date - The date in 'YYYY-MM-DD' format.
     */
    getAvailability: async (id, date) => {
        const response = await api.get(`/centres/${id}/availability`, { params: { date } });
        return response.data;
    },

    /**
     * Fetches the services offered by a specific centre.
     * @param {string|number} id - The ID of the centre.
     */
    getCentreServices: async (id) => {
        const response = await api.get(`/centres/${id}/services`);
        return response.data;
    },

    /**
     * Fetches the profile of the currently authenticated repairer's own centre.
     * Requires repairer authentication.
     */
    getMyCentre: async () => {
        const response = await api.get('/centres/my/centre');
        return response.data;
    },

    /**
     * Updates the profile of the currently authenticated repairer's own centre.
     * @param {object} data - The centre data to update.
     */
    updateMyCentre: async (data) => {
        const response = await api.put('/centres/my/centre', data);
        return response.data;
    },

    /**
     * Fetches all services for the repairer's own centre.
     */
    getMyServices: async () => {
        const response = await api.get('/centres/my/services');
        return response.data;
    },

    /**
     * Adds a new service to the repairer's centre.
     * @param {object} data - { service_name, device_category, estimated_price_min, estimated_duration_minutes }
     */
    addService: async (data) => {
        const response = await api.post('/centres/my/services', data);
        return response.data;
    },

    /**
     * Updates an existing service.
     * @param {number} id - Service ID
     * @param {object} data - Updated fields
     */
    updateService: async (id, data) => {
        const response = await api.put(`/centres/my/services/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a service.
     * @param {number} id - Service ID
     */
    deleteService: async (id) => {
        const response = await api.delete(`/centres/my/services/${id}`);
        return response.data;
    }
};