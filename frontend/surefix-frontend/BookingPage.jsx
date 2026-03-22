import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import BookingSuccessModal from '@/components/shared/BookingSuccessModal';

const BookingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Wizard State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Data Lists
    const [centres, setCentres] = useState([]);
    const [services, setServices] = useState([]);
    const [devices, setDevices] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Selection State
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [selectedService, setSelectedService] = useState(null); // object or 'other'
    const [selectedDevice, setSelectedDevice] = useState(null);

    // Form Data
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [deviceImage, setDeviceImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Initialize
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Shops
                const centresRes = await api.get('/centres');
                if (centresRes.data.success) {
                    setCentres(centresRes.data.centres);

                    // Pre-select centre if passed in URL
                    const paramCentreId = searchParams.get('centreId');
                    if (paramCentreId) {
                        const found = centresRes.data.centres.find(c => c.centre_id === parseInt(paramCentreId));
                        if (found) handleSelectCentre(found);
                    }
                }

                // 2. Fetch User's Devices (needed later)
                const devicesRes = await api.get('/devices');
                if (devicesRes.data.success) {
                    setDevices(devicesRes.data.devices);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [searchParams]);

    // Handlers
    const handleSelectCentre = async (centre) => {
        setSelectedCentre(centre);
        setLoading(true);
        try {
            // Fetch services for this centre
            const res = await api.get(`/centres/${centre.centre_id}`);
            if (res.data.success) {
                setServices(res.data.services || []);
                setStep(2);
            }
        } catch (err) {
            setError('Could not load services for this shop.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = async (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        setTime(''); // reset time
        if (!newDate || !selectedCentre) return;

        try {
            const res = await api.get(`/centres/${selectedCentre.centre_id}/availability?date=${newDate}`);
            if (res.data.success) {
                setAvailableSlots(res.data.available_slots);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDeviceImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!selectedCentre || !selectedDevice || !date || !time || !issueDescription) {
            setError("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('centre_id', selectedCentre.centre_id);
        formData.append('device_id', selectedDevice.device_id);
        formData.append('appointment_date', date);
        formData.append('appointment_time', time);
        formData.append('issue_description', issueDescription);

        if (selectedService && selectedService !== 'other') {
            formData.append('service_id', selectedService.service_id);
        }

        if (deviceImage) {
            formData.append('deviceImage', deviceImage);
        }

        try {
            const res = await api.post('/appointments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setShowSuccess(true);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
            setSubmitting(false);
        }
    };

    // Steps Rendering
    const renderProgressBar = () => (
        <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-10 transform -translate-y-1/2 rounded"></div>
            {[1, 2, 3, 4, 5].map((num) => (
                <div
                    key={num}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-600'
                        }`}
                >
                    {num}
                </div>
            ))}
        </div>
    );

    if (loading && step === 1 && centres.length === 0) {
        return <div className="p-8 text-center text-gray-400">Loading booking interface...</div>;
    }

    return (
        <main className="page-content max-w-3xl mx-auto p-4 md:p-8">
            <BookingSuccessModal 
                isOpen={showSuccess} 
                appointmentDetails={{ date, time }} 
            />

            <h1 className="text-2xl font-bold mb-2 text-white">Book an Appointment</h1>
            <p className="text-gray-400 mb-6">Schedule a repair in 5 simple steps.</p>

            {renderProgressBar()}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="sf-card bg-[#1e293b] p-6 rounded-xl border border-gray-700">

                {/* STEP 1: Select Centre */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-4 text-white">Select a Repair Centre</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {centres.map(centre => (
                                <div
                                    key={centre.centre_id}
                                    onClick={() => handleSelectCentre(centre)}
                                    className="cursor-pointer p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 transition-all group"
                                >
                                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400">{centre.name}</h3>
                                    <p className="text-sm text-gray-400"><i className="fas fa-map-marker-alt mr-2"></i>{centre.district}, {centre.address}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: Select Service */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-4 text-white">Select Service at <span className="text-blue-400">{selectedCentre.name}</span></h2>

                        <div className="space-y-3 mb-6">
                            {services.map(service => (
                                <div
                                    key={service.service_id}
                                    onClick={() => { setSelectedService(service); setStep(3); }}
                                    className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedService?.service_id === service.service_id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/30'
                                        }`}
                                >
                                    <div>
                                        <h4 className="font-bold text-white">{service.service_name}</h4>
                                        <p className="text-sm text-gray-400">{service.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-300">Est. {service.estimated_duration_minutes} mins</div>
                                        <div className="text-xs text-blue-300 font-mono">{service.device_category}</div>
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={() => { setSelectedService('other'); setStep(3); }}
                                className="p-4 rounded-lg border border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-gray-300 cursor-pointer text-center"
                            >
                                My issue is not listed here (Select Custom Issue)
                            </div>
                        </div>

                        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm">
                            ← Back to Shops
                        </button>
                    </div>
                )}

                {/* STEP 3: Select Device */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-4 text-white">Which device needs repair?</h2>

                        {devices.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">You haven't added any devices yet.</p>
                                <button onClick={() => navigate('/devices')} className="btn btn-primary">
                                    Add a Device
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 mb-6">
                                {devices.map(device => (
                                    <div
                                        key={device.device_id}
                                        onClick={() => { setSelectedDevice(device); setStep(4); }}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedDevice?.device_id === device.device_id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/30'
                                            }`}
                                    >
                                        <h4 className="font-bold text-white">{device.brand} {device.model}</h4>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 bg-gray-800 inline-block px-2 py-1 rounded mt-1">
                                            {device.device_type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white text-sm">
                            ← Back to Services
                        </button>
                    </div>
                )}

                {/* STEP 4: Date, Time & Details */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-6 text-white">Schedule & Details</h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Date & Time Column */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    className="sf-input w-full mb-4"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={date}
                                    onChange={handleDateChange}
                                />

                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Time Slot</label>
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {date ? (
                                        availableSlots.length > 0 ? (
                                            availableSlots.map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setTime(slot)}
                                                    className={`py-2 px-1 text-xs rounded border transition-colors ${time === slot
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'border-gray-600 text-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {slot.substring(0, 5)}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center text-sm text-red-400 py-2 border border-red-500/20 bg-red-500/10 rounded">
                                                No slots available
                                            </div>
                                        )
                                    ) : (
                                        <div className="col-span-3 text-center text-sm text-gray-500 py-2">Select a date first</div>
                                    )}
                                </div>
                            </div>

                            {/* Details Column */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Issue Description</label>
                                <textarea
                                    className="sf-textarea w-full h-32 mb-4"
                                    placeholder="Describe the problem..."
                                    value={issueDescription}
                                    onChange={e => setIssueDescription(e.target.value)}
                                ></textarea>

                                <label className="block text-sm font-medium text-gray-400 mb-2">Photo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors">
                                        <i className="fas fa-camera mr-2"></i> Upload
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {previewUrl && (
                                        <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover border border-gray-600" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white text-sm">
                                ← Back to Device
                            </button>

                            <button
                                onClick={() => setStep(5)}
                                disabled={!time || !issueDescription}
                                className="btn btn-primary px-8 py-3 text-base shadow-lg shadow-blue-600/20"
                            >
                                Review Details
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: Final Review */}
                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-6 text-white">Review & Confirm</h2>

                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-6 mb-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Repair Shop</span>
                                    <div className="text-white font-bold text-lg">{selectedCentre?.name}</div>
                                    <div className="text-sm text-gray-500">{selectedCentre?.address}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Appointment</span>
                                    <div className="text-white font-bold text-lg">{date}</div>
                                    <div className="text-blue-400 font-mono font-bold">{time?.substring(0, 5)}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Device</span>
                                    <div className="text-white">{selectedDevice?.brand} {selectedDevice?.model}</div>
                                    <div className="text-sm text-gray-500 uppercase">{selectedDevice?.device_type}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Service</span>
                                    <div className="text-white">{selectedService === 'other' ? 'Custom Issue' : selectedService?.service_name}</div>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <span className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Problem Description</span>
                                <div className="bg-black/30 p-3 rounded text-gray-300 text-sm italic border border-gray-700/50">
                                    "{issueDescription}"
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={() => setStep(4)} className="text-gray-400 hover:text-white text-sm">
                                ← Edit Details
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn btn-primary px-8 py-3 text-base shadow-lg shadow-blue-600/20"
                            >
                                {submitting ? (
                                    <><i className="fas fa-spinner fa-spin mr-2"></i> Booking...</>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default BookingPage;