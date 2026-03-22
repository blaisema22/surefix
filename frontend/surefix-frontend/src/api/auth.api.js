import api from './axios';
export const register         = (data) => api.post('/auth/register', data);
export const login            = (data) => api.post('/auth/login', data);
export const getMe            = ()     => api.get('/auth/me');
export const updateProfile    = (data) => api.put('/auth/profile', data);
export const changePassword   = (data) => api.post('/auth/change-password', data);
export const forgotPassword   = (data) => api.post('/auth/forgot-password', data);
export const resetPassword    = (data) => api.post('/auth/reset-password', data);
export const updateProfilePic = (data) => api.put('/auth/profile/picture', data);