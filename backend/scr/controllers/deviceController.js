// Device controller
import { connectDB } from '../cofig/database.js';

export const getDevices = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM devices WHERE userId = ?';
  const [devices] = await connection.execute(query, [req.user.id]);
  res.status(200).json(devices);
  await connection.end();
};

export const addDevice = async (req, res) => {
  const connection = await connectDB();
  const { name, brand, model, serialNumber, purchaseDate } = req.body;
  const query = 'INSERT INTO devices (userId, name, brand, model, serialNumber, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)';
  const result = await connection.execute(query, [req.user.id, name, brand, model, serialNumber, purchaseDate]);
  res.status(201).json({ id: result[0].insertId, userId: req.user.id, name, brand, model, serialNumber, purchaseDate });
  await connection.end();
};

export const deleteDevice = async (req, res) => {
  const connection = await connectDB();
  const query = 'DELETE FROM devices WHERE id = ?';
  await connection.execute(query, [req.params.id]);
  res.status(200).json({ message: 'Device deleted successfully' });
  await connection.end();
};
