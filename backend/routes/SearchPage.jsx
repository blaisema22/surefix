import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';

const LIBRARIES = ['places'];
const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };
const MAP_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
];

// FIX: Define these outside to prevent re-rendering map on state changes
const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = { styles: MAP_STYLES, streetViewControl: false, mapTypeControl: false };

const SearchPage = () => {
    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [locationError, setLocationError] = useState('');
    const [locating, setLocating] = useState(false);
    const [map, setMap] = useState(null);
    const [selectedCentre, setSelectedCentre] = useState(null);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES
    });

    useEffect(() => {
        fetchCentres();
    }, []);

    const fetchCentres = async (query = '', lat = null, lng = null, service = '') => {
        setLoading(true);
        setLocationError('');
        try {
            let url = '/centres';
            const params = {};

            if (lat && lng) {
                params.lat = lat;
                params.lng = lng;
                params.radius = 20; // 20km radius
            }
            if (query) {
                params.search = query;
            }
            if (service) {
                params.service = service;
            }

            const response = await api.get(url, { params });
            if (response.data.success) {
                setCentres(response.data.centres);
            }
        } catch (error) {
            console.error('Failed to fetch centres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCentres(searchTerm, null, null, serviceFilter);
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchCentres(searchTerm, position.coords.latitude, position.coords.longitude, serviceFilter).finally(() => {
                    setLocating(false);
                });
            },
            (error) => {
                setLocating(false);
                setLocationError('Unable to retrieve your location. Please check your permissions.');
            }
        );
    };

    const handleBookClick = (centreId) => {
        // Requirement: If they want to book, they should first sign in
        if (!user) {
            navigate('/login', { state: { from: `/book-repair/${centreId}` } });
        } else {
            navigate(`/book-repair/${centreId}`);
        }
    };

    const handleViewOnMap = (centre) => {
        setSelectedCentre(centre);
        if (map && centre.latitude && centre.longitude) {
            map.panTo({ lat: parseFloat(centre.latitude), lng: parseFloat(centre.longitude) });
            map.setZoom(15);
            // Scroll to map on mobile
            if (window.innerWidth < 1024) {
                document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const handleGetDirections = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedCentres = centres.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
            <style>{`
                /* Dark Mode InfoWindow Overrides */
                .gm-style .gm-style-iw-c {
                    background-color: #1F2937 !important;
                    padding: 0 !important;
                    border-radius: 12px !important;
                    border: 1px solid #374151 !important;
                }
                .gm-style .gm-style-iw-tc::after {
                    background-color: #1F2937 !important;
                }
                .gm-style .gm-style-iw-d {
                    overflow: hidden !important;
                    color: #F3F4F6 !important;
                }
                button.gm-ui-hover-effect { filter: invert(1) !important; top: 4px !important; right: 4px !important; }
            `}</style>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-4 text-[#60A5FA]">Find a Repair Centre</h1>
                    <p className="text-gray-400 mb-6">Locate the nearest experts for your device repair</p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2 bg-[#1F2937] p-1 rounded-lg border border-gray-700 focus-within:border-[#60A5FA] transition-colors">
                            <select
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                className="bg-transparent text-white text-sm px-3 py-2 border-r border-gray-600 focus:outline-none cursor-pointer"
                            >
                                <option value="">All Services</option>
                                <option value="Screen">Screen Repair</option>
                                <option value="Battery">Battery</option>
                                <option value="Water">Water Damage</option>
                                <option value="Software">Software</option>
                                <option value="Diagnostic">Diagnostic</option>
                                <option value="Camera">Camera</option>
                                <option value="Charging">Charging Port</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Search by name or district..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-transparent text-white focus:outline-none"
                            />
                            <button type="submit" className="bg-[#60A5FA] hover:bg-blue-600 text-white px-6 py-2 rounded font-medium transition-colors">
                                Search
                            </button>
                        </form>
                        <button
                            onClick={handleUseLocation}
                            disabled={locating}
                            className="bg-[#374151] hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {locating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Locating...</span>
                                </>
                            ) : <span>📍 Use My Location</span>}
                        </button>
                    </div>
                    {locationError && <p className="text-red-500 mt-2 text-sm">{locationError}</p>}
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading repair centres...</div>
                ) : (
                    <div className="flex flex-col-reverse lg:flex-row gap-6">
                        {/* Left: Results List */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                                {centres.length > 0 ? (
                                    displayedCentres.map((centre) => (
                                        <div key={centre.centre_id} className="bg-[#111827] rounded-lg border border-gray-800 p-6 hover:border-[#60A5FA] transition-colors flex flex-col">
                                            <div className="flex-1">
                                                <Link to={`/centres/${centre.centre_id}`} className="hover:underline">
                                                    <h3 className="text-xl font-semibold mb-2">{centre.name}</h3>
                                                </Link>
                                                <p className="text-gray-400 text-sm mb-1">{centre.address}</p>
                                                {centre.district && <p className="text-gray-500 text-sm mb-3">{centre.district}</p>}

                                                <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                                                    <span className="bg-gray-800 px-2 py-1 rounded">🕒 {centre.opening_time?.slice(0, 5)} - {centre.closing_time?.slice(0, 5)}</span>
                                                    {centre.distance_km && <span className="text-[#60A5FA] font-medium">{parseFloat(centre.distance_km).toFixed(1)} km away</span>}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 mt-4">
                                                <button
                                                    onClick={() => handleViewOnMap(centre)}
                                                    className="w-full border border-gray-600 hover:bg-gray-800 text-white py-2 rounded transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Locate on Map 📍
                                                </button>
                                                <button
                                                    onClick={() => handleBookClick(centre.centre_id)}
                                                    className="w-full bg-[#60A5FA] hover:bg-blue-600 text-white py-2 rounded font-medium transition-colors"
                                                >
                                                    Book Appointment
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-400">
                                        No repair centres found. Try a different search or location.
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-[#1F2937] hover:bg-gray-600 text-white rounded disabled:opacity-50"
                                >Previous</button>
                                <button
                                    onClick={() => setCurrentPage(prev => prev + 1)} disabled={endIndex >= centres.length} className="px-4 py-2 bg-[#1F2937] hover:bg-gray-600 text-white rounded disabled:opacity-50">Next</button>
                            </div>
                        </div>

                        {/* Right: Map (Sticky on Desktop) */}
                        <div id="map-container" className="lg:w-[450px] xl:w-[500px] h-[400px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-6 rounded-xl overflow-hidden border border-gray-700 bg-[#111827] shrink-0">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={KIGALI_CENTER}
                                    zoom={12}
                                    onLoad={setMap}
                                    options={mapOptions}
                                >
                                    {centres.map(centre => (
                                        centre.latitude && centre.longitude && (
                                            <Marker
                                                key={centre.centre_id}
                                                position={{ lat: parseFloat(centre.latitude), lng: parseFloat(centre.longitude) }}
                                                onClick={() => handleViewOnMap(centre)}
                                                animation={selectedCentre?.centre_id === centre.centre_id ? 1 : 0} // 1 = BOUNCE
                                            />
                                        )
                                    ))}
                                    {selectedCentre && selectedCentre.latitude && (
                                        <InfoWindow
                                            position={{ lat: parseFloat(selectedCentre.latitude), lng: parseFloat(selectedCentre.longitude) }}
                                            onCloseClick={() => setSelectedCentre(null)}
                                        >
                                            <div className="p-4 min-w-[200px] bg-[#1F2937]">
                                                <h3 className="font-bold text-white text-base mb-1">{selectedCentre.name}</h3>
                                                <p className="text-gray-400 text-xs mb-3">{selectedCentre.address}</p>
                                                <Link to={`/centres/${selectedCentre.centre_id}`} className="block w-full text-center bg-[#60A5FA] hover:bg-blue-600 text-white text-xs font-bold py-2 rounded transition-colors">
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => handleGetDirections(selectedCentre.latitude, selectedCentre.longitude)}
                                                    className="block w-full text-center border border-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-2 rounded transition-colors mt-2"
                                                >
                                                    Get Directions ↗
                                                </button>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    <span className="text-xs font-medium">Loading Map...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;