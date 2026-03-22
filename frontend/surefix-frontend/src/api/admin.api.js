import api from './axios';

/**
 * Fetches overview statistics for the admin dashboard.
 * API: GET /api/admin/overview
 */
export const getAdminOverview = async() => {
    const { data } = await api.get('/admin/overview');
    return data;
};

/**
 * Fetches all users for the admin dashboard.
 * API: GET /api/admin/users
 */
export const getAdminUsers = async() => {
    const { data } = await api.get('/admin/users');
    return data;
};

/**
 * Fetches all appointments for the admin dashboard.
 * API: GET /api/admin/appointments
 */
export const getAdminAppointments = async() => {
    const { data } = await api.get('/admin/appointments');
    return data;
};

/**
 * Fetches all centres for the admin dashboard.
 * API: GET /api/admin/centres
 */
export const getAdminCentres = async() => {
    const { data } = await api.get('/admin/centres');
    return data;
};

/**
 * Toggles user verification status.
 * API: PUT /api/admin/users/:id/verify
 */
export const toggleUserVerification = async(userId, isVerified) => {
    const { data } = await api.put(`/admin/users/${userId}/verify`, { is_verified: isVerified });
    return data;
};

/**
 * Toggles user authorization status (official account access).
 * API: PUT /api/admin/users/:id/authorize
 */
export const toggleUserAuthorization = async(userId, isAuthorized) => {
    const { data } = await api.put(`/admin/users/${userId}/authorize`, { is_authorized: isAuthorized });
    return data;
};

/**
 * Toggles repair centre visibility.
 * API: PATCH /api/admin/centres/:id/visibility
 */
export const updateCentreVisibility = async(centreId, isVisible) => {
    const { data } = await api.patch(`/admin/centres/${centreId}/visibility`, { is_visible: isVisible });
    return data;
};