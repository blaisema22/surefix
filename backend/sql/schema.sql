-- ============================================================
--  SUREFIX DATABASE SCHEMA
--  MySQL 8.0+
--  Run: mysql -u root -p < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS surefix_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE surefix_db;

-- ──────────────────────────────────────────────────────────────
--  TABLE: users
--  Stores both customers and repair shop owners (role-based)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)        NOT NULL DEFAULT (UUID()),
  role          ENUM('customer','shop') NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  phone         VARCHAR(30)     DEFAULT NULL,
  avatar        VARCHAR(10)     DEFAULT NULL,         -- initials e.g. "BM"
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: customer_profiles
--  Extended info for customers (role = 'customer')
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_profiles (
  id            CHAR(36)        NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36)        NOT NULL UNIQUE,
  first_name    VARCHAR(80)     NOT NULL,
  last_name     VARCHAR(80)     NOT NULL,
  location      VARCHAR(255)    DEFAULT NULL,
  member_since  DATE            NOT NULL DEFAULT (CURDATE()),

  -- Notification preferences
  pref_email        TINYINT(1)  NOT NULL DEFAULT 1,
  pref_sms          TINYINT(1)  NOT NULL DEFAULT 0,
  pref_marketing    TINYINT(1)  NOT NULL DEFAULT 1,

  PRIMARY KEY (id),
  CONSTRAINT fk_cp_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: shop_profiles
--  Extended info for repair shop owners (role = 'shop')
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_profiles (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id          CHAR(36)     NOT NULL UNIQUE,
  company_name     VARCHAR(150) NOT NULL,
  owner_name       VARCHAR(150) NOT NULL,
  address          VARCHAR(255) NOT NULL,
  tin_number       VARCHAR(50)  DEFAULT NULL,
  open_hours       VARCHAR(60)  DEFAULT '9:00 AM - 6:00 PM',
  specialization   VARCHAR(100) DEFAULT NULL,
  rating           DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  review_count     INT          NOT NULL DEFAULT 0,
  verified         TINYINT(1)   NOT NULL DEFAULT 0,
  status           ENUM('Open','Busy','Closed') NOT NULL DEFAULT 'Open',
  latitude         DECIMAL(10,7) DEFAULT NULL,
  longitude        DECIMAL(10,7) DEFAULT NULL,

  PRIMARY KEY (id),
  INDEX idx_sp_status (status),
  INDEX idx_sp_rating (rating),
  CONSTRAINT fk_sp_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: shop_specializations
--  Many-to-many: which device types a shop handles
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_specializations (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  shop_id     CHAR(36)     NOT NULL,
  device_type ENUM('Smartphone','Tablet','Laptop','Desktop','Printer','Console','Other') NOT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_shop_device (shop_id, device_type),
  CONSTRAINT fk_ss_shop FOREIGN KEY (shop_id)
    REFERENCES shop_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: shop_time_slots
--  Available appointment slots per shop, per day
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_time_slots (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  shop_id       CHAR(36)     NOT NULL,
  day_of_week   ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  slot_time     TIME         NOT NULL,               -- e.g. 09:00:00
  max_bookings  INT          NOT NULL DEFAULT 1,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,

  PRIMARY KEY (id),
  UNIQUE KEY uq_slot (shop_id, day_of_week, slot_time),
  CONSTRAINT fk_sts_shop FOREIGN KEY (shop_id)
    REFERENCES shop_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: services
--  Repair service catalog (global — not per shop)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  category      VARCHAR(80)  NOT NULL,
  name          VARCHAR(150) NOT NULL,
  duration_min  VARCHAR(50)  NOT NULL,               -- e.g. "2-4 hours"
  icon          VARCHAR(10)  DEFAULT '🔧',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_svc_category (category)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: devices
--  Customer's registered devices
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  customer_id     CHAR(36)     NOT NULL,              -- FK → users.id
  name            VARCHAR(150) NOT NULL,              -- display name
  device_type     ENUM('Smartphone','Tablet','Laptop','Desktop','Printer','Console','Other') NOT NULL,
  brand           VARCHAR(80)  NOT NULL,
  model           VARCHAR(100) NOT NULL,
  serial_number   VARCHAR(100) DEFAULT NULL,
  status          ENUM('healthy','needs_repair','in_repair','repaired') NOT NULL DEFAULT 'healthy',
  issue_desc      TEXT         DEFAULT NULL,
  added_at        DATE         NOT NULL DEFAULT (CURDATE()),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_dev_customer (customer_id),
  INDEX idx_dev_status   (status),
  CONSTRAINT fk_dev_customer FOREIGN KEY (customer_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: appointments
--  Core booking record linking customer → shop → device → service
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  customer_id       CHAR(36)      NOT NULL,
  shop_id           CHAR(36)      NOT NULL,           -- FK → shop_profiles.id
  device_id         CHAR(36)      NOT NULL,
  service_id        CHAR(36)      NOT NULL,
  appointment_date  DATE          NOT NULL,
  appointment_time  TIME          NOT NULL,
  status            ENUM('pending','confirmed','in_progress','completed','cancelled')
                                  NOT NULL DEFAULT 'pending',
  technician_note   TEXT          DEFAULT NULL,
  customer_note     TEXT          DEFAULT NULL,
  booking_ref       VARCHAR(20)   NOT NULL UNIQUE,    -- e.g. SF-12345
  cancelled_by      ENUM('customer','shop') DEFAULT NULL,
  cancelled_at      DATETIME      DEFAULT NULL,
  completed_at      DATETIME      DEFAULT NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_apt_customer   (customer_id),
  INDEX idx_apt_shop       (shop_id),
  INDEX idx_apt_date       (appointment_date),
  INDEX idx_apt_status     (status),
  INDEX idx_apt_booking_ref(booking_ref),
  CONSTRAINT fk_apt_customer  FOREIGN KEY (customer_id)
    REFERENCES users(id)      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_apt_shop      FOREIGN KEY (shop_id)
    REFERENCES shop_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_apt_device    FOREIGN KEY (device_id)
    REFERENCES devices(id)    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_apt_service   FOREIGN KEY (service_id)
    REFERENCES services(id)   ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: reviews
--  Customer reviews for repair shops, linked to completed appointments
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              CHAR(36)    NOT NULL DEFAULT (UUID()),
  appointment_id  CHAR(36)    NOT NULL UNIQUE,
  customer_id     CHAR(36)    NOT NULL,
  shop_id         CHAR(36)    NOT NULL,
  rating          TINYINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT        DEFAULT NULL,
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_rev_shop (shop_id),
  CONSTRAINT fk_rev_appointment FOREIGN KEY (appointment_id)
    REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rev_customer    FOREIGN KEY (customer_id)
    REFERENCES users(id)        ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rev_shop        FOREIGN KEY (shop_id)
    REFERENCES shop_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: notifications
--  In-app notification log per user
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  title       VARCHAR(150) NOT NULL,
  body        TEXT         NOT NULL,
  type        ENUM('appointment','status_update','reminder','system','promotion')
                           NOT NULL DEFAULT 'system',
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_notif_user   (user_id),
  INDEX idx_notif_unread (user_id, is_read),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
--  TABLE: refresh_tokens
--  Stores JWT refresh tokens for session management
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  DATETIME     NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_rt_user  (user_id),
  INDEX idx_rt_token (token(64)),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ============================================================
--  SEED DATA
-- ============================================================

-- Password hash for "demo123" using bcrypt (rounds=10)
-- Generated: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y

INSERT INTO users (id, role, email, password_hash, phone, avatar) VALUES
  ('user-cust-001', 'customer', 'blaise@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', '+250781234567', 'BM'),
  ('user-cust-002', 'customer', 'jean@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', '+250785556666', 'JP'),
  ('user-cust-003', 'customer', 'marie@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', '+250787778888', 'MN'),
  ('user-shop-001', 'shop',     'techfix@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', '+250780001234', 'TF'),
  ('user-shop-002', 'shop',     'digicare@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', '+250781112222', 'DC'),
  ('user-shop-003', 'shop',     'smartrepair@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', '+250783334444', 'SR');

INSERT INTO customer_profiles (user_id, first_name, last_name, location, member_since) VALUES
  ('user-cust-001', 'Blaise', 'Manishimwe', 'Kigali, Rwanda', '2026-02-01'),
  ('user-cust-002', 'Jean',   'Pierre',     'Kigali, Rwanda', '2026-01-10'),
  ('user-cust-003', 'Marie',  'Nzeyimana',  'Kigali, Rwanda', '2025-12-01');

INSERT INTO shop_profiles (id, user_id, company_name, owner_name, address, tin_number, open_hours, specialization, rating, review_count, verified, status, latitude, longitude) VALUES
  ('shop-001', 'user-shop-001', 'TechFix Pro Centre', 'Alice K.',    'KG 15 Ave, Kicukiro, Kigali', 'TIN-123456789', '9:00 AM - 7:00 PM', 'Mobile Devices', 4.8, 124, 1, 'Open', -1.9706, 30.1044),
  ('shop-002', 'user-shop-002', 'DigiCare Solutions',  'Bob M.',     'KN 5 Rd, Nyarugenge, Kigali', 'TIN-987654321', '8:00 AM - 6:00 PM', 'Laptops & PCs',  4.5,  89, 1, 'Open', -1.9441, 30.0619),
  ('shop-003', 'user-shop-003', 'SmartRepair Hub',     'Claire U.',  'KG 7 Rd, Gasabo, Kigali',     'TIN-456789123', '9:00 AM - 7:00 PM', 'Smartphones',    4.2,  56, 0, 'Busy', -1.9355, 30.0928);

INSERT INTO shop_specializations (shop_id, device_type) VALUES
  ('shop-001', 'Smartphone'), ('shop-001', 'Tablet'), ('shop-001', 'Laptop'),
  ('shop-002', 'Laptop'),     ('shop-002', 'Desktop'),('shop-002', 'Printer'),
  ('shop-003', 'Smartphone'), ('shop-003', 'Tablet');

INSERT INTO shop_time_slots (shop_id, day_of_week, slot_time) VALUES
  ('shop-001','Mon','09:00:00'),('shop-001','Mon','10:00:00'),('shop-001','Mon','14:00:00'),
  ('shop-001','Tue','09:00:00'),('shop-001','Tue','11:00:00'),('shop-001','Tue','15:00:00'),
  ('shop-001','Wed','10:00:00'),('shop-001','Wed','13:00:00'),
  ('shop-001','Thu','09:00:00'),('shop-001','Thu','10:30:00'),('shop-001','Thu','14:00:00'),
  ('shop-001','Fri','09:00:00'),('shop-001','Fri','11:00:00'),
  ('shop-002','Mon','09:00:00'),('shop-002','Mon','11:00:00'),('shop-002','Mon','14:00:00'),
  ('shop-002','Tue','09:00:00'),('shop-002','Tue','14:00:00'),
  ('shop-003','Mon','09:00:00'),('shop-003','Mon','11:00:00'),
  ('shop-003','Tue','10:00:00'),('shop-003','Tue','14:00:00');

INSERT INTO services (id, category, name, duration_min, icon) VALUES
  ('svc-001', 'Screen Repair',  'Screen Replacement',          '2-4 hours',   '📱'),
  ('svc-002', 'Battery',        'Battery Replacement',          '30-60 min',   '🔋'),
  ('svc-003', 'Water Damage',   'Water Damage Repair',          '24-48 hours', '💧'),
  ('svc-004', 'Software',       'Software Fix / Virus Removal', '1-3 hours',   '💻'),
  ('svc-005', 'Charging',       'Charging Port Repair',         '1-2 hours',   '⚡'),
  ('svc-006', 'Keyboard',       'Keyboard Replacement',         '2-3 hours',   '⌨️');

INSERT INTO devices (id, customer_id, name, device_type, brand, model, serial_number, status, issue_desc, added_at) VALUES
  ('dev-001', 'user-cust-001', 'Samsung Galaxy S22', 'Smartphone', 'Samsung', 'Galaxy S22',  'SG22-KGL-001', 'needs_repair', 'Screen cracked after fall, touch still works', '2026-02-01'),
  ('dev-002', 'user-cust-001', 'HP Laptop 15',       'Laptop',     'HP',      'Laptop 15s',  'HP15-KGL-002', 'healthy',      NULL,                                          '2026-01-15'),
  ('dev-003', 'user-cust-002', 'iPhone 13',          'Smartphone', 'Apple',   'iPhone 13',   'IP13-KGL-003', 'healthy',      NULL,                                          '2026-01-10'),
  ('dev-004', 'user-cust-003', 'Samsung Tab S7',     'Tablet',     'Samsung', 'Galaxy Tab S7','ST7-KGL-004', 'healthy',      NULL,                                          '2025-12-15');

INSERT INTO appointments (id, customer_id, shop_id, device_id, service_id, appointment_date, appointment_time, status, technician_note, booking_ref, created_at) VALUES
  ('apt-001', 'user-cust-001', 'shop-001', 'dev-001', 'svc-001', '2026-02-19', '10:30:00', 'in_progress', 'Device received. Screen sourced.',   'SF-10001', '2026-02-15 08:00:00'),
  ('apt-002', 'user-cust-001', 'shop-002', 'dev-002', 'svc-004', '2026-01-28', '14:00:00', 'completed',   'Virus removed. System restored.',    'SF-10002', '2026-01-25 10:00:00'),
  ('apt-003', 'user-cust-002', 'shop-001', 'dev-003', 'svc-002', '2026-02-20', '09:00:00', 'confirmed',   NULL,                                  'SF-10003', '2026-02-18 12:00:00'),
  ('apt-004', 'user-cust-003', 'shop-001', 'dev-004', 'svc-001', '2026-02-21', '11:00:00', 'pending',     NULL,                                  'SF-10004', '2026-02-19 09:00:00');
