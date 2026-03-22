import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerDashboard from '../../pages/customer/Dashboard';
import { RefreshCw } from 'lucide-react';

const DashboardSwitcher = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
                <RefreshCw className="animate-spin" size={24} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect based on role
    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin/dashboard" replace />;
        case 'repairer':
        case 'shop':
            return <Navigate to="/shop/dashboard" replace />;
        case 'customer':
        default:
            return <CustomerDashboard />;
    }
};

export default DashboardSwitcher;