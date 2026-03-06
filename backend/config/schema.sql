-- SureFix Database Schema v2
-- Supports: customers, repairers (self-register centres), admins

CREATE DATABASE IF NOT EXISTS surefix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE surefix_db;

-- ─── USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  role          ENUM('customer','repairer','admin') DEFAULT 'customer',
  is_verified   BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token   VARCHAR(255),
  reset_token_expires DATETIME,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── REPAIR CENTRES ────────────────────────────────────────────────────────
-- owner_id  = the repairer who registered this centre
-- is_active = repairer toggles their own centre open/closed
-- is_visible= ADMIN can hide/show centre from customer search
CREATE TABLE IF NOT EXISTS repair_centres (
  centre_id    INT AUTO_INCREMENT PRIMARY KEY,
  owner_id     INT,
  name         VARCHAR(150) NOT NULL,
  address      VARCHAR(255) NOT NULL,
  district     VARCHAR(100),
  latitude     DECIMAL(10,8),
  longitude    DECIMAL(11,8),
  phone        VARCHAR(20),
  email        VARCHAR(150),
  opening_time TIME DEFAULT '08:00:00',
  closing_time TIME DEFAULT '18:00:00',
  working_days VARCHAR(100) DEFAULT 'Mon-Sat',
  description  TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  is_visible   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ─── SERVICES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  service_id              INT AUTO_INCREMENT PRIMARY KEY,
  centre_id               INT NOT NULL,
  service_name            VARCHAR(100) NOT NULL,
  description             TEXT,
  device_category         ENUM('smartphone','tablet','laptop','desktop','other') NOT NULL,
  estimated_price_min     DECIMAL(10,2),
  estimated_price_max     DECIMAL(10,2),
  estimated_duration_minutes INT DEFAULT 60,
  is_available            BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (centre_id) REFERENCES repair_centres(centre_id) ON DELETE CASCADE
);

-- ─── DEVICES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  device_id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  brand             VARCHAR(100) NOT NULL,
  model             VARCHAR(100) NOT NULL,
  device_type       ENUM('smartphone','tablet','laptop','desktop','other') NOT NULL,
  serial_number     VARCHAR(100),
  purchase_year     INT,
  issue_description TEXT NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ─── APPOINTMENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  centre_id        INT NOT NULL,
  device_id        INT NOT NULL,
  service_id       INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status           ENUM('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  notes            TEXT,
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(user_id)            ON DELETE CASCADE,
  FOREIGN KEY (centre_id)  REFERENCES repair_centres(centre_id) ON DELETE CASCADE,
  FOREIGN KEY (device_id)  REFERENCES devices(device_id)        ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id)      ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- DEFAULT PASSWORDS (all accounts use same hash for demo convenience)
-- Hash = bcrypt of "Password@123"  (12 rounds)
-- ═══════════════════════════════════════════════════════════════════════════

-- Admin
INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
('SureFix Admin', 'admin@surefix.com', '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', 'admin', TRUE);

-- Repairers (user_id: 2,3,4,5,6)
INSERT INTO users (name, email, password_hash, phone, role, is_verified) VALUES
('Jean Bosco N.',  'techfix@surefix.com',   '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788123456', 'repairer', TRUE),
('Amina Uwase',    'irepair@surefix.com',   '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788234567', 'repairer', TRUE),
('Patrick H.',     'smartfix@surefix.com',  '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788345678', 'repairer', TRUE),
('Grace Ineza',    'digi@surefix.com',      '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788456789', 'repairer', TRUE),
('Eric Mutabazi',  'elite@surefix.com',     '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788567890', 'repairer', TRUE);

-- Sample customer (user_id: 7)
INSERT INTO users (name, email, password_hash, phone, role, is_verified) VALUES
('Alice Mukamana', 'alice@example.com', '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788000001', 'customer', TRUE);

