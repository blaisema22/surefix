// Centre controller
import { connectDB } from '../cofig/database.js';

export const getAllCentres = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM centres';
  const [centres] = await connection.execute(query);
  res.status(200).json(centres);
  await connection.end();
};

export const getCentre = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM centres WHERE id = ?';
  const [rows] = await connection.execute(query, [req.params.id]);
  res.status(200).json(rows[0]);
  await connection.end();
};

export const createCentre = async (req, res) => {
  const connection = await connectDB();
  const { name, address, city, phoneNumber, email, services } = req.body;
  const query = 'INSERT INTO centres (name, address, city, phoneNumber, email, services) VALUES (?, ?, ?, ?, ?, ?)';
  const result = await connection.execute(query, [name, address, city, phoneNumber, email, services]);
  res.status(201).json({ id: result[0].insertId, name, address, city, phoneNumber, email, services });
  await connection.end();
};
