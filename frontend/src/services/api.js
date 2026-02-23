// API Service
const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  // Auth endpoints
  register: (data) => fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  login: (data) => fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  // User endpoints
  getUser: (id, token) => fetch(`${API_BASE_URL}/users/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json()),

  // Centres endpoints
  getCentres: () => fetch(`${API_BASE_URL}/centres`)
    .then(res => res.json()),

  getCentre: (id) => fetch(`${API_BASE_URL}/centres/${id}`)
    .then(res => res.json()),

  // Devices endpoints
  getDevices: (token) => fetch(`${API_BASE_URL}/devices`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json()),

  // Appointments endpoints
  getAppointments: (token) => fetch(`${API_BASE_URL}/appointments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json())
};

export default api;
