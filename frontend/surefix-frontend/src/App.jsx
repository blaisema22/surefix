import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';
import DashboardSwitcher from './components/layout/DashboardSwitcher';
import ShopLayout from './components/layout/ShopLayout';

// Page Components
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/customer/ForgotPassword';
import ResetPassword from './pages/customer/ResetPassword';
import FindRepair from './pages/customer/FindRepair';
import ManageDevices from './pages/customer/ManageDevices';
import AppointmentsPage from './pages/customer/AppointmentsPage';
import BookRepair from './pages/customer/BookRepair';
import BookingPage from './pages/customer/BookingPage';
import CustomerProfile from './pages/customer/Profile';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

// Shop Pages
import ShopAppointments from './pages/shop/ShopAppointments';
import ShopCustomers from './pages/shop/Customers';
import CustomerDetail from './pages/shop/CustomerDetail';
import ManageServices from './pages/shop/ManageServices';
import ShopDashboard from './pages/shop/Dashboard';
import ShopProfile from './pages/shop/ShopProfile';

// Shared
import NotificationListener from './components/shared/NotificationListener';

// Admin Pages
import AdminUsers from './pages/admin/Users';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLayout from './components/layout/AdminLayout';
import AdminCentres from './pages/admin/Centres';

// Auth
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import StaticPage from './pages/StaticPage';

const Root = () => (
  <AuthProvider>
    <SocketProvider>
      <NotificationProvider>
        <ToastProvider>
          <NotificationListener />
          <Outlet />
        </ToastProvider>
      </NotificationProvider>
    </SocketProvider>
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // Landing Page
      { path: "/", element: <LandingPage /> },

      // Auth Routes
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
          { path: "/reset-password/:token", element: <ResetPassword /> },
        ]
      },

      // Public "Find Repair" Routes (Landing Page Style)
      {
        element: <PublicLayout />,
        children: [
          { path: "/find-centres", element: <FindRepair /> },
          { path: "/support", element: <StaticPage /> },
          { path: "/privacy", element: <StaticPage /> },
          { path: "/terms", element: <StaticPage /> },
        ]
      },

      // Protected Dashboard Routes (Sidebar Style)
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "/dashboard", element: <DashboardSwitcher /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/settings", element: <CustomerProfile /> },
          { path: "/devices", element: <ManageDevices /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/book-repair/:centreId", element: <BookRepair /> },
          { path: "/booking", element: <BookingPage /> },
          { path: "/appointments", element: <AppointmentsPage /> },
          { path: "/find-repair", element: <FindRepair /> },

          // Shop Routes
          {
            element: <ShopLayout />,
            children: [
              { path: "/shop/dashboard", element: <ShopDashboard /> },
              { path: "/shop/services", element: <ManageServices /> },
              { path: "/shop/appointments", element: <ShopAppointments /> },
              { path: "/shop/customers", element: <ShopCustomers /> },
              { path: "/shop/customers/:id", element: <CustomerDetail /> },
              { path: "/shop/profile", element: <ShopProfile /> },
            ]
          },

          // Admin Routes
          {
            element: <AdminLayout />,
            children: [
              { path: "/admin/dashboard", element: <AdminDashboard /> },
              { path: "/admin/users", element: <AdminUsers /> },
              { path: "/admin/centres", element: <AdminCentres /> },
            ]
          },
        ],
      },

      // Catch-all
      { path: "*", element: <NotFoundPage /> },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;