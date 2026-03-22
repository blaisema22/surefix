import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { RefreshCw } from 'lucide-react';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
                <RefreshCw className="animate-spin" size={24} />
                <span className="ml-3 font-medium">Verifying access...</span>
            </div>
        );
    }

    // If the user is not an admin, redirect them to their default dashboard.
    // This provides a smoother user experience than showing an "Access Denied" page.
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // If the user is authenticated and is an admin, render the nested admin routes.
    return <Outlet />;
};

export default AdminLayout;