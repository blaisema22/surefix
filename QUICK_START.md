# 🚀 Quick Start: Frontend-Backend Integration

## In 5 Minutes

### 1. **Start the Backend**
```bash
cd backend/surefix-backend
npm run dev
```
✅ Backend runs on `http://localhost:5000`

### 2. **Start the Frontend**
```bash
cd Frontend
npm start
```
✅ Frontend opens at `http://localhost:3000`

### 3. **Test It**
- Go to Login page
- Sign in with credentials
- Check browser DevTools → Network tab to see API calls
- Dashboard should display real data from backend

---

## What's New? 

### ✨ Created Files:

**Utilities**:
- `Frontend/.env.local` - API configuration
- `Frontend/src/utils/api.js` - Centralized API client

**Hooks** (in `Frontend/src/hooks/`):
- `useAuth.js` - Login, Register, Logout
- `useShops.js` - Shop operations
- `useDevices.js` - Device management  
- `useAppointments.js` - Appointment bookings
- `useServices.js` - Service listings
- `index.js` - Hook exports

**Documentation**:
- `API_INTEGRATION_GUIDE.md` - Complete guide
- `QUICK_START.md` - This file

### ⚡ Updated Components:
- `LoginPage.jsx` - Now connects to backend
- `CustomerDashboard.jsx` - Fetches real appointments & devices

---

## How to Use in Components

### Import a Hook
```jsx
import { useShops } from '../../hooks/useShops';
```

### Use in Component
```jsx
function MyComponent() {
  const { data, loading, error, list } = useShops();

  useEffect(() => {
    list(); // Fetch shops
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {data?.map(shop => <div key={shop.id}>{shop.companyName}</div>)}
    </div>
  );
}
```

---

## Available Hooks & Methods

### `useAuth`
```javascript
const { login, register, logout, loading, error } = useAuth();
await login(email, password);
await register(userData);
logout();
```

### `useShops`
```javascript
const { list, get, getSlots, updateProfile, loading, error } = useShops();
await list(filters);          // Get all shops
await get(shopId);            // Get one shop
await getSlots(shopId, date); // Get time slots
await updateProfile(data);    // Update shop profile
```

### `useDevices`
```javascript
const { list, get, create, update, deleteDevice, loading, error } = useDevices();
await list();                // Get all devices
await get(id);               // Get one device
await create(deviceData);    // Add new device
await update(id, data);      // Edit device
await deleteDevice(id);      // Remove device
```

### `useAppointments`
```javascript
const { list, get, create, updateStatus, loading, error } = useAppointments();
await list(filters);            // Get appointments
await get(id);                  // Get one appointment
await create(appointmentData);  // Book appointment
await updateStatus(id, data);   // Change status
```

### `useServices`
```javascript
const { list, get, create, loading, error } = useServices();
await list(category);       // Get services
await get(id);              // Get one service
await create(serviceData);  // Add service
```

---

## API Endpoints Available

```
🔐 Auth
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me
  POST   /api/auth/logout

🏪 Shops
  GET    /api/shops
  GET    /api/shops/:id
  GET    /api/shops/:id/slots?date=YYYY-MM-DD
  PUT    /api/shops/profile

📱 Devices
  GET    /api/devices
  GET    /api/devices/:id
  POST   /api/devices
  PUT    /api/devices/:id
  DELETE /api/devices/:id

⚙️ Services
  GET    /api/services
  GET    /api/services/:id
  POST   /api/services

📅 Appointments
  GET    /api/appointments
  GET    /api/appointments/:id
  POST   /api/appointments
  PATCH  /api/appointments/:id/status
```

---

## Token Handling

↙️ **Automatic**: Token is stored after login and sent with every request

✋ **Manual** (if needed):
```javascript
import { getToken, setToken, clearToken } from '../utils/api';

getToken();    // Get token
setToken(token);  // Store token
clearToken();  // Remove token
```

---

## Next Steps: Update More Components

Each component should follow this pattern:

1. Import the hook → 2. Use in component → 3. Handle loading/error → 4. Display data

**Components to update**:
- [ ] FindRepairCenter.jsx
- [ ] BookRepairFlow.jsx
- [ ] MyDevices.jsx
- [ ] CustomerProfile.jsx
- [ ] ShopDashboard.jsx
- [ ] CustomersPage.jsx
- [ ] ShopProfile.jsx
- [ ] AppointmentHistory.jsx
- [ ] ShopLocations.jsx

---

## Troubleshooting

### ❌ "CORS Error"
→ Make sure backend is running on port 5000

### ❌ "Cannot find api.js"
→ Check file path: `Frontend/src/utils/api.js`

### ❌ "No token in request"
→ Token is cleared after login, re-login in browser

### ❌ "Data is undefined"
→ Check network tab in DevTools to see API response

### ❌ "404 Not Found"
→ Backend route not implemented, check backend routes

---

## File Structure

```
Frontend/
├── .env.local                     ← API URL configuration
├── src/
│   ├── utils/
│   │   └── api.js                ← Centralized API client ✨
│   ├── hooks/                    ← Custom React hooks ✨
│   │   ├── index.js
│   │   ├── useAuth.js
│   │   ├── useShops.js
│   │   ├── useDevices.js
│   │   ├── useAppointments.js
│   │   └── useServices.js
│   └── pages/
│       ├── auth/
│       │   └── LoginPage.jsx     ← Updated ✨
│       ├── customer/
│       │   └── CustomerDashboard.jsx ← Updated ✨
│       └── ...

backend/surefix-backend/
├── src/
│   ├── server.js                 ← API server
│   ├── routes/                   ← API endpoints
│   ├── controllers/              ← Business logic
│   ├── config/
│   │   └── db.js                 ← Database connection
│   └── middleware/
│       └── auth.js               ← JWT authentication
```

---

## Important: Run Both Servers

**Backend** (Terminal 1):
```bash
cd backend/surefix-backend
npm run dev
# Server running on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd Frontend
npm start
# App running on http://localhost:3000
```

---

## Pro Tips 💡

1. **Check Network Tab**: DevTools → Network → see all API requests
2. **Check Console**: DevTools → Console → see error messages
3. **Check Storage**: DevTools → Application → localStorage → see token
4. **Add Loading States**: Hooks provide `loading` bool for UI feedback
5. **Handle Errors**: All hooks provide `error` string for error messages

---

## Environment Setup

Create `Frontend/.env.local`: (Already done ✅)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

**You're all set! Start building! 🎉**

For more details, see: [`API_INTEGRATION_GUIDE.md`](./API_INTEGRATION_GUIDE.md)
