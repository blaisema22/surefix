import { connectDB } from '../cofig/database.js';

export const addapp = async (req, res) => {
  const { Name_user, Phone, Device, Description, Status } = req.body;
  if (!Name_user || !Phone || !Device || !Description || !Status)
    return res.json({ message: 'Enter all data fields' });
  const connection = await connectDB();
  const query = 'INSERT INTO appointments(Name_user,Phone,Device,Description,Status) VALUES(?,?,?,?,?)';
  const result = await connection.execute(query, [Name_user, Phone, Device, Description, Status]);
  res.json({ message: 'Data inserted successfully' });
  await connection.end();
};

export const updateapp = async (req, res) => {
  const { id } = req.params;
  const { Name_user, Phone, Device, Description, Status } = req.body;
  const connection = await connectDB();
  const query = 'UPDATE appointments SET Name_user=?,Phone=?,Device=?,Description=?,Status=? WHERE id=?';
  await connection.execute(query, [Name_user, Phone, Device, Description, Status, id]);
  res.json({ message: 'Updated successfully' });
  await connection.end();
};

export const getallapp = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM appointments';
  const [result] = await connection.execute(query);
  res.json(result);
  await connection.end();
};

export const getappbyId = async (req, res) => {
  const { id } = req.params;
  const connection = await connectDB();
  const query = 'SELECT * FROM appointments WHERE id=?';
  const [result] = await connection.execute(query, [id]);
  res.json(result);
  await connection.end();
};

export const deleteappbyId = async (req, res) => {
  const { id } = req.params;
  const connection = await connectDB();
  const query = 'DELETE FROM appointments WHERE id=?';
  await connection.execute(query, [id]);
  res.json({ message: 'Data deleted' });
  await connection.end();
};