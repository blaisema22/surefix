const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Use SQLite database file
const dbPath = path.join(__dirname, '../../surefix.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
    try {
        // Users table
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fullName TEXT NOT NULL,
                phone TEXT,
                role TEXT CHECK(role IN ('customer', 'shop', 'admin')) DEFAULT 'customer',
                isVerified BOOLEAN DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Shops table
        db.exec(`
            CREATE TABLE IF NOT EXISTS shops (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL UNIQUE,
                shopName TEXT NOT NULL,
                location TEXT,
                phone TEXT,
                email TEXT,
                rating DECIMAL(3, 2) DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);

        // Devices table
        db.exec(`
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                deviceType TEXT NOT NULL,
                brand TEXT,
                model TEXT,
                serialNumber TEXT,
                issueDescription TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);

        // Services table
        db.exec(`
            CREATE TABLE IF NOT EXISTS services (
                id TEXT PRIMARY KEY,
                shopId TEXT NOT NULL,
                serviceName TEXT NOT NULL,
                description TEXT,
                estimatedTime INT,
                price DECIMAL(10, 2),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (shopId) REFERENCES shops(id)
            )
        `);

        // Appointments table
        db.exec(`
            CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                customerId TEXT NOT NULL,
                shopId TEXT NOT NULL,
                deviceId TEXT NOT NULL,
                serviceId TEXT NOT NULL,
                appointmentDate DATETIME NOT NULL,
                status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
                notes TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customerId) REFERENCES users(id),
                FOREIGN KEY (shopId) REFERENCES shops(id),
                FOREIGN KEY (deviceId) REFERENCES devices(id),
                FOREIGN KEY (serviceId) REFERENCES services(id)
            )
        `);

        // Notifications table
        db.exec(`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                type TEXT,
                isRead BOOLEAN DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);

        // Reviews table
        db.exec(`
            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                appointmentId TEXT NOT NULL UNIQUE,
                customerId TEXT NOT NULL,
                shopId TEXT NOT NULL,
                rating INT CHECK(rating BETWEEN 1 AND 5),
                comment TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointmentId) REFERENCES appointments(id),
                FOREIGN KEY (customerId) REFERENCES users(id),
                FOREIGN KEY (shopId) REFERENCES shops(id)
            )
        `);

        console.log('✅  SQLite database initialized');
    } catch (err) {
        console.error('❌  Database initialization error:', err.message);
    }
}

// Initialize and test connection
try {
    initializeDatabase();
    console.log('✅  SQLite connected — database:', dbPath);
} catch (err) {
    console.error('❌  SQLite connection failed:', err.message);
    process.exit(1);
}

module.exports = db;