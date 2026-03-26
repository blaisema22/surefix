import React, { useState, useEffect, useCallback } from 'react';
import { centreAPI } from '@/api/centres.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from './StatCard';
import { DollarSign, Calendar, CheckCircle, Users } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0F172A] border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-slate-200 font-bold mb-2 text-sm">{label}</p>
                {payload.map((entry, index) => (
                    entry.name !== 'Revenue' && (
                        <div key={index} className="flex items-center gap-3 text-xs mb-1 last:mb-0">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                            <span className="text-slate-400">{entry.name}:</span>
                            <span className="text-white font-bold ml-auto">
                                {entry.value}
                            </span>
                        </div>
                    )
                ))}
            </div>
        );
    }
    return null;
};

const ShopReports = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dates, setDates] = useState({
        start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    });
    const [monthlyData, setMonthlyData] = useState([]);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await centreAPI.getShopReports(dates);
            if (response.data?.success) {
                setReports(response.data.reports);

                // Generate monthly chart data
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const data = Array(12).fill(0).map((_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    return { name: monthNames[d.getMonth()], appointments: 0 };
                }).reverse();

                if (response.data.reports.monthly_appointments) {
                    response.data.reports.monthly_appointments.forEach(item => {
                        const idx = data.findIndex(m => m.name === item.month);
                        if (idx !== -1) {
                            data[idx].appointments = item.count;
                        }
                    });
                }
                setMonthlyData(data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch reports.');
            }
        } catch (err) {
            setError(err.message || 'Failed to load reports.');
            console.error('Reports error:', err);
        } finally {
            setLoading(false);
        }
    }, [dates]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDateChange = (e) => {
        setDates(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRefresh = () => fetchReports();

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="text-xl text-sf-text-muted animate-pulse">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Business Reports</h1>
                    <p className="text-sf-text-muted">Performance overview for your repair centre.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sf-text-label font-medium">Date Range:</label>
                    <input
                        type="date"
                        name="start_date"
                        value={dates.start_date}
                        onChange={handleDateChange}
                        className="px-3 py-2 bg-sf-input border border-sf-border rounded text-white focus:outline-none focus:border-sf-blue"
                    />
                    <span className="text-sf-text-muted">to</span>
                    <input
                        type="date"
                        name="end_date"
                        value={dates.end_date}
                        onChange={handleDateChange}
                        className="px-3 py-2 bg-sf-input border border-sf-border rounded text-white focus:outline-none focus:border-sf-blue"
                    />
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-sf-blue text-white rounded font-medium hover:bg-blue-600 transition-colors ml-auto sm:ml-0"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-sf-red/10 border border-sf-red rounded-lg">
                    <p className="text-sf-red font-medium">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-1 bg-sf-red text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {reports && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <StatCard
                            value={reports.total_appointments || 0}
                            label="Total Appointments"
                            icon={Calendar}
                            color="#3b82f6"
                        />
                        <StatCard
                            value={reports.completed_appointments || 0}
                            label="Completed Repairs"
                            icon={CheckCircle}
                            color="#8b5cf6"
                        />
                        <StatCard
                            value={reports.new_customers || 0}
                            label="New Customers"
                            icon={Users}
                            color="#f59e0b"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-sf-card p-8 rounded-lg border border-sf-border">
                            <h3 className="text-xl font-bold text-white mb-6">Monthly Appointments</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={8}>
                                        <defs>
                                            <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.4} />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#374151', opacity: 0.2 }} />
                                        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: '20px' }} />
                                        <Bar yAxisId="left" dataKey="appointments" fill="url(#apptGrad)" name="Appointments" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Placeholder for another chart or report block */}
                        <div className="bg-sf-card p-8 rounded-lg border border-sf-border flex items-center justify-center">
                            <p className="text-sf-text-muted">More reports coming soon...</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopReports;
