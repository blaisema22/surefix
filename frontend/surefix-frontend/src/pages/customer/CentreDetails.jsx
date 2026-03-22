import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
// Ensure this path is correct based on your project structure; derived from context
import ReviewsList from '../../components/repair/ReviewsList';

// Get the API key from environment variables
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const CentreDetails = () => {
    const { id } = useParams();
    const [centre, setCentre] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mapSrc, setMapSrc] = useState('');

    useEffect(() => {
        const fetchCentreDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Parallel fetch for details and reviews
                const [centreRes, reviewRes] = await Promise.all([
                    api.get(`/centres/${id}`),
                    api.get(`/reviews/centre/${id}`).catch(() => ({ data: { success: false, reviews: [] } }))
                ]);

                if (centreRes.data.success) {
                    const { centre: centreData, services: servicesData } = centreRes.data;
                    setCentre(centreData);
                    setServices(servicesData);

                    if (reviewRes.data && reviewRes.data.success) {
                        setReviews(reviewRes.data.reviews || []);
                    }

                    // If we have coordinates, construct the map URL
                    if (centreData.latitude && centreData.longitude && MAPS_API_KEY) {
                        const url = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${centreData.latitude},${centreData.longitude}`;
                        setMapSrc(url);
                    }
                } else {
                    setError('Failed to load centre details.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchCentreDetails();
    }, [id]);

    if (loading) return <div className="text-center text-white py-12">Loading centre details...</div>;
    if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
    if (!centre) return <div className="text-center text-white py-12">Repair centre not found.</div>;

    return (
        <div className="min-h-screen text-white p-6" style={{ background: 'var(--sf-base, #0B0F1A)' }}>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white">{centre.name}</h1>
                    <p className="text-gray-400 mt-2">{centre.address}, {centre.district}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Details & Services */}
                    <div>
                        <div className="bg-[#111827] rounded-lg p-6 border border-gray-800">
                            <h3 className="text-xl font-semibold mb-4">Details</h3>
                            <p className="text-gray-300 mb-2"><strong>Phone:</strong> {centre.phone || 'N/A'}</p>
                            <p className="text-gray-300 mb-2"><strong>Email:</strong> {centre.email || 'N/A'}</p>
                            <p className="text-gray-300"><strong>Hours:</strong> {centre.opening_time?.slice(0, 5)} - {centre.closing_time?.slice(0, 5)} ({centre.working_days})</p>
                            {centre.description && <p className="text-gray-400 mt-4 italic">{centre.description}</p>}
                        </div>

                        <div className="mt-6">
                            {/* Services and Reviews can be rendered here or via dedicated components */}
                            {/* This assumes ReviewsList handles the rendering of the reviews array */}
                            {reviews.length > 0 && <ReviewsList reviews={reviews} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CentreDetails;