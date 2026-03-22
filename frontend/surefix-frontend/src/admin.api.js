import api from './axios';

export const adminAPI = {
    /**
     * Fetches all repair centres, including inactive/hidden ones.
     * Admin access required.
     */
    getAllCentres: async () => {
        try {
            const response = await api.get('/api/admin/centres');
            return response.data;
        } catch (error) {
            console.error("Error fetching all centres:", error);
            throw error;
        }
    },

    /**
     * Updates the visibility of a repair centre.
     * Admin access required.
     * @param {number} centreId - The ID of the centre to update.
     * @param {boolean} isVisible - The new visibility status.
     */
    updateCentreVisibility: async (centreId, isVisible) => {
        try {
            const response = await api.patch(`/api/admin/centres/${centreId}/visibility`, { is_visible: isVisible });
            return response.data;
        } catch (error) {
            console.error(`Error updating visibility for centre ${centreId}:`, error);
            throw error;
        }
    },

    /**
     * Fetches summary statistics for the admin dashboard.
     * Admin access required.
     */
    getDashboardStats: async () => {
        try {
            const response = await api.get('/api/admin/stats');
            return response.data;
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            throw error;
        }
    },

    /**
     * Fetches all users for the admin panel.
     * Admin access required.
     */
    getAllUsers: async () => {
        try {
            const response = await api.get('/api/admin/users');
            return response.data;
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    },

    /**
     * Updates the verification status of a user.
     * Admin access required.
     * @param {number} userId - The ID of the user to update.
     * @param {boolean} isVerified - The new verification status.
     */
    updateUserVerification: async (userId, isVerified) => {
        try {
            const response = await api.put(`/api/admin/users/${userId}/verify`, { is_verified: isVerified });
            return response.data;
        } catch (error) {
            console.error(`Error updating verification for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Downloads a CSV report for admin analytics.
     * @param {string} type - The type of report ('users', 'appointments', 'centres').
     */
    downloadReport: async (type) => {
        try {
            const response = await api.get(`/reports/download`, {
                params: { type },
                responseType: 'blob', // Important for handling binary/file data
            });

            // Create a blob link to trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `surefix_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(`Error downloading ${type} report:`, error);
            throw error;
        }
    },
};