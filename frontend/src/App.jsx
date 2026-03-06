import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import DevicesPage from './pages/customer/DevicesPage';
import SearchPage from './pages/customer/SearchPage';
import CentreDetailPage from './pages/repair/CentreDetailPage';
import BookingPage from './pages/customer/BookingPage';
import AppointmentsPage from './pages/customer/AppointmentsPage';
import ProfilePage from './pages/customer/ProfilePage';
import RepairerDashboard from './pages/repair/RepairerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Navbar from './components/common/Navbar';
import './index.css';

const Loader = () => <div className="full-loader"><div className="spinner" /></div>;

const RoleHome = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'repairer') return <Navigate to="/repairer" replace />;
  return <Navigate to="/dashboard" replace />;
};

const Protected = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <RoleHome />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/centres/:id" element={<CentreDetailPage />} />
        <Route path="/dashboard" element={<Protected role="customer"><CustomerDashboard /></Protected>} />
        <Route path="/devices" element={<Protected role="customer"><DevicesPage /></Protected>} />
        <Route path="/book/:centreId" element={<Protected role="customer"><BookingPage /></Protected>} />
        <Route path="/appointments" element={<Protected role="customer"><AppointmentsPage /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/repairer" element={<Protected role="repairer"><RepairerDashboard /></Protected>} />
        <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background: '#1a1a2e', color: '#fff', border: '1px solid #e94560' },
          success: { iconTheme: { primary: '#4ade80', secondary: '#1a1a2e' } },
          error: { iconTheme: { primary: '#e94560', secondary: '#fff' } },
        }} />
      </AuthProvider>
    </Router>
  );
}
