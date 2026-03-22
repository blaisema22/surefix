import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpcomingAppointments = ({ appointments = [], loading = false }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-sf-card border border-sf-border rounded-lg p-6 mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white m-0">Upcoming Appointments</h2>
                <button
                    onClick={() => navigate('/shop/appointments')}
                    className="bg-sf-input text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-sf-border-light transition-colors text-sm"
                >
                    View All
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-sf-bg rounded-lg border border-sf-border">
                            <div className="bg-sf-input h-14 w-[70px] rounded-md"></div>
                            <div className="flex-grow space-y-2">
                                <div className="h-5 bg-sf-input rounded w-1/3"></div>
                                <div className="h-4 bg-sf-input rounded w-1/2"></div>
                            </div>
                            <div className="h-6 w-16 bg-sf-input rounded"></div>
                        </div>
                    ))}
                </div>
            ) : appointments.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {appointments.map(app => (
                        <div key={app.appointment_id} className="flex items-center gap-4 p-4 bg-sf-bg rounded-lg border border-sf-border hover:border-sf-blue transition-colors">
                            <div className="bg-sf-blue text-white p-3 rounded-md text-center min-w-[70px]">
                                <span className="block text-xs opacity-80">{new Date(app.appointment_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                                <span className="block text-lg font-bold">{app.appointment_time.substring(0, 5)}</span>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg text-white m-0 mb-1">{app.service_name}</h3>
                                <p className="text-sf-text-muted m-0 text-sm">For: {app.customer_name} ({app.device_brand} {app.device_model})</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${app.status === 'pending' ? 'bg-sf-yellow text-black' :
                                app.status === 'confirmed' ? 'bg-sf-green text-white' :
                                    'bg-sf-input text-white'
                                }`}>
                                {app.status}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 text-sf-text-muted border-2 border-dashed border-sf-border rounded-lg flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3 opacity-30">📅</span>
                    <p className="m-0">No upcoming appointments scheduled.</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingAppointments;