import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';

const BookingSuccessModal = ({ isOpen, appointmentDetails }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e293b] border border-gray-700 w-full max-w-md rounded-2xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/20">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-400 mb-8">
                        Your appointment has been successfully scheduled. We've sent a confirmation email to your inbox.
                    </p>

                    <div className="w-full bg-gray-800/50 rounded-xl p-4 mb-8 border border-gray-700">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Schedule</div>
                                <div className="text-white font-semibold">
                                    {appointmentDetails?.date} <span className="text-gray-500 mx-1">•</span> {appointmentDetails?.time?.substring(0, 5)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={() => navigate('/appointments')}
                            className="w-full btn btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                            View Appointments <ArrowRight size={18} />
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessModal;