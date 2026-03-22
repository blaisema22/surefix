import api from './axios';

/**
 * Fetches the profile for the currently logged-in repairer's centre.
 * API: GET /api/centres/my/centre
 */
export const getMyCentre = async() => {
    const { data } = await api.get('/centres/my/centre');
    return data;
};

/**
 * Updates the profile for the currently logged-in repairer's centre.
 * API: PUT /api/centres/my/centre
 * @param {object} centreData - The updated centre data.
 */
export const updateMyCentre = async(centreData) => {
    const { data } = await api.put('/centres/my/centre', centreData);
    return data;
};

/**
 * Fetches all services for the logged-in repairer's centre.
 * API: GET /api/centres/my/services
 */
export const getMyServices = async() => {
    const { data } = await api.get('/centres/my/services');
    return data;
};

/**
 * Adds a new service to the centre.
 * API: POST /api/centres/my/services
 * @param {object} serviceData
 */
export const addService = async(serviceData) => {
    const { data } = await api.post('/centres/my/services', serviceData);
    return data;
};

/**
 * Updates an existing service.
 * API: PUT /api/centres/my/services/:id
 * @param {number} id
 * @param {object} serviceData
 */
export const updateService = async(id, serviceData) => {
    const { data } = await api.put(`/centres/my/services/${id}`, serviceData);
    return data;
};

/**
 * Deletes a service.
 * API: DELETE /api/centres/my/services/:id
 */
export const deleteService = async(id) => {
    const { data } = await api.delete(`/centres/my/services/${id}`);
    return data;
};

/**
 * Fetches all appointments for the logged-in repairer's centre.
 * API: GET /api/centres/my/appointments
 */
export const getMyAppointments = async() => {
    const { data } = await api.get('/centres/my/appointments');
    return data;
};

/**
 * Updates the status of an appointment.
 * API: PATCH /api/centres/my/appointments/:id/status
 * @param {number} id
 * @param {string} status - 'confirmed', 'completed', 'cancelled'
 */
export const updateAppointmentStatus = async(id, status) => {
    const { data } = await api.patch(`/centres/my/appointments/${id}/status`, { status });
    return data;
};

/**
 * Fetches all unique customers who have booked with the centre.
 * API: GET /api/centres/my/customers
 */
export const getMyCustomers = async() => {
    const { data } = await api.get('/centres/my/customers');
    return data;
};