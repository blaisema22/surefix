import api from './axios';
export const getServices = (params) => api.get('/services', { params });