import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import QRCode from 'react-qr-code';

const AppointmentDetails = () => {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const response = await api.get(`/appointments/${id}`);
                if (response.data.success) {
                    setAppointment(response.data.appointment);
                } else {
                    setError('Failed to load appointment.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching appointment.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-white">Loading details...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
    if (!appointment) return <div className="p-12 text-center text-white">Appointment not found.</div>;

    const {
        booking_reference, status, appointment_date, appointment_time,
        centre_name, centre_address, service_name, device_brand, device_model,
        issue_description, issue_image_url
    } = appointment;

    const formattedDate = new Date(appointment_date).toLocaleDateString();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="min-h-screen text-white p-6" style={{ background: 'var(--sf-base, #0B0F1A)' }}>
            <div className="max-w-3xl mx-auto bg-[#111827] rounded-lg border border-gray-800 p-8 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Appointment Details</h1>
                        <p className="text-gray-400">Ref: <span className="font-mono text-blue-400">{booking_reference}</span></p>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wider 
                        ${status === 'completed' ? 'bg-green-900 text-green-300' :
                            status === 'cancelled' ? 'bg-red-900 text-red-300' :
                                'bg-blue-900 text-blue-300'}`}>
                        {status.replace('_', ' ')}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Check-in QR Code */}
                    <div className="bg-gray-800/50 p-6 rounded-lg flex flex-col items-center justify-center border border-gray-700/50">
                        <h3 className="text-sm uppercase text-gray-500 font-bold mb-4">Check-in Ticket</h3>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <QRCode value={booking_reference || ''} size={160} />
                        </div>
                        <p className="text-gray-400 text-sm mt-4">Show this code at the repair centre to check in.</p>
                    </div>

                    {/* Centre Info */}
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-blue-400">Repair Centre</h3>
                        <p className="text-lg font-medium">{centre_name}</p>
                        <p className="text-gray-400">{centre_address}</p>
                    </div>

                    {/* Device & Service */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="text-sm uppercase text-gray-500 font-bold mb-1">Device</h3>
                            <p>{device_brand} {device_model}</p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="text-sm uppercase text-gray-500 font-bold mb-1">Service</h3>
                            <p>{service_name || 'General Repair'}</p>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="text-sm uppercase text-gray-500 font-bold mb-1">Date</h3>
                            <p>{formattedDate}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm uppercase text-gray-500 font-bold mb-1">Time</h3>
                            <p>{appointment_time}</p>
                        </div>
                    </div>

                    {/* Issue Description */}
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h3 className="text-sm uppercase text-gray-500 font-bold mb-2">Issue Description</h3>
                        <p className="text-gray-300">{issue_description}</p>
                        {issue_image_url && (
                            <div className="mt-4">
                                {/* Secure image loading using token */}
                                <img
                                    src={`${apiUrl}/${issue_image_url}?token=${localStorage.getItem('token')}`}
                                    alt="Issue"
                                    className="max-w-full h-auto rounded-lg border border-gray-700"
                                    style={{ maxHeight: '300px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex justify-end">
                        <Link to="/appointments" className="text-gray-400 hover:text-white transition-colors">
                            &larr; Back to Appointments
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetails;