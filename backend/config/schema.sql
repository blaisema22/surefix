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
  estimated_price_min     DECIMAL(10,2),
  estimated_price_max     DECIMAL(10,2),
  estimated_duration_minutes INT DEFAULT 60,
  display_order           INT DEFAULT 0 NOT NULL,
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
('Alice Mukamana', 'alice@example.com', '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe', '+250788000001', 'customer', TRUE);

INSERT INTO repair_centres (owner_id, name, address, district, latitude, longitude, phone, email, description, opening_time, closing_time, is_active, is_visible) VALUES
(2, 'TechFix Kigali',          'KG 15 Ave, Remera',   'Gasabo',     -1.9441, 30.0786, '+250788123456', 'techfix@surefix.com',  'Professional repair centre specializing in smartphones and laptops.',     '08:00:00','19:00:00', TRUE, TRUE),
(3, 'iRepair Centre',          'KN 3 Rd, Nyarugenge', 'Nyarugenge', -1.9536, 30.0606, '+250788234567', 'irepair@surefix.com',  'Apple and Android device specialists with certified technicians.',         '09:00:00','18:00:00', TRUE, TRUE),
(4, 'SmartFix Pro',            'KK 19 Ave, Kicukiro', 'Kicukiro',   -1.9730, 30.0927, '+250788345678', 'smartfix@surefix.com', 'Expert repairs for all brands. Quick turnaround guaranteed.',              '08:00:00','18:30:00', TRUE, TRUE),
(5, 'DigiRepair Hub',          'KG 7 Ave, Kimironko', 'Gasabo',     -1.9361, 30.0972, '+250788456789', 'digi@surefix.com',     'Budget-friendly repairs without compromising quality.',                    '08:30:00','18:00:00', TRUE, TRUE),
(6, 'Elite Electronics Repair','KN 45 St, CBD',        'Nyarugenge', -1.9444, 30.0583, '+250788567890', 'elite@surefix.com',    'Premium service for high-end devices. Walk-ins welcome.',                 '08:00:00','20:00:00', TRUE, TRUE);

INSERT INTO services (centre_id, service_name, description, device_category, estimated_price_min, estimated_price_max, estimated_duration_minutes) VALUES
(1,'Screen Replacement','Replace cracked or broken screens with OEM or quality aftermarket parts','smartphone',15000,45000,90),
(1,'Battery Replacement','Replace degraded batteries to restore full charge capacity','smartphone',8000,20000,60),
(1,'Charging Port Repair','Fix or replace faulty charging ports','smartphone',10000,25000,45),
(1,'Laptop Screen Repair','Replace damaged laptop screens','laptop',35000,80000,120),
(1,'Laptop Keyboard Replacement','Replace non-functional or physically damaged keyboards','laptop',20000,50000,90),
(1,'Data Recovery','Recover lost or deleted data from damaged devices','smartphone',20000,60000,180);
