// Service controller
import { connectDB } from '../cofig/database.js';

export const getServices = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM services';
  const [services] = await connection.execute(query);
  res.status(200).json(services);
  await connection.end();
};

export const getService = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM services WHERE id = ?';
  const [rows] = await connection.execute(query, [req.params.id]);
  res.status(200).json(rows[0]);
  await connection.end();
};

export const createService = async (req, res) => {
  const connection = await connectDB();
  const { name, description, price, duration, centreId } = req.body;
  const query = 'INSERT INTO services (name, description, price, duration, centreId) VALUES (?, ?, ?, ?, ?)';
  const result = await connection.execute(query, [name, description, price, duration, centreId]);
  res.status(201).json({ id: result[0].insertId, name, description, price, duration, centreId });
  await connection.end();
};
