import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const RepairerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get start/end of current month for default report
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

                const [statsRes, apptsRes] = await Promise.all([
                    api.get(`/centres/my/reports?start_date=${startOfMonth}&end_date=${endOfMonth}`),
                    api.get('/centres/my/appointments')
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.reports);
                }
                if (apptsRes.data.success) {
                    setAppointments(apptsRes.data.appointments);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-white text-center">Loading dashboard...</div>;

    return (
        <div className="p-6 text-white max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-[#60A5FA]">Repair Centre Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase">Revenue (This Month)</h3>
                    <p className="text-2xl font-bold text-green-400 mt-2">RWF {stats?.total_revenue?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase">Total Appointments</h3>
                    <p className="text-2xl font-bold text-blue-400 mt-2">{stats?.total_appointments || 0}</p>
                </div>
                <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase">Completed Jobs</h3>
                    <p className="text-2xl font-bold text-purple-400 mt-2">{stats?.completed_appointments || 0}</p>
                </div>
                 <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase">New Customers</h3>
                    <p className="text-2xl font-bold text-yellow-400 mt-2">{stats?.new_customers || 0}</p>
                </div>
            </div>

            {/* Recent Appointments Table */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recent Appointments</h2>
                    <span className="text-sm text-gray-400">{appointments.length} records found</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1F2937] text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Reference</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Device</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {appointments.length > 0 ? appointments.slice(0, 10).map(app => (
                                <tr key={app.appointment_id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-[#60A5FA]">{app.booking_reference}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{app.customer_name}</div>
                                        <div className="text-xs text-gray-500">{app.customer_phone}</div>
                                    </td>
                                    <td className="p-4 text-sm">{app.device_brand} {app.device_model}</td>
                                    <td className="p-4 text-sm">{app.service_name}</td>
                                    <td className="p-4 text-sm">{new Date(app.appointment_date).toLocaleDateString()} at {app.appointment_time.slice(0,5)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            app.status === 'confirmed' ? 'bg-green-900/50 text-green-300 border border-green-800' :
                                            app.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-800' :
                                            app.status === 'cancelled' ? 'bg-red-900/50 text-red-300 border border-red-800' :
                                            'bg-gray-700 text-gray-300'
                                        }`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 italic">No appointments found yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RepairerDashboard;