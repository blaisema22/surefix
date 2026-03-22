import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const RepairerDashboard = () => {
    const [centre, setCentre] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [centreRes, apptRes] = await Promise.all([
                    api.get('/centres/my/centre').catch(err => ({ data: { success: false } })),
                    api.get('/centres/my/appointments').catch(err => ({ data: { success: false, appointments: [] } }))
                ]);

                if (centreRes.data && centreRes.data.success) {
                    setCentre(centreRes.data.centre);
                }
                if (apptRes.data && apptRes.data.success) {
                    setAppointments(apptRes.data.appointments);
                }
            } catch (error) {
                console.error("Error loading dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#0B0F1A] text-white p-6 flex justify-center items-center">Loading Dashboard...</div>;

    if (!centre) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] text-white p-6 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">No Repair Centre Found</h2>
                <p className="text-gray-400 mb-6">You haven't registered a repair shop yet.</p>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition">
                    Register Shop
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{centre.name}</h1>
                        <p className="text-gray-400">Repairer Dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${centre.is_active ? 'border-green-800 bg-green-900/30 text-green-400' : 'border-red-800 bg-red-900/30 text-red-400'}`}>
                            {centre.is_active ? '● Active' : '● Inactive'}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Appointments Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                            <h2 className="text-xl font-semibold">Incoming Appointments</h2>
                            <span className="text-sm text-gray-400">{appointments.length} total</span>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="bg-[#111827] rounded-lg p-8 text-center border border-gray-800">
                                <p className="text-gray-400">No appointments scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map(appt => (
                                    <div key={appt.appointment_id} className="bg-[#111827] p-5 rounded-lg border border-gray-800 hover:border-blue-900/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{appt.device_brand} {appt.device_model}</h3>
                                                <p className="text-sm text-gray-400 mt-1">Issue: {appt.issue_description}</p>
                                                <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                                                    <span className="text-blue-400 flex items-center gap-1">
                                                        📅 {new Date(appt.appointment_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-blue-400 flex items-center gap-1">
                                                        ⏰ {appt.appointment_time}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${appt.status === 'confirmed' ? 'bg-green-900 text-green-300' :
                                                        appt.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                                                            appt.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                                                                'bg-gray-700 text-gray-300'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Placeholder for future implementation) */}
                                        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end gap-2">
                                            <button className="px-3 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 rounded text-gray-300">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Shop Info */}
                    <div className="space-y-6">
                        <div className="bg-[#111827] p-6 rounded-lg border border-gray-800">
                            <h2 className="text-xl font-semibold mb-4">Shop Details</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Location</p>
                                    <p className="text-gray-300">{centre.address}, {centre.district}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Contact</p>
                                    <p className="text-gray-300">{centre.phone}</p>
                                    <p className="text-gray-300">{centre.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Hours</p>
                                    <p className="text-gray-300">{centre.opening_time} - {centre.closing_time}</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 rounded transition">
                                    Edit Profile
                                </button>
                                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded transition">
                                    Manage Services
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepairerDashboard;