// Notification controller
import { connectDB } from '../cofig/database.js';

export const getNotifications = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM notifications WHERE userId = ?';
  const [notifications] = await connection.execute(query, [req.user.id]);
  res.status(200).json(notifications);
  await connection.end();
};

export const sendNotification = async (req, res) => {
  const connection = await connectDB();
  const { message, userId } = req.body;
  const query = 'INSERT INTO notifications (userId, message) VALUES (?, ?)';
  const result = await connection.execute(query, [userId, message]);
  res.status(201).json({ id: result[0].insertId, userId, message });
  await connection.end();
};
