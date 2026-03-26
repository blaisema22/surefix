-- SureFix Database Schema v2 (Fixed)
-- Supports: customers, repairers (self-register centres), admins

DROP DATABASE IF EXISTS surefix_db;
CREATE DATABASE surefix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE surefix_db;

-- ─── USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  role          ENUM('customer','repairer','admin') DEFAULT 'customer',
  profile_image_url VARCHAR(255) DEFAULT NULL,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_authorized BOOLEAN DEFAULT TRUE,
  verification_token VARCHAR(255),
  reset_token   VARCHAR(255),
  reset_token_expires DATETIME,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── REPAIR CENTRES ────────────────────────────────────────────────────────
CREATE TABLE repair_centres (
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
CREATE TABLE services (
  service_id              INT AUTO_INCREMENT PRIMARY KEY,
  centre_id               INT NOT NULL,
  service_name            VARCHAR(100) NOT NULL,
  description             TEXT,
  device_category         ENUM('smartphone','tablet','laptop','desktop','other') NOT NULL,
  
  estimated_duration_minutes INT DEFAULT 60,
  is_available            BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (centre_id) REFERENCES repair_centres(centre_id) ON DELETE CASCADE
);


-- ─── DEVICES ───────────────────────────────────────────────────────────────
CREATE TABLE devices (
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
CREATE TABLE appointments (
  appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  centre_id        INT NOT NULL,
  device_id        INT NOT NULL,
  service_id       INT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status           ENUM('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  issue_description TEXT,
  issue_image_url   VARCHAR(255),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  notes            TEXT,
  reminder_24h_sent TINYINT(1) DEFAULT 0,
  reminder_1h_sent  TINYINT(1) DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(user_id)            ON DELETE CASCADE,
  FOREIGN KEY (centre_id)  REFERENCES repair_centres(centre_id) ON DELETE CASCADE,
  FOREIGN KEY (device_id)  REFERENCES devices(device_id)        ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id)      ON DELETE SET NULL
);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  title           VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  type            ENUM('info','success','warning','error','appointment') DEFAULT 'info',
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ─── REVIEWS ───────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  review_id       INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id  INT NOT NULL,
  centre_id       INT NOT NULL,
  user_id         INT NOT NULL,
  rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  FOREIGN KEY (centre_id)      REFERENCES repair_centres(centre_id)    ON DELETE CASCADE,
  FOREIGN KEY (user_id)        REFERENCES users(user_id)               ON DELETE CASCADE
);

-- ─── SMS SIMULATOR ─────────────────────────────────────────────────────────
CREATE TABLE sms_simulator (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  phone_number   VARCHAR(20)  NOT NULL,
  message        TEXT         NOT NULL,
  type           VARCHAR(50)  DEFAULT 'general',
  appointment_id INT          DEFAULT NULL,
  status         VARCHAR(20)  DEFAULT 'sent',
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
('SureFix Admin', 'admin@surefix.com', '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', 'admin', TRUE);

INSERT INTO users (name, email, password_hash, phone, role, is_verified) VALUES
('Jean Bosco N.',  'techfix@surefix.com',   '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788123456', 'repairer', TRUE),
('Amina Uwase',    'irepair@surefix.com',   '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788234567', 'repairer', TRUE),
('Patrick H.',     'smartfix@surefix.com',  '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788345678', 'repairer', TRUE),
('Grace Ineza',    'digi@surefix.com',      '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788456789', 'repairer', TRUE),
('Eric Mutabazi',  'elite@surefix.com',     '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788567890', 'repairer', TRUE);

INSERT INTO users (name, email, password_hash, phone, role, is_verified) VALUES
('Manishimwe Blaise', 'manishimweblaise603@gmail.com', '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250785470311', 'customer', TRUE),
('Alice Mukamana', 'alice@example.com', '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788000001', 'customer', TRUE);

INSERT INTO repair_centres (owner_id, name, address, district, latitude, longitude, phone, email, description, opening_time, closing_time, is_active, is_visible) VALUES
(2, 'TechFix Kigali',          'KG 15 Ave, Remera',   'Gasabo',     -1.9441, 30.0786, '+250788123456', 'techfix@surefix.com',  'Professional repair centre specializing in smartphones and laptops.',     '08:00:00','19:00:00', TRUE, TRUE),
(3, 'iRepair Centre',          'KN 3 Rd, Nyarugenge', 'Nyarugenge', -1.9536, 30.0606, '+250788234567', 'irepair@surefix.com',  'Apple and Android device specialists with certified technicians.',         '09:00:00','18:00:00', TRUE, TRUE),
(4, 'SmartFix Pro',            'KK 19 Ave, Kicukiro', 'Kicukiro',   -1.9730, 30.0927, '+250788345678', 'smartfix@surefix.com', 'Expert repairs for all brands. Quick turnaround guaranteed.',              '08:00:00','18:30:00', TRUE, TRUE),
(5, 'DigiRepair Hub',          'KG 7 Ave, Kimironko', 'Gasabo',     -1.9361, 30.0972, '+250788456789', 'digi@surefix.com',     'Budget-friendly repairs without compromising quality.',                    '08:30:00','18:00:00', TRUE, TRUE),
(6, 'Elite Electronics Repair','KN 45 St, CBD',        'Nyarugenge', -1.9444, 30.0583, '+250788567890', 'elite@surefix.com',    'Premium service for high-end devices. Walk-ins welcome.',                 '08:00:00','20:00:00', TRUE, TRUE);

INSERT INTO services (centre_id, service_name, description, device_category,  estimated_duration_minutes) VALUES
(1,'Screen Replacement','Replace cracked or broken screens with OEM or quality aftermarket parts','smartphone',90),
(1,'Battery Replacement','Replace degraded batteries to restore full charge capacity','smartphone',60),
(1,'Charging Port Repair','Fix or replace faulty charging ports','smartphone',45),
(1,'Laptop Screen Repair','Replace damaged laptop screens','laptop',120),
(1,'Laptop Keyboard Replacement','Replace non-functional or physically damaged keyboards','laptop',90),
(1,'Data Recovery','Recover lost or deleted data from damaged devices','smartphone',180),
(2,'iPhone Screen Replacement','OEM and aftermarket screens for all iPhone models','smartphone',90),
(2,'iPhone Battery Replacement','Apple certified battery replacements','smartphone',60),
(2,'Water Damage Repair','Clean and repair water-damaged devices','smartphone',240),
(2,'Software Troubleshooting','Fix software issues, factory resets, OS updates','smartphone',60),
(2,'Tablet Screen Repair','Screen replacement for tablets','tablet',120),
(3,'Screen Replacement','All brands, all models','smartphone',90),
(3,'Motherboard Repair','Advanced motherboard-level repairs','laptop',480),
(3,'RAM Upgrade','Add or replace RAM modules','laptop',60),
(3,'SSD Installation','Upgrade to SSD for faster performance','laptop',90),
(3,'Virus Removal','Complete malware and virus removal with cleanup','laptop',120),
(4,'Screen Replacement','Budget-friendly screen repairs','smartphone',90),
(4,'Battery Replacement','All phone models','smartphone',60),
(4,'Software Issues','OS reinstall, updates, troubleshooting','smartphone',60),
(4,'Desktop Repair','PC desktop diagnosis and repair','desktop',120),
(4,'Printer Repair','Fix and service printers','other',90),
(5,'Premium Screen Replacement','Only OEM parts used','smartphone',90),
(5,'MacBook Repair','Specialized MacBook diagnosis and repair','laptop',240),
(5,'iPad Repair','All iPad models','tablet',120),
(5,'Camera Module Replacement','Front and rear camera replacement','smartphone',90),
(5,'Speaker/Mic Repair','Audio component repairs','smartphone',60);
