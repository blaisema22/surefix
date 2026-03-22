# 🔧 SureFix — Electronic Repair Appointment System

**Team KBM** · Manishimwe Blaise · Keza Kevine · Nikuzwe Marie Mercie

A full-stack web platform that allows customers in Rwanda to book electronic repair appointments online — no phone calls, no waiting.

---

## 🧩 Updated Problem Statement (MVP alignment)

We are solving inefficiency in electronic device repair booking by delivering:
- user registration and profile creation
- device registration (smartphone, tablet, laptop, desktop)
- location-based search and map discovery of nearby repair centres
- service catalog with clear descriptions, pricing estimates, and repair time
- real-time appointment slot availability and booking
- email confirmations and status update notifications
- appointment dashboard with view/cancel/modify

No payments are processed in the system: customers and repair centres handle payment offline at the point of service.

---

## 🏗️ Project Structure

```
surefix/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   ├── db.js             # MySQL connection pool
│   │   └── schema.sql        # Database schema + seed data
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Register, login, verify email, profile
│   │   ├── devices.js        # CRUD for user devices
│   │   ├── centres.js        # Repair centres, search, availability
│   │   ├── appointments.js   # Book, view, cancel appointments
│   │   └── services.js       # Repair services listing
│   ├── utils/
│   │   └── email.js          # Nodemailer email templates
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example          # Environment variables template
│
└── frontend/                 # React.js SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── utils/
    │   │   └── axios.js          # Axios API client and interceptors
    │   ├── components/
    │   │   └── common/
    │   │       └── Navbar.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── VerifyEmailPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── DevicesPage.jsx
    │   │   ├── SearchPage.jsx
    │   │   ├── CentreDetailPage.jsx
    │   │   ├── BookingPage.jsx       # 4-step booking wizard
    │   │   ├── AppointmentsPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── App.jsx                   # Routes + layout
    │   ├── index.js
    │   └── index.css                 # Global dark theme styles
    ├── package.json
    └── .env.example
```

---

## ⚙️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Styling | Custom CSS (dark theme, CSS variables) |
| Security | Helmet, CORS, express-rate-limit |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8+
- npm

### 1. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run schema
SOURCE /path/to/surefix/backend/config/schema.sql;
```

This creates the `surefix_db` database with all tables and 5 sample repair centres with services.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env with your MySQL credentials and email settings

# Start development server
npm run dev
# API runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Add your Google Maps API key if needed

# Start React app
npm start
# App runs on http://localhost:3000
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/verify-email?token=` | Verify email | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

### Devices
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/devices` | List user's devices | Yes |
| POST | `/api/devices` | Add device | Yes |
| PUT | `/api/devices/:id` | Update device | Yes |
| DELETE | `/api/devices/:id` | Delete device | Yes |

### Repair Centres
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/centres` | List all / search | No |
| GET | `/api/centres?search=` | Search by name/district | No |
| GET | `/api/centres?lat=&lng=&radius=` | Location-based search | No |
| GET | `/api/centres/:id` | Centre + services | No |
| GET | `/api/centres/:id/availability?date=` | Available time slots | No |

### Appointments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/appointments` | User's appointments | Yes |
| GET | `/api/appointments/:id` | Single appointment | Yes |
| POST | `/api/appointments` | Book appointment | Yes |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment | Yes |
| POST | `/api/appointments/:id/rate` | Rate a completed appointment | Yes |

### Services
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/services` | All services | No |
| GET | `/api/services?centre_id=&category=` | Filtered services | No |

---

## 🗄️ Database Schema

```
users ──────────────────── devices
  └── user_id (PK)           └── device_id (PK)
  └── name                   └── user_id (FK)
  └── email (unique)         └── brand, model
  └── password_hash          └── device_type
  └── phone                  └── issue_description
  └── is_verified
  └── role (customer/admin)

repair_centres ─────────── services
  └── centre_id (PK)         └── service_id (PK)
  └── name, address          └── centre_id (FK)
  └── latitude, longitude    └── service_name
  └── opening/closing time   └── device_category
  └── is_active              └── estimated_price_min/max

appointments (links all together)
  └── appointment_id (PK)
  └── user_id (FK)
  └── centre_id (FK)
  └── device_id (FK)
  └── service_id (FK)
  └── appointment_date, appointment_time
  └── status: pending|confirmed|in_progress|completed|cancelled
  └── booking_reference (unique, e.g. SFAB12CD34)

notifications
  └── notification_id (PK)
  └── user_id (FK)
  └── title
  └── message
  └── is_read (boolean)
  └── created_at
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens expire in **7 days**
- Rate limiting: **200 req/15min** globally, **10 req/15min** on auth routes
- CORS restricted to frontend URL
- Helmet sets secure HTTP headers
- SQL injection prevented via parameterized queries
- Input validation with express-validator

---

## 📧 Email Notifications

Triggered automatically on:
- ✅ **Registration** — Account verification email with link
- ✅ **Booking** — Full appointment confirmation with reference number
- ✅ **Cancellation** — Cancellation confirmation email

Emails are sent via Nodemailer (non-blocking, won't fail the API response).

---

## 💡 Features Implemented

### Customer (Frontend)
- [x] Register & Login with JWT auth
- [x] Email verification
- [x] Register and manage multiple devices
- [x] Search repair centres by keyword or GPS location
- [x] View centre details, services, and pricing
- [x] View centre on embedded Google Map
- [x] 4-step booking wizard (service → device → date/time → confirm)
- [x] Real-time slot availability check
- [x] View all appointments (filter by status)
- [x] Cancel upcoming appointments with confirmation
- [x] Automatic confirmation email on book/cancel
- [x] Profile management
- [x] Fully responsive dark-themed UI

### Backend
- [x] RESTful API with proper status codes
- [x] Location-based search (Haversine formula)
- [x] Slot conflict detection
- [x] Past date validation
- [x] Device ownership verification
- [x] Service-to-centre validation
- [x] Booking reference generation (e.g. SFAB12CD34)

### Out of Scope (by design)
- ❌ Payment processing (pay at centre)
- ❌ SMS notifications
- ❌ Mobile app
- ❌ Admin dashboard

---

## 👥 Team KBM

| Member | Role |
|--------|------|
| Manishimwe Blaise | Team Leader, Backend |
| Keza Kevine | Frontend, UI/UX |
| Nikuzwe Marie Mercie | Database, Integration |
