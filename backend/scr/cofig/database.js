// Database configuration
import mysql from 'mysql2/promise';

export const connectDB = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'surefix',
    port: process.env.DB_PORT || 3306
  });
  console.log('Database connected successfully');
  return connection;
};
