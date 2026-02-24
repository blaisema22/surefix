// Authentication controller
import jwt from 'jsonwebtoken';
import { connectDB } from '../cofig/database.js';

export const register = async (req, res) => {
  const connection = await connectDB();
  const { name, email, password, phone } = req.body;
  const query = 'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)';
  await connection.execute(query, [name, email, password, phone]);
  res.status(201).json({ message: 'User registered successfully' });
  await connection.end();
};

export const login = async (req, res) => {
  const connection = await connectDB();
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  const [rows] = await connection.execute(query, [email, password]);
  const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.status(200).json({ message: 'Login successful', token, user: rows[0] });
  await connection.end();
};

export const logout = async (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};
