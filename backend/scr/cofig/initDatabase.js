// Database schema initialization
import { connectDB } from './database.js';

export const initDatabase = async () => {
  const connection = await connectDB();
  console.log('Initializing database schema...');
  
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address VARCHAR(255),
      city VARCHAR(100),
      postCode VARCHAR(20),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS centres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255),
      city VARCHAR(100),
      phoneNumber VARCHAR(20),
      email VARCHAR(255),
      services TEXT,
      rating DECIMAL(3,2),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS devices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      name VARCHAR(255),
      brand VARCHAR(100),
      model VARCHAR(100),
      serialNumber VARCHAR(255),
      purchaseDate DATE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      description TEXT,
      price DECIMAL(10,2),
      duration INT,
      centreId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (centreId) REFERENCES centres(id)
    );
    
    CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      centreId INT NOT NULL,
      deviceId INT NOT NULL,
      serviceId INT NOT NULL,
      appointmentDate DATE,
      appointmentTime TIME,
      status VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (centreId) REFERENCES centres(id),
      FOREIGN KEY (deviceId) REFERENCES devices(id),
      FOREIGN KEY (serviceId) REFERENCES services(id)
    );
    
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      centreId INT NOT NULL,
      rating INT,
      comment TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (centreId) REFERENCES centres(id)
    );
    
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      message TEXT,
      isRead BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `;
  
  await connection.query(createTablesSQL);
  console.log('Database schema initialized successfully');
  await connection.end();
};
