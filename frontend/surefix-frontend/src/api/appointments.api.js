import api from './axios';

// For creating an appointment
export const createAppointment = async(formData) => {
    const response = await api.post('/appointments', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// For customers to load their own appointments
export const getMyCustomerAppointments = async() => {
    const response = await api.get('/appointments');
    return response.data;
};

// Alias for general usage
export const getAppointments = getMyCustomerAppointments;

// For repair shops to load their appointments
export const getMyShopAppointments = async() => {
    const response = await api.get('/centres/my/appointments');
    return response.data;
};

// Generic get by ID
export const getAppointmentById = async(id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
};

// For customers to cancel
export const cancelMyAppointment = async(id) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
};

export const cancelAppointment = cancelMyAppointment;

export const updateAppointmentStatus = async(id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
};

export const appointmentAPI = {
    createAppointment,
    getMyCustomerAppointments,
    getAppointments,
    getMyShopAppointments,
    getShopAppointments: getMyShopAppointments,
    getAppointmentById,
    cancelMyAppointment,
    cancelAppointment,
    updateAppointmentStatus,
};

export default appointmentAPI;