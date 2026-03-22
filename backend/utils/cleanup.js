const { pool } = require('../config/db');

/**
 * Deletes notifications older than a specified number of days.
 * @param {number} days - Age in days to delete (default: 30).
 * @param {boolean} onlyRead - If true, only delete notifications marked as read (default: true).
 * @returns {Promise<number>} - Number of deleted rows.
 */
const cleanupNotifications = async (days = 30, onlyRead = true) => {
    try {
        let query = 'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)';
        const params = [days];

        if (onlyRead) {
            query += ' AND is_read = 1';
        }

        const [result] = await pool.query(query, params);
        return result.affectedRows;
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        throw error;
    }
};

module.exports = { cleanupNotifications };