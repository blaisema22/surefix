import api from './axios';

// Service management for a repair centre
export const getMyServices = async () => {
    const response = await api.get('/centres/my/services');
    return response.data;
};

export const addService = async (serviceData) => {
    const response = await api.post('/centres/my/services', serviceData);
    return response.data;
};

export const updateService = async (serviceId, serviceData) => {
    const response = await api.put(`/centres/my/services/${serviceId}`, serviceData);
    return response.data;
};

export const deleteService = async (serviceId) => {
    const response = await api.delete(`/centres/my/services/${serviceId}`);
    return response.data;
};

// Customer management for a repair centre
export const getMyCustomers = async () => {
    const response = await api.get('/centres/my/customers');
    return response.data;
};