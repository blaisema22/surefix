import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const reviewsAPI = {
    // Submit a review
    submitReview: (appointmentId, data) => {
        // We use the appointments endpoint as it's cleaner for "Rate this repair"
        return axios.post(`${API_URL}/appointments/${appointmentId}/rate`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    // Get reviews for a specific centre
    getCentreReviews: (centreId) => {
        return axios.get(`${API_URL}/reviews/centre/${centreId}`);
    }
};
