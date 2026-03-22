import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw } from 'lucide-react';

const ShopLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
                <RefreshCw className="animate-spin" size={24} />
                <span className="ml-3 font-medium">Verifying shop access...</span>
            </div>
        );
    }

    // Check if user exists and is a repairer
    // If they are a customer or admin trying to access shop routes, redirect them
    if (!user || user.role !== 'repairer') {
        return <Navigate to="/dashboard" replace />;
    }

    // If authorized, render the child routes (Dashboard, Services, etc.)
    return <Outlet />;
};

export default ShopLayout;