import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminAnalytics from './AdminAnalytics';
import {
    ShieldCheck, CheckCircle, XCircle, MapPin,
    Phone, Search, Loader2, AlertCircle, Filter,
    Mail, User, Calendar
} from 'lucide-react';

const AdminDashboard = () => {
    const [centres, setCentres] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('pending'); // 'pending', 'active', 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch centres and analytics in parallel
                const [centresRes, analyticsRes] = await Promise.all([
                    api.get('/admin/centres'),
                    api.get('/admin/analytics').catch(() => ({ data: { success: false } })) // Graceful fail for analytics
                ]);

                if (centresRes.data.success) {
                    setCentres(centresRes.data.centres);
                } else {
                    setError('Failed to fetch repair centres.');
                }

                if (analyticsRes.data.success) {
                    setAnalytics(analyticsRes.data.analytics);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Access denied. Ensure you are an administrator.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleStatusChange = async (centreId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'approve' : 'deactivate'} this centre?`)) return;

        setProcessingId(centreId);
        try {
            // Using a PATCH endpoint to update specific fields
            await api.patch(`/admin/centres/${centreId}/status`, { is_active: newStatus });

            // Optimistic update
            setCentres(prev => prev.map(c =>
                c.centre_id === centreId ? { ...c, is_active: newStatus } : c
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter logic
    const filteredCentres = centres.filter(centre => {
        const matchesSearch =
            centre.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            centre.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'pending') return !centre.is_active;
        if (filter === 'active') return centre.is_active;
        return true;
    });

    const stats = {
        pending: centres.filter(c => !c.is_active).length,
        active: centres.filter(c => c.is_active).length,
        total: centres.length
    };

    if (loading && centres.length === 0 && !analytics) {
        return (
            <AdminLayout>
                <div className="h-full flex justify-center items-center text-white"><Loader2 className="animate-spin mr-2" /> Loading Admin Portal...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ShieldCheck className="text-blue-500" /> Admin Portal
                        </h1>
                        <p className="text-gray-400 mt-1">Manage repair centre approvals and platform oversight.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-700">
                            <div className="text-xs text-gray-500 uppercase font-bold">Pending</div>
                            <div className="text-xl font-bold text-yellow-500">{stats.pending}</div>
                        </div>
                        <div className="bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-700">
                            <div className="text-xs text-gray-500 uppercase font-bold">Active</div>
                            <div className="text-xl font-bold text-green-500">{stats.active}</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Overview */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-medium uppercase flex items-center gap-2"><Calendar size={16} /> Appointments</h3>
                            <p className="text-2xl font-bold text-blue-400 mt-2">{Number(analytics.total_appointments || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-medium uppercase flex items-center gap-2"><User size={16} /> Total Users</h3>
                            <p className="text-2xl font-bold text-purple-400 mt-2">{Number(analytics.total_users || 0).toLocaleString()}</p>
                        </div>
                    </div>
                )}

                    {/* Charts Section */}
                    <AdminAnalytics analytics={analytics} />

                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <h2 className="text-xl font-bold flex items-center text-white my-auto mr-auto">Repair Centres</h2>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by centre name or owner..."
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-[#111827] rounded-lg p-1 border border-gray-700">
                        {['pending', 'active', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredCentres.length > 0 ? filteredCentres.map(centre => (
                        <div key={centre.centre_id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{centre.name}</h3>
                                        {!centre.is_active && <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-900/50 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide">Pending Approval</span>}
                                        {centre.is_active && <span className="bg-green-900/30 text-green-400 border border-green-900/50 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide">Active</span>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2"><MapPin size={14} /> {centre.address}, {centre.district}</div>
                                        <div className="flex items-center gap-2"><Phone size={14} /> {centre.phone || 'N/A'}</div>
                                        <div className="flex items-center gap-2"><Mail size={14} /> {centre.email || 'N/A'}</div>
                                        <div className="flex items-center gap-2"><User size={14} /> Owner: {centre.owner_name || 'Unknown'}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-6">
                                    {!centre.is_active ? (
                                        <button
                                            onClick={() => handleStatusChange(centre.centre_id, true)}
                                            disabled={processingId === centre.centre_id}
                                            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {processingId === centre.centre_id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Approve
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusChange(centre.centre_id, false)}
                                            disabled={processingId === centre.centre_id}
                                            className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {processingId === centre.centre_id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Deactivate
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-[#111827] rounded-xl border border-dashed border-gray-800 text-gray-500">
                            <Filter size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No repair centres found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </AdminLayout>
    );
};

export default AdminDashboard;