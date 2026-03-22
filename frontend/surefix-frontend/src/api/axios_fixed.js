import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('surefix_token');
        if (token && !config.url ? .includes('/auth/login') && !config.url ? .includes('/auth/register')) {
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
        if (response && response.status === 400) {
            const data = response.data;
            console.group('🔴 API 400 Validation Error: %s %s',
                (error.config && error.config.method ? error.config.method.toUpperCase() : 'GET'),
                (error.config ? error.config.url : 'unknown')
            );
            console.error('Status:', 400);
            console.error('Message:', data.message || 'Validation failed');

            if (data.errors && Array.isArray(data.errors)) {
                console.group('Validation Errors:');
                data.errors.forEach((err, i) => {
                    console.error(`%c${i+1}. %s`, 'color: orange',
                        err.msg || err.message || String(err)
                    );
                });
                console.groupEnd();
            }
            console.error('Request data:', error.config ? error.config.data : undefined);
            console.error('Full response:', data);
            console.groupEnd();

            error.validationErrors = data.errors;
            error.errorMessage = data.message || 'Please fix the errors above and try again.';
        } else if (response) {
            console.error('API Error %d: %s', response.status, error.config ? error.config.url : 'unknown');
        }
        return Promise.reject(error);
    }
);

export default api;