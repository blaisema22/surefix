import api from '../../api/axios';

// Get the repair centre owned by the current user
export const getMyCentre = async () => {
    const response = await api.get('/centres/my/centre');
    return response.data;
};

export const updateMyCentre = async (data) => {
    const response = await api.put('/centres/my/centre', data);
    return response.data;
};

// Get appointments for the shop
export const getMyAppointments = async () => {
    const response = await api.get('/centres/my/appointments');
    return response.data;
};

export const getMyCustomers = async () => {
    const response = await api.get('/centres/my/customers');
    return response.data;
};

export const getMyServices = async () => {
    const response = await api.get('/centres/my/services');
    return response.data;
};

export const addService = async (data) => {
    const response = await api.post('/centres/my/services', data);
    return response.data;
};

export const updateService = async (id, data) => {
    const response = await api.put(`/centres/my/services/${id}`, data);
    return response.data;
};

export const deleteService = async (id) => {
    const response = await api.delete(`/centres/my/services/${id}`);
    return response.data;
};