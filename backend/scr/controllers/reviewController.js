// Review controller
import { connectDB } from '../cofig/database.js';

export const getReviews = async (req, res) => {
  const connection = await connectDB();
  const query = 'SELECT * FROM reviews WHERE centreId = ?';
  const [reviews] = await connection.execute(query, [req.params.centreId]);
  res.status(200).json(reviews);
  await connection.end();
};

export const createReview = async (req, res) => {
  const connection = await connectDB();
  const { rating, comment, centreId } = req.body;
  const query = 'INSERT INTO reviews (userId, centreId, rating, comment) VALUES (?, ?, ?, ?)';
  const result = await connection.execute(query, [req.user.id, centreId, rating, comment]);
  res.status(201).json({ id: result[0].insertId, userId: req.user.id, centreId, rating, comment });
  await connection.end();
};
