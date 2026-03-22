import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    // timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.url && !config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const response = error.response;
        const config = error.config;

        if (response && response.status === 400) {
            const data = response.data;
            const method = config && config.method ? config.method.toUpperCase() : 'GET';
            const url = config && config.url ? config.url : 'unknown';

            console.group('🔴 API 400 Validation Error: %s %s', method, url);
            console.error('Status:', 400);
            console.error('Message:', data.message || 'Validation failed');

            if (data.errors && Array.isArray(data.errors)) {
                console.group('Validation Errors:');
                data.errors.forEach((err, i) => {
                    console.error('%c' + (i + 1) + '. %s', 'color: orange',
                        err.msg || err.message || String(err)
                    );
                });
                console.groupEnd();
            }

            console.error('Request data:', config && config.data);
            console.error('Full response:', data);
            console.groupEnd();

            error.validationErrors = data.errors;
            error.errorMessage = data.message || 'Please fix the errors above and try again.';
        } else if (response) {
            const url = config && config.url ? config.url : 'unknown';

            if (response.status >= 500) {
                // Friendly message for server-side failure
                error.errorMessage = 'Server is currently unavailable. Please try again in a few moments.';
            } else {
                console.error('API Error %d: %s', response.status, url);
            }
        }

        return Promise.reject(error);
    }
);

export default api;