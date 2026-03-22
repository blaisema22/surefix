import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UpcomingAppointments({ appointments }) {
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

            {appointments.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {appointments.map(app => (
                        <div key={app.appointment_id} className="flex items-center gap-4 p-4 bg-sf-bg rounded-lg border border-sf-border">
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
                <div className="text-center p-12 text-sf-text-muted border-2 border-dashed border-sf-border rounded-lg">
                    <p>No upcoming appointments.</p>
                </div>
            )}
        </div>
    );
}