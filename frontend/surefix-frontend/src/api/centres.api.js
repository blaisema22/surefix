import api from './axios';


// Implement getAllUsers to call backend endpoint for Users.jsx compatibility
export const getAllUsers = async() => (await api.get('/centres/admin/users')).data;

const getCentres = (params) => api.get('/centres', { params });
const getCentreById = (id) => api.get(`/centres/${id}`);
const getAvailability = (id, date) => api.get(`/centres/${id}/availability`, { params: { date } });
const getMyCentre = () => api.get('/centres/my/centre');
const createCentre = (data) => api.post('/centres/my/centre', data);
const updateCentre = (data) => api.put('/centres/my/centre', data);
const getMyServices = () => api.get('/centres/my/services');
const addService = (data) => api.post('/centres/my/services', data);
const updateService = (id, data) => api.put(`/centres/my/services/${id}`, data);
const deleteService = (id) => api.delete(`/centres/my/services/${id}`);
const getMyCustomers = () => api.get('/centres/my/customers');
const getShopReports = (params) => api.get('/centres/my/reports', { params });

const getCentreServices = (id) => api.get(`/centres/${id}`);
const getAllCentresAdmin = () => api.get('/centres/admin/all');
const updateCentreVisibility = (id, is_visible) => api.patch(`/centres/admin/${id}/visibility`, { is_visible });
const getCentreAvailability = getAvailability;
const updateMyCentre = updateCentre;
const getAllUsersAdmin = getAllUsers;

export const centreAPI = {
    getCentres,
    getCentreById,
    getAvailability,
    getMyCentre,
    createCentre,
    updateCentre,
    getMyServices,
    addService,
    updateService,
    deleteService,
    getMyCustomers,
    getShopReports,
    getCentreServices,
    getAllCentresAdmin,
    updateCentreVisibility,
    getCentreAvailability,
    updateMyCentre,
    getAllUsersAdmin,
};