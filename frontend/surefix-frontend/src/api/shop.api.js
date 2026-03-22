import api from './axios';

const getMyCentre = () => {
    return api.get('/centres/my/centre');
};

const updateMyCentre = (centreData) => {
    return api.put('/centres/my/centre', centreData);
};

const getMyServices = () => {
    return api.get('/centres/my/services');
};

const addService = (serviceData) => {
    return api.post('/centres/my/services', serviceData);
};

const updateService = (id, serviceData) => {
    return api.put(`/centres/my/services/${id}`, serviceData);
};

const deleteService = (id) => {
    return api.delete(`/centres/my/services/${id}`);
};

const updateServicesOrder = (orderedIds) => {
    return api.put('/centres/my/services/order', { orderedIds });
};

const getMyAppointments = () => {
    return api.get('/centres/my/appointments');
};

const updateAppointmentStatus = (id, status) => {
    return api.patch(`/centres/my/appointments/${id}/status`, { status });
};

const getMyCustomers = () => {
    return api.get('/centres/my/customers');
};

export const shopAPI = {
    getMyCentre,
    updateMyCentre,
    getMyServices,
    addService,
    updateService,
    deleteService,
    updateServicesOrder,
    getMyAppointments,
    updateAppointmentStatus,
    getMyCustomers,
};