-- Repair centres (owner_id references repairer user_ids above)
INSERT INTO repair_centres (owner_id, name, address, district, latitude, longitude, phone, email, description, opening_time, closing_time, is_active, is_visible) VALUES
(2, 'TechFix Kigali',          'KG 15 Ave, Remera',   'Gasabo',     -1.9441, 30.0786, '+250788123456', 'techfix@surefix.com',  'Professional repair centre specializing in smartphones and laptops.',     '08:00:00','19:00:00', TRUE, TRUE),
(3, 'iRepair Centre',          'KN 3 Rd, Nyarugenge', 'Nyarugenge', -1.9536, 30.0606, '+250788234567', 'irepair@surefix.com',  'Apple and Android device specialists with certified technicians.',         '09:00:00','18:00:00', TRUE, TRUE),
(4, 'SmartFix Pro',            'KK 19 Ave, Kicukiro', 'Kicukiro',   -1.9730, 30.0927, '+250788345678', 'smartfix@surefix.com', 'Expert repairs for all brands. Quick turnaround guaranteed.',              '08:00:00','18:30:00', TRUE, TRUE),
(5, 'DigiRepair Hub',          'KG 7 Ave, Kimironko', 'Gasabo',     -1.9361, 30.0972, '+250788456789', 'digi@surefix.com',     'Budget-friendly repairs without compromising quality.',                    '08:30:00','18:00:00', TRUE, TRUE),
(6, 'Elite Electronics Repair','KN 45 St, CBD',        'Nyarugenge', -1.9444, 30.0583, '+250788567890', 'elite@surefix.com',    'Premium service for high-end devices. Walk-ins welcome.',                 '08:00:00','20:00:00', TRUE, TRUE);

-- Services
INSERT INTO services (centre_id, service_name, description, device_category, estimated_price_min, estimated_price_max, estimated_duration_minutes) VALUES
(1,'Screen Replacement','Replace cracked or broken screens with OEM or quality aftermarket parts','smartphone',15000,45000,90),
(1,'Battery Replacement','Replace degraded batteries to restore full charge capacity','smartphone',8000,20000,60),
(1,'Charging Port Repair','Fix or replace faulty charging ports','smartphone',10000,25000,45),
(1,'Laptop Screen Repair','Replace damaged laptop screens','laptop',35000,80000,120),
(1,'Laptop Keyboard Replacement','Replace non-functional or physically damaged keyboards','laptop',20000,50000,90),
(1,'Data Recovery','Recover lost or deleted data from damaged devices','smartphone',20000,60000,180),
(2,'iPhone Screen Replacement','OEM and aftermarket screens for all iPhone models','smartphone',20000,60000,90),
(2,'iPhone Battery Replacement','Apple certified battery replacements','smartphone',12000,25000,60),
(2,'Water Damage Repair','Clean and repair water-damaged devices','smartphone',25000,70000,240),
(2,'Software Troubleshooting','Fix software issues, factory resets, OS updates','smartphone',5000,15000,60),
(2,'Tablet Screen Repair','Screen replacement for tablets','tablet',25000,75000,120),
(3,'Screen Replacement','All brands, all models','smartphone',12000,50000,90),
(3,'Motherboard Repair','Advanced motherboard-level repairs','laptop',30000,100000,480),
(3,'RAM Upgrade','Add or replace RAM modules','laptop',15000,40000,60),
(3,'SSD Installation','Upgrade to SSD for faster performance','laptop',25000,60000,90),
(3,'Virus Removal','Complete malware and virus removal with cleanup','laptop',8000,20000,120),
(4,'Screen Replacement','Budget-friendly screen repairs','smartphone',10000,35000,90),
(4,'Battery Replacement','All phone models','smartphone',6000,18000,60),
(4,'Software Issues','OS reinstall, updates, troubleshooting','smartphone',4000,12000,60),
(4,'Desktop Repair','PC desktop diagnosis and repair','desktop',15000,50000,120),
(4,'Printer Repair','Fix and service printers','other',10000,35000,90),
(5,'Premium Screen Replacement','Only OEM parts used','smartphone',25000,80000,90),
(5,'MacBook Repair','Specialized MacBook diagnosis and repair','laptop',50000,150000,240),
(5,'iPad Repair','All iPad models','tablet',30000,90000,120),
(5,'Camera Module Replacement','Front and rear camera replacement','smartphone',15000,50000,90),
(5,'Speaker/Mic Repair','Audio component repairs','smartphone',10000,30000,60);
