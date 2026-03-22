import api from './axios';

/**
 * Fetches all appointments for the current customer.
 * API: GET /api/appointments
 */
const getMyCustomerAppointments = async() => {
    const { data } = await api.get('/appointments');
    return data;
};

/**
 * Cancels an appointment for the current customer.
 * API: PATCH /api/appointments/:id/cancel
 */
const cancelMyAppointment = async(id) => {
    const { data } = await api.patch(`/appointments/${id}/cancel`);
    return data;
};

/**
 * Submits a rating and review for a completed appointment.
 * API: POST /api/appointments/:id/rate
 */
const rateAppointment = async(id, ratingData) => {
    const { data } = await api.post(`/appointments/${id}/rate`, ratingData);
    return data;
};

export const appointmentAPI = {
    getMyCustomerAppointments,
    cancelMyAppointment,
    rateAppointment,
};