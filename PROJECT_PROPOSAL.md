# SureFix ERAA Project Proposal (Updated)

## 1. Problem Statement

Customers and repair centres in Rwanda face friction in electronic device repair booking:
- manual phone/walk-in bookings cause conflicts and no-shows
- no real-time availability data, leading to wasted trips
- opaque service listings, pricing, and repair duration estimates
- poor confirmation and status communication
- inefficient scheduling and resource allocation

### Affected users
- Primary: consumer device owners (smartphones, tablets, laptops, desktops)
- Secondary: repair centre managers and technicians

### Frequency
Daily, with observed high no-show rates and wasted admin time.

## 2. MVP Objective

Deliver a functional web platform where customers can:
- register/login (JWT auth, verified email)
- add and manage devices with issue descriptions
- find local repair centres by location/search
- view service catalog and estimate costs/time
- pick an available date/time slot and book appointment
- receive confirmation/cancellation emails
- manage upcoming appointments

## 3. Core Features

1. User Registration & Authentication
2. Device Registration and Management
3. Repair Centre Search + Map
4. Service Catalog Display
5. Appointment Booking w/ availability check
6. Email Notifications
7. Appointment Dashboard

## 4. Out of Scope
- Payment gateway integration (pay at centre)
- SMS notifications
- real-time in-repair tracking

## 5. Technical Architecture
- Frontend: React.js, React Router, Axios, Google Maps (optional)
- Backend: Node.js, Express, MySQL
- Auth: JWT + bcrypt
- Email: Nodemailer

## 6. Non-payment mandate
The current implementation explicitly avoids any customer or repair centre payment processing in the codebase. Reservation stays at booking and confirmation only.
