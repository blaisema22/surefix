import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Smartphone, FileText, Image as ImageIcon } from 'lucide-react';

// Use environment variable for API URL or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AppointmentDetailsModal = ({ appointment, onClose }) => {
    if (!appointment) return null;

    // Construct full image URL if path exists
    const imageUrl = appointment.issue_image_url?.startsWith('http')
        ? appointment.issue_image_url
        : appointment.issue_image_url
            ? `${API_BASE_URL}/${appointment.issue_image_url}`
            : null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{appointment.service_name}</h2>
                        <p className="text-sm text-slate-500 font-mono mt-1">Ref: {appointment.booking_reference}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                <Calendar size={14} /> Date & Time
                            </div>
                            <div className="font-semibold text-slate-700">
                                {new Date(appointment.appointment_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-500">
                                {appointment.appointment_time?.slice(0, 5)}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                <MapPin size={14} /> Centre
                            </div>
                            <div className="font-semibold text-slate-700 truncate" title={appointment.centre_name}>
                                {appointment.centre_name}
                            </div>
                            <div className="text-sm text-slate-500 truncate">
                                {appointment.shop_district || 'District N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Device Info */}
                    <div className="flex items-start gap-3 p-4 border border-slate-100 rounded-xl">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-700 text-sm">Device Details</h4>
                            <p className="text-sm text-slate-600">
                                {appointment.device_brand} {appointment.device_model}
                            </p>
                        </div>
                    </div>

                    {/* Issue Description */}
                    {appointment.issue_description && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                                <FileText size={16} className="text-slate-400" />
                                Issue Description
                            </h4>
                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100 leading-relaxed">
                                {appointment.issue_description}
                            </div>
                        </div>
                    )}

                    {/* Uploaded Image */}
                    {imageUrl && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                                <ImageIcon size={16} className="text-slate-400" />
                                Device Image
                            </h4>
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group cursor-zoom-in">
                                <img
                                    src={imageUrl}
                                    alt="Issue Evidence"
                                    className="w-full h-auto object-cover max-h-64 transition-transform duration-500 group-hover:scale-105"
                                />
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AppointmentDetailsModal;