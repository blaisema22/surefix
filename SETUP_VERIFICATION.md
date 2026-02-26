# Setup Verification Checklist

Use this checklist to verify that your frontend-backend integration is properly set up.

## ✅ Prerequisites

- [ ] Node.js and npm installed
- [ ] MySQL database running
- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] Frontend dependencies installed (`npm install` in Frontend folder)

## ✅ Backend Setup

### Files & Structure
- [ ] `backend/surefix-backend/package.json` exists
- [ ] `backend/surefix-backend/src/server.js` exists
- [ ] `backend/surefix-backend/.env` file configured with:
  - [ ] `PORT=5000`
  - [ ] `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` configured
  - [ ] `NODE_ENV=development`
  - [ ] `JWT_SECRET` set

### Routes
- [ ] `src/routes/auth.routes.js` - Authentication
- [ ] `src/routes/shops.routes.js` - Shop operations
- [ ] `src/routes/devices.routes.js` - Device management
- [ ] `src/routes/services.routes.js` - Services
- [ ] `src/routes/appointments.routes.js` - Appointments

### Configuration
- [ ] CORS enabled for `http://localhost:3000` in `src/server.js`
- [ ] Express JSON middleware configured
- [ ] Database connection pool initialized in `src/config/db.js`

### Server Running
```bash
# Terminal 1
cd backend/surefix-backend
npm run dev
# Should output: Server running on http://localhost:5000
```
- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] Health check responds: `GET http://localhost:5000/health`

## ✅ Frontend Setup

### Files Created ✨
- [ ] `Frontend/.env.local` exists with API URL
- [ ] `Frontend/src/utils/api.js` exists
- [ ] `Frontend/src/hooks/` folder exists with:
  - [ ] `useAuth.js`
  - [ ] `useShops.js`
  - [ ] `useDevices.js`
  - [ ] `useAppointments.js`
  - [ ] `useServices.js`
  - [ ] `index.js`

### Files Updated ✨
- [ ] `Frontend/src/pages/auth/LoginPage.jsx` uses `useAuth` hook
- [ ] `Frontend/src/pages/customer/CustomerDashboard.jsx` uses hooks
- [ ] `Frontend/src/App.jsx` passes `currentUser` to components

### Dependencies
- [ ] `react` version 18.2.0+
- [ ] `react-dom` version 18.2.0+
- [ ] No TypeScript errors in code

### Frontend Running
```bash
# Terminal 2
cd Frontend
npm start
# Should open http://localhost:3000 in browser
```
- [ ] Frontend starts without errors
- [ ] React app loads in browser
- [ ] No console errors about API

## ✅ Environment Configuration

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=surefix
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```
- [ ] All variables set
- [ ] No quotes around values (unless needed)
- [ ] No spaces around `=`

### Frontend `.env.local`
```env
REACT_APP_API_URL=http://localhost:5000/api
```
- [ ] File exists at `Frontend/.env.local`
- [ ] Correct API URL set
- [ ] Port matches backend port (5000)

## ✅ API Connectivity

### Test Authentication
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
- [ ] Returns token and user data
- [ ] No CORS errors

### Test Public Endpoint
```bash
# Test shops endpoint (should be public)
curl http://localhost:5000/api/shops
```
- [ ] Returns list of shops
- [ ] No authentication errors

### Test Protected Endpoint
```bash
# Test authenticated endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/devices
```
- [ ] Returns user's devices
- [ ] Works with valid token
- [ ] Returns 401 without token

## ✅ Frontend-Backend Communication

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action in the app
4. Check that API calls appear:
   - [ ] Requests show in Network tab
   - [ ] Status code is 200 (or appropriate code)
   - [ ] Response shows JSON data
   - [ ] Authorization header present

### Check localStorage
1. Open DevTools (F12)
2. Go to Application → localStorage
3. Look for:
   - [ ] `authToken` exists after login
   - [ ] Token is valid JWT format
   - [ ] Token clearing on logout

## ✅ Component Testing

### Test Login
1. Go to frontend app
2. Click "Sign In" / "Login"
3. Enter credentials
4. Check:
   - [ ] No CORS errors in console
   - [ ] Login request appears in Network tab
   - [ ] Token stored in localStorage
   - [ ] Redirects to dashboard on success
   - [ ] Shows error message on failure

### Test Dashboard
1. After login, view customer dashboard
2. Check:
   - [ ] Appointments load from API
   - [ ] Devices count displayed
   - [ ] Statistics show real data
   - [ ] Loading states visible while fetching

### Test Data Fetching
1. View any page that fetches data
2. Open Network tab
3. Check:
   - [ ] API requests made
   - [ ] Data correctly displayed
   - [ ] Error handling works
   - [ ] Loading states visible

## ✅ Error Handling

### Test Network Error
1. Disconnect internet / stop backend
2. Try to login
3. Check:
   - [ ] Error message displayed
   - [ ] No white screen / crash
   - [ ] Console shows error details

### Test Invalid Token
1. Manually modify localStorage token
2. Try to access protected page
3. Check:
   - [ ] 401 error handled
   - [ ] Redirected to login
   - [ ] Token cleared from storage

### Test Validation Error
1. Submit form with invalid data
2. Check:
   - [ ] Error message displayed
   - [ ] Specific field error mentioned
   - [ ] Form not cleared on error

## ✅ Database

### Tables Created
```bash
# Check if tables exist in MySQL
mysql -h localhost -u root -p surefix
SHOW TABLES;
```
- [ ] `users` table exists
- [ ] `devices` table exists
- [ ] `services` table exists
- [ ] `appointments` table exists
- [ ] `shops` table exists

### Sample Data
- [ ] At least one shop in database
- [ ] At least one service in database
- [ ] Database not empty

## ✅ Performance

### Startup Time
- [ ] Backend starts in < 5 seconds
- [ ] Frontend loads in < 10 seconds
- [ ] No slow network warnings

### API Response Time
- [ ] Login response < 2 seconds
- [ ] List endpoints < 1 second
- [ ] Single item endpoints < 500ms

### Memory Usage
- [ ] No memory leaks visible
- [ ] Frontend stays responsive
- [ ] Backend handles multiple requests

## ✅ Security

### Token Management
- [ ] Token stored securely (localStorage)
- [ ] Token sent with Authorization header
- [ ] Token not logged to console
- [ ] Token cleared on logout

### Password Handling
- [ ] Passwords not logged
- [ ] Backend hashes passwords (bcryptjs)
- [ ] No plain passwords in requests

### CORS
- [ ] CORS errors resolved
- [ ] Credentials handled properly
- [ ] Only frontend origin allowed

## ✅ Debugging Setup

### Browser DevTools
- [ ] Console shows no errors
- [ ] Network tab shows API requests
- [ ] localStorage shows token after login

### Backend Logs
- [ ] Console shows request logs
- [ ] Errors logged with stack traces
- [ ] Database queries logged (if enabled)

### VS Code Extensions (recommended)
- [ ] REST Client (to test APIs)
- [ ] Prettier (code formatting)
- [ ] ES7+ React/Redux/React-Native snippets

## ✅ Documentation Review

- [ ] Read `API_INTEGRATION_GUIDE.md`
- [ ] Read `QUICK_START.md`
- [ ] Understand `COMPONENT_UPDATE_TEMPLATE.md`
- [ ] Know available hooks and methods

## ✅ First Component Update

Complete updating at least one additional component:
- [ ] Choose a component to update
- [ ] Import appropriate hook
- [ ] Replace mock data with API call
- [ ] Test component works
- [ ] Verify data loads correctly

## 🔧 Troubleshooting

If something doesn't work:

1. **Backend not starting?**
   - [ ] Check `.env` file
   - [ ] Verify MySQL is running
   - [ ] Check database credentials
   - [ ] Look for port conflicts (5000)
   - [ ] Check Node version (12+)

2. **Frontend not starting?**
   - [ ] Check `.env.local` exists
   - [ ] Verify API URL correct
   - [ ] Check for port conflicts (3000)
   - [ ] Clear npm cache: `npm cache clean --force`

3. **CORS errors?**
   - [ ] Restart backend
   - [ ] Check `CLIENT_URL` in backend `.env`
   - [ ] Verify CORS middleware in `server.js`
   - [ ] Check frontend URL matches

4. **Token not working?**
   - [ ] Verify token stored in localStorage
   - [ ] Check Authorization header format
   - [ ] Try logging out and logging in again
   - [ ] Check token not corrupted

5. **Data not loading?**
   - [ ] Open Network tab in DevTools
   - [ ] Check API request/response
   - [ ] Look at console errors
   - [ ] Verify backend is running
   - [ ] Check database has data

## 📋 Final Verification

Run this checklist before considering setup complete:

```
[ ] Backend running on http://localhost:5000
[ ] Frontend running on http://localhost:3000
[ ] Login works and token stored
[ ] At least one page fetches real API data
[ ] Loading and error states work
[ ] No console errors or warnings
[ ] Network tab shows API requests
[ ] Database has sample data
[ ] Logout clears token
[ ] Re-login works after logout
```

---

**Once all checkboxes are ✅, your integration is complete!**

Need help? Check the troubleshooting section above or review the integration guide.
