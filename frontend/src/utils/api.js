import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('surefix_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isPublicAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify-email');

    if (status === 401 && !isPublicAuthEndpoint) {
      localStorage.removeItem('surefix_token');
      localStorage.removeItem('surefix_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data)       => API.post('/auth/register', data),
  login: (data)          => API.post('/auth/login', data),
  verifyEmail: (token)   => API.get(`/auth/verify-email?token=${token}`),
  getMe: ()              => API.get('/auth/me'),
  updateProfile: (data)  => API.put('/auth/profile', data),
};

// ── Customer: Devices ─────────────────────────────────────────
export const deviceAPI = {
  getAll: ()            => API.get('/devices'),
  create: (data)        => API.post('/devices', data),
  update: (id, data)    => API.put(`/devices/${id}`, data),
  delete: (id)          => API.delete(`/devices/${id}`),
};

// ── Public: Repair Centres ────────────────────────────────────
export const centreAPI = {
  getAll: (params)      => API.get('/centres', { params }),
  getById: (id)         => API.get(`/centres/${id}`),
  getAvailability: (id, date) => API.get(`/centres/${id}/availability`, { params: { date } }),
};

// ── Customer: Appointments ────────────────────────────────────
export const appointmentAPI = {
  getAll: (params)      => API.get('/appointments', { params }),
  create: (data)        => API.post('/appointments', data),
  cancel: (id)          => API.patch(`/appointments/${id}/cancel`),
};

// ── Public: Services ──────────────────────────────────────────
export const serviceAPI = {
  getAll: (params)      => API.get('/services', { params }),
};

// ── Repairer: Own centre management ──────────────────────────
export const repairerAPI = {
  // Centre
  getMyCentre: ()              => API.get('/centres/my/centre'),
  createMyCentre: (data)       => API.post('/centres/my/centre', data),
  updateMyCentre: (data)       => API.put('/centres/my/centre', data),
  // Services
  getMyServices: ()            => API.get('/centres/my/services'),
  addService: (data)           => API.post('/centres/my/services', data),
  updateService: (id, data)    => API.put(`/centres/my/services/${id}`, data),
  deleteService: (id)          => API.delete(`/centres/my/services/${id}`),
  // Appointments at their centre
  getMyAppointments: ()        => API.get('/centres/my/appointments'),
  updateAppointmentStatus: (id, status) => API.patch(`/centres/my/appointments/${id}/status`, { status }),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  getAllCentres: ()             => API.get('/centres/admin/all'),
  toggleVisibility: (id, is_visible) => API.patch(`/centres/admin/${id}/visibility`, { is_visible }),
  getAllUsers: ()               => API.get('/centres/admin/users'),
  getStats: ()                 => API.get('/centres/admin/stats'),
};

export default API;
