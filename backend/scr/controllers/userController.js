// User controller
import { connectDB } from '../cofig/database.js';

export const getUser = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await connection.execute(query, [req.params.id]);
  res.status(200).json(rows[0]);
  await connection.end();
};

export const updateUser = async (req, res) => {
  const connection = await connectDB();
  const { name, email, phone, address, city, postCode } = req.body;
  const query = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, city = ?, postCode = ? WHERE id = ?';
  await connection.execute(query, [name, email, phone, address, city, postCode, req.params.id]);
  res.status(200).json({ message: 'User updated successfully' });
  await connection.end();
};

export const deleteUser = async (req, res) => {
  const connection = await connectDB();
  const query = 'DELETE FROM users WHERE id = ?';
  await connection.execute(query, [req.params.id]);
  res.status(200).json({ message: 'User deleted successfully' });
  await connection.end();
};
