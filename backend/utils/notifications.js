const { pool } = require('../config/db');
const { emitToUser, getOnlineUserIds } = require('../services/socketService');

/**
 * Creates a notification for a user.
 * @param {number} userId - The ID of the user to notify.
 * @param {string} message - The notification message.
 * @param {string} [link] - An optional URL for the notification.
 */
const createNotification = async(userId, message, link = null) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)', [userId, message, link]
        );

        // After saving, get the new unread count and the full notification object
        const [
            [{ count }]
        ] = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
        const [
            [newNotification]
        ] = await pool.query('SELECT * FROM notifications WHERE notification_id = ?', [result.insertId]);

        // Emit events to the user if they are online
        emitToUser(userId, 'new_notification', newNotification);
        emitToUser(userId, 'notification_count_update', count);
    } catch (error) {
        console.error(`Failed to create notification for user ${userId}:`, error);
    }
};

/**
 * Creates a notification for all currently online users.
 * @param {string} message - The notification message.
 * @param {string} [link] - An optional URL for the notification.
 */
const createBroadcastNotification = async(message, link = null) => {
    const onlineUserIds = getOnlineUserIds();
    if (onlineUserIds.length === 0) return;

    // Create a notification for each online user in parallel
    try {
        await Promise.all(onlineUserIds.map(userId => createNotification(userId, message, link)));
    } catch (error) {
        console.error('Failed during broadcast notification creation:', error);
    }
};

module.exports = { createNotification, createBroadcastNotification };