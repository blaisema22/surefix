/**
 * Centralized API client for all backend requests
 * Handles authentication tokens, error handling, and request/response formatting
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Token Management ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('authToken');
export const setToken = (token) => localStorage.setItem('authToken', token);
export const clearToken = () => localStorage.removeItem('authToken');

// ── Request Helper ────────────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
            body = null,
            headers = {},
            isPublic = false,
    } = options;

    const token = getToken();
    const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (token && !isPublic) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers: finalHeaders,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            // If 401, token might be expired - clear it
            if (response.status === 401) {
                clearToken();
            }
            throw new Error(data.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// ── Public API Methods ────────────────────────────────────────────────────────

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const auth = {
    register: (userData) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: userData,
            isPublic: true,
        }),

    login: (credentials) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: credentials,
            isPublic: true,
        }),

    me: () => apiRequest('/auth/me'),

    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// ── SHOPS ─────────────────────────────────────────────────────────────────────
export const shops = {
    list: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/shops?${params.toString()}`, { isPublic: true });
    },

    get: (id) => apiRequest(`/shops/${id}`, { isPublic: true }),

    getSlots: (id, date) =>
        apiRequest(`/shops/${id}/slots?date=${date}`, { isPublic: true }),

    updateProfile: (shopData) =>
        apiRequest('/shops/profile', {
            method: 'PUT',
            body: shopData,
        }),
};

// ── DEVICES ───────────────────────────────────────────────────────────────────
export const devices = {
    list: () => apiRequest('/devices'),

    get: (id) => apiRequest(`/devices/${id}`),

    create: (deviceData) =>
        apiRequest('/devices', {
            method: 'POST',
            body: deviceData,
        }),

    update: (id, deviceData) =>
        apiRequest(`/devices/${id}`, {
            method: 'PUT',
            body: deviceData,
        }),

    delete: (id) =>
        apiRequest(`/devices/${id}`, {
            method: 'DELETE',
        }),
};

// ── SERVICES ──────────────────────────────────────────────────────────────────
export const services = {
    list: (category) => {
        const endpoint = category ? `/services?category=${category}` : '/services';
        return apiRequest(endpoint, { isPublic: true });
    },

    get: (id) => apiRequest(`/services/${id}`, { isPublic: true }),

    create: (serviceData) =>
        apiRequest('/services', {
            method: 'POST',
            body: serviceData,
        }),
};

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
export const appointments = {
    list: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/appointments?${params.toString()}`);
    },

    get: (id) => apiRequest(`/appointments/${id}`),

    create: (appointmentData) =>
        apiRequest('/appointments', {
            method: 'POST',
            body: appointmentData,
        }),

    updateStatus: (id, statusUpdate) =>
        apiRequest(`/appointments/${id}/status`, {
            method: 'PATCH',
            body: statusUpdate,
        }),
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export const dashboard = {
    getStats: () => apiRequest('/dashboard/stats'),
};

// ── PROFILES ──────────────────────────────────────────────────────────────────
export const profiles = {
    getProfile: () => apiRequest('/profile'),

    updateProfile: (profileData) =>
        apiRequest('/profile', {
            method: 'PUT',
            body: profileData,
        }),
};

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export const reviews = {
    list: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/reviews?${params.toString()}`);
    },

    create: (reviewData) =>
        apiRequest('/reviews', {
            method: 'POST',
            body: reviewData,
        }),
};

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notifications = {
    list: () => apiRequest('/notifications'),

    markAsRead: (id) =>
        apiRequest(`/notifications/${id}/read`, {
            method: 'PUT',
        }),
};

export default {
    auth,
    shops,
    devices,
    services,
    appointments,
    dashboard,
    profiles,
    reviews,
    notifications,
};