import api from './axios';

export const deviceAPI = {
    /**
     * Fetches all devices belonging to the logged-in user.
     * Endpoint: GET /api/devices
     */
    getMyDevices: () => api.get('/devices'),

    /**
     * Adds a new device to the user's profile.
     * Endpoint: POST /api/devices
     */
    addDevice: (data) => api.post('/devices', data),

    /**
     * Alias for addDevice to maintain compatibility with MyDevices.jsx
     */
    addMyDevice: (data) => api.post('/devices', data),

    /**
     * Updates an existing device.
     * Endpoint: PUT /api/devices/:id
     */
    updateMyDevice: (id, data) => api.put(`/devices/${id}`, data),

    /**
     * Compatibility alias used by ManageDevices component.
     */
    updateDevice: (id, data) => api.put(`/devices/${id}`, data),

    /**
     * Deletes a device.
     * Endpoint: DELETE /api/devices/:id
     */
    deleteMyDevice: (id) => api.delete(`/devices/${id}`),

    /**
     * Alias for deleteMyDevice.
     */
    deleteDevice: (id) => api.delete(`/devices/${id}`),
};