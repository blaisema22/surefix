import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Dashboard Components
import AdminDashboard from '../../pages/shop/AdminDashboard';
import ShopAppointments from '../../pages/shop/ShopAppointments';
import AppointmentsPage from '../../pages/customer/AppointmentsPage';

const DashboardSwitcher = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'repairer':
            // Default view for shop owners
            return <ShopAppointments />;
        case 'customer':
            // Default view for customers
            return <AppointmentsPage />;
        default:
            return <Navigate to="/login" replace />;
    }
};

export default DashboardSwitcher;