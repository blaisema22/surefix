import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, LogOut, LayoutDashboard } from 'lucide-react';
import NotificationListener from '../shared/NotificationListener';
import SmsSimulator from '../shared/SmsSimulator';

const AdminLayout = ({ children }) => {
    return (
        <div className="w-full">
            <NotificationListener />
            <SmsSimulator />
            {children || <Outlet />}
        </div>
    );
};

export default AdminLayout;