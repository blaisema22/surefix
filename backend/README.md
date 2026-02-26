# SureFix Backend — REST API

Node.js + Express + MySQL backend for the SureFix electronic repair platform.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Create the database & seed data
mysql -u root -p < sql/schema.sql

# 4. Start the API server
npm run dev        # development (nodemon)
npm start          # production
```

API runs at **http://localhost:5000**

---

## 🗂️ Project Structure

```
surefix-backend/
├── sql/
│   └── schema.sql               ← Database schema + seed data
├── src/
│   ├── server.js                ← Express app entry point
│   ├── config/
│   │   └── db.js                ← MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js              ← JWT authenticate + requireRole
│   │   └── errorHandler.js      ← Global error & 404 handler
│   ├── utils/
│   │   └── helpers.js           ← Token generation, response helpers
│   ├── controllers/
│   │   ├── authController.js    ← register, login, me, logout
│   │   ├── shopController.js    ← list/get shops, slots, update profile
│   │   ├── deviceController.js  ← CRUD for customer devices
│   │   ├── appointmentController.js ← Book, list, update status, cancel
│   │   ├── serviceController.js ← List repair services
│   │   ├── reviewController.js  ← Submit & list reviews
│   │   ├── notificationController.js ← List & mark notifications
│   │   ├── profileController.js ← Update profiles, change password
│   │   └── dashboardController.js   ← Stats for customer & shop
│   └── routes/
│       ├── auth.routes.js
│       ├── shop.routes.js
│       ├── device.routes.js
│       ├── appointment.routes.js
│       ├── service.routes.js
│       ├── review.routes.js
│       ├── notification.routes.js
│       ├── profile.routes.js
│       └── dashboard.routes.js
├── .env.example
└── package.json
```

---

## 🔐 Authentication

All protected routes require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Get the token from `POST /api/auth/login`.

**Demo credentials:**

| Role      | Email                    | Password |
|-----------|--------------------------|----------|
| Customer  | blaise@example.com       | demo123  |
| Repairer  | techfix@example.com      | demo123  |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description                   |
|--------|-----------------------|---------|-------------------------------|
| POST   | /api/auth/register    | Public  | Register customer or shop      |
| POST   | /api/auth/login       | Public  | Login → returns JWT token      |
| GET    | /api/auth/me          | Private | Get current user profile       |
| POST   | /api/auth/logout      | Private | Logout (client drops token)    |

### Shops
| Method | Endpoint                  | Access        | Description                        |
|--------|---------------------------|---------------|------------------------------------|
| GET    | /api/shops                | Public        | List all shops (filterable)        |
| GET    | /api/shops/:id            | Public        | Get single shop details            |
| GET    | /api/shops/:id/slots      | Public        | Available slots for a date         |
| PUT    | /api/shops/profile        | Shop only     | Update own shop profile            |

### Devices
| Method | Endpoint          | Access        | Description                        |
|--------|-------------------|---------------|------------------------------------|
| GET    | /api/devices      | Customer      | List own registered devices        |
| GET    | /api/devices/:id  | Customer      | Get a single device                |
| POST   | /api/devices      | Customer      | Register new device                |
| PUT    | /api/devices/:id  | Customer      | Update device info                 |
| DELETE | /api/devices/:id  | Customer      | Delete device                      |

### Appointments
| Method | Endpoint                          | Access    | Description                         |
|--------|-----------------------------------|-----------|-------------------------------------|
| GET    | /api/appointments                 | Private   | List own appointments               |
| GET    | /api/appointments/:id             | Private   | Get single appointment              |
| POST   | /api/appointments                 | Customer  | Book a repair appointment           |
| PATCH  | /api/appointments/:id/status      | Shop      | Update status + technician note     |
| DELETE | /api/appointments/:id             | Customer  | Cancel an appointment               |

### Services
| Method | Endpoint          | Access  | Description                   |
|--------|-------------------|---------|-------------------------------|
| GET    | /api/services     | Public  | List all repair services       |
| GET    | /api/services/:id | Public  | Get single service             |
| POST   | /api/services     | Private | Create new service             |

### Reviews
| Method | Endpoint                      | Access   | Description                     |
|--------|-------------------------------|----------|---------------------------------|
| GET    | /api/reviews/shop/:shopId     | Public   | Get reviews for a shop          |
| POST   | /api/reviews                  | Customer | Submit review for completed apt |

### Notifications
| Method | Endpoint                          | Access  | Description              |
|--------|-----------------------------------|---------|--------------------------|
| GET    | /api/notifications                | Private | Get own notifications    |
| PATCH  | /api/notifications/:id/read       | Private | Mark one as read         |
| PATCH  | /api/notifications/read-all       | Private | Mark all as read         |

### Profile
| Method | Endpoint                  | Access   | Description                    |
|--------|---------------------------|----------|--------------------------------|
| PUT    | /api/profile/customer     | Customer | Update customer profile        |
| PUT    | /api/profile/shop         | Shop     | Update shop profile            |
| PUT    | /api/profile/password     | Private  | Change password                |
| GET    | /api/profile/customers    | Shop     | List shop's customers          |

### Dashboard
| Method | Endpoint                  | Access   | Description                   |
|--------|---------------------------|----------|-------------------------------|
| GET    | /api/dashboard/customer   | Customer | Stats + active appointments   |
| GET    | /api/dashboard/shop       | Shop     | Stats + today's schedule      |

---

## 🗄️ Database Tables

| Table                  | Description                                   |
|------------------------|-----------------------------------------------|
| `users`                | Core auth table — all roles                   |
| `customer_profiles`    | Extended info for customers                   |
| `shop_profiles`        | Extended info for repair shops                |
| `shop_specializations` | Device types each shop handles (many-to-many) |
| `shop_time_slots`      | Available booking slots per shop              |
| `services`             | Global repair service catalog                 |
| `devices`              | Customer-registered devices                   |
| `appointments`         | Core booking record                           |
| `reviews`              | Post-repair customer reviews                  |
| `notifications`        | In-app notification log                       |
| `refresh_tokens`       | JWT refresh token store                       |

---

## 🔗 Connect React Frontend

In your React project, replace the mock `api()` calls in `src/data/db.js` with real fetch calls:

```js
const BASE_URL = 'http://localhost:5000/api';

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};
```
