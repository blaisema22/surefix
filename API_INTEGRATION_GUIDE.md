# SureFix Frontend-Backend API Integration Guide

## Overview

Your SureFix application now has a complete frontend-backend integration! The frontend communicates with the Node.js/Express backend via REST APIs to fetch and manage data from the MySQL database.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (Port 3000)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Components (Pages, Views)                             │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │  Custom React Hooks (useAuth, useShops, etc)           │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │  Centralized API Client (src/utils/api.js)             │  │
│  │  - Handles HTTP requests                               │  │
│  │  - JWT token management                                │  │
│  │  - Error handling                                      │  │
│  └──────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │ HTTP Requests/JSON
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│              Node.js/Express Backend (Port 5000)               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  REST API Routes                                       │   │
│  │  /api/auth, /api/shops, /api/devices, etc             │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                         │
│  ┌───────────────────▼────────────────────────────────────┐   │
│  │  Controllers & Business Logic                          │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                         │
│  ┌───────────────────▼────────────────────────────────────┐   │
│  │  MySQL Database                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Created Files

### 1. **Environment Configuration**
- **File**: `.env.local`
- **Purpose**: Stores the API base URL
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. **Centralized API Client**
- **File**: `src/utils/api.js`
- **Purpose**: All HTTP requests go through this file
- **Features**:
  - Token management (get, set, clear)
  - Automatic Authorization header
  - Error handling
  - Grouped endpoints by feature

### 3. **Custom React Hooks**
Located in `src/hooks/`:

- **`useAuth.js`** - Authentication operations
  - `login(email, password)`
  - `register(userData)`
  - `getCurrentUser()`
  - `logout()`

- **`useShops.js`** - Shop-related operations
  - `list(filters)`
  - `get(id)`
  - `getSlots(id, date)`
  - `updateProfile(shopData)`

- **`useDevices.js`** - Device management
  - `list()`
  - `get(id)`
  - `create(deviceData)`
  - `update(id, deviceData)`
  - `deleteDevice(id)`

- **`useAppointments.js`** - Appointment operations
  - `list(filters)`
  - `get(id)`
  - `create(appointmentData)`
  - `updateStatus(id, statusUpdate)`

- **`useServices.js`** - Service management
  - `list(category)`
  - `get(id)`
  - `create(serviceData)`

## How to Use in Components

### Example 1: Using Login Hook
```jsx
import { useAuth } from '../../hooks/useAuth';

function LoginPage({ onLogin }) {
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      onLogin(response.user);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <button disabled={loading} onClick={handleLogin}>
      {loading ? 'Signing in...' : 'Sign In'}
    </button>
  );
}
```

### Example 2: Fetching Shops
```jsx
import { useShops } from '../../hooks/useShops';
import { useEffect } from 'react';

function FindRepairCenter() {
  const { data: shops, loading, error, list } = useShops();

  useEffect(() => {
    list(); // Fetch all shops on mount
  }, []);

  if (loading) return <div>Loading shops...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {shops?.map(shop => (
        <div key={shop.id}>{shop.companyName}</div>
      ))}
    </div>
  );
}
```

### Example 3: Creating an Appointment
```jsx
import { useAppointments } from '../../hooks/useAppointments';

function BookRepairFlow() {
  const { create, loading, error } = useAppointments();

  const handleBook = async () => {
    try {
      await create({
        shopId: selectedShop.id,
        deviceId: selectedDevice.id,
        serviceId: selectedService.id,
        appointmentDate: '2026-02-28',
        appointmentTime: '10:30:00',
      });
      // Navigate to appointments page
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <button disabled={loading} onClick={handleBook}>
      {loading ? 'Booking...' : 'Book Now'}
    </button>
  );
}
```

## API Endpoints

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user (requires token)
POST   /api/auth/logout       - Logout (requires token)
```

### Shops
```
GET    /api/shops             - List all shops
GET    /api/shops/:id         - Get shop details
GET    /api/shops/:id/slots   - Get available time slots
PUT    /api/shops/profile     - Update shop profile (shop only)
```

### Devices
```
GET    /api/devices           - List user's devices
GET    /api/devices/:id       - Get device details
POST   /api/devices           - Register new device
PUT    /api/devices/:id       - Update device
DELETE /api/devices/:id       - Delete device
```

### Services
```
GET    /api/services          - List all services
GET    /api/services/:id      - Get service details
POST   /api/services          - Create service
```

### Appointments
```
GET    /api/appointments      - List appointments
GET    /api/appointments/:id  - Get appointment details
POST   /api/appointments      - Book appointment
PATCH  /api/appointments/:id/status - Update appointment status
```

## Token Management

Tokens are automatically managed:
1. **After Login**: Token is stored in `localStorage` as `authToken`
2. **Before API Call**: Token is automatically added to `Authorization` header
3. **On 401 Error**: Token is cleared and user needs to re-login
4. **On Logout**: Token is cleared from localStorage

```javascript
// Manual token management if needed
import { getToken, setToken, clearToken } from '../utils/api';

const token = getToken();        // Get stored token
setToken('new-token');           // Store token
clearToken();                    // Remove token
```

## Error Handling

All hooks include error management:
```jsx
const { data, loading, error, list } = useShops();

useEffect(() => {
  list().catch(err => console.error(err));
}, []);

if (error) return <div>Error: {error}</div>;
```

## Updated Components

The following components have been updated to use the API:

1. **`LoginPage.jsx`** - Uses `useAuth` hook for login/register
2. **`CustomerDashboard.jsx`** - Uses `useAppointments` and `useDevices` hooks

## Next Steps: Updating Other Components

To update other components, follow this pattern:

1. **Import the appropriate hook**:
   ```jsx
   import { useShops } from '../../hooks/useShops';
   ```

2. **Use the hook in your component**:
   ```jsx
   const { data, loading, error, list } = useShops();
   ```

3. **Fetch data on mount**:
   ```jsx
   useEffect(() => {
     list(); // or get(id), create(), etc.
   }, []);
   ```

4. **Handle states and display data**:
   ```jsx
   if (loading) return <Skeleton />;
   if (error) return <ErrorMessage />;
   return <DataDisplay data={data} />;
   ```

## Components to Update

Here's a checklist of components that still need API integration:

- [ ] `FindRepairCenter.jsx` - Use `useShops` hook
- [ ] `BookRepairFlow.jsx` - Use `useAppointments` and `useShops` hooks
- [ ] `MyDevices.jsx` - Use `useDevices` hook
- [ ] `CustomerProfile.jsx` - Use profile endpoints
- [ ] `ShopDashboard.jsx` - Use `useAppointments` for shop
- [ ] `CustomersPage.jsx` - Use customer list endpoint
- [ ] `ShopProfile.jsx` - Use profile endpoints
- [ ] `AppointmentHistory.jsx` - Use `useAppointments` hook
- [ ] `ShopLocations.jsx` - Use `useShops` hook

## Backend Status

Your backend at `http://localhost:5000` should have:
- ✅ CORS enabled for `http://localhost:3000`
- ✅ JWT authentication middleware
- ✅ All route handlers implemented
- ✅ MySQL database connected

**To start the backend**:
```bash
cd backend/surefix-backend
npm install
npm run dev   # For development with auto-reload
# or
npm start     # For production
```

**To start the frontend**:
```bash
cd Frontend
npm install
npm start
# Frontend will open at http://localhost:3000
```

## Testing the Integration

1. **Start Backend**: `npm run dev` in `backend/surefix-backend/`
2. **Start Frontend**: `npm start` in `Frontend/`
3. **Test Login**: Try logging in with credentials
4. **Check Network Tab**: Open DevTools → Network tab to see API calls
5. **Test CRUD Operations**: Create/read/update/delete operations

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS Error | Make sure backend is running on port 5000 |
| 401 Unauthorized | Token expired or not sent. Check localStorage |
| Token not stored | Check browser's localStorage permissions |
| API returns 404 | Verify endpoint path and backend route setup |
| Blank data | Check network requests in DevTools |

## Environment Variables

The frontend uses these environment variables:
- `REACT_APP_API_URL` - Backend API base URL (default: http://localhost:5000/api)

You can override in `.env.local` or set before running:
```bash
REACT_APP_API_URL=https://api.example.com npm start
```

## Security Best Practices

1. ✅ **HTTPS in Production**: Use HTTPS URLs instead of HTTP
2. ✅ **Token Expiration**: Implement JWT expiration on backend
3. ✅ **Password Hashing**: Backend uses bcryptjs for passwords
4. ✅ **Error Messages**: Don't expose sensitive info in errors
5. ✅ **Input Validation**: Backend validates all user inputs

## API Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

Or on error:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Need Help?

- Check the network tab in DevTools to see API requests/responses
- Look at console errors for error messages
- Verify backend server is running
- Check backend logs for server-side errors
- Ensure `.env.local` is configured correctly

---

**Happy coding! Your SureFix app is now connected!** 🚀
