import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Dashboards
import AdminDashboard from '../../pages/admin/Dashboard';
import ShopDashboard from '../../pages/shop/Dashboard';
import DashboardPage from '../../pages/DashboardPage';

const DashboardSwitcher = () => {
    const { user } = useAuth();

    if (user?.role === 'admin') {
        return <AdminDashboard />;
    }

    if (user?.role === 'repairer') {
        return <ShopDashboard />;
    }

    return <DashboardPage />;
};

export default DashboardSwitcher;