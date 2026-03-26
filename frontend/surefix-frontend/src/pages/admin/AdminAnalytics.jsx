import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
    pending: '#F59E0B',    // Amber 500
    confirmed: '#3B82F6',  // Blue 500
    in_progress: '#8B5CF6', // Violet 500
    completed: '#10B981',  // Emerald 500
    cancelled: '#EF4444',  // Red 500
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#111827] border border-gray-700 p-3 rounded-lg shadow-xl">
                <p className="text-gray-300 text-xs font-bold mb-2">{label}</p>
                {payload.map((entry, index) => {
                    if (entry.name === 'revenue') return null;
                    return (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-400 capitalize">{entry.name}:</span>
                            <span className="text-white font-mono font-bold">
                                {entry.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

const AdminAnalytics = ({ analytics }) => {
    if (!analytics) return null;

    const { monthly_stats, status_distribution } = analytics;

    // Transform status data for Pie Chart
    const pieData = status_distribution.map(item => ({
        name: item.status,
        value: item.count
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trends Chart */}
            <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-gray-300 font-bold mb-6 text-sm uppercase tracking-wider">Performance Trends</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthly_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#9CA3AF"
                                fontSize={10}
                                tickFormatter={(str) => {
                                    const d = new Date(str + '-01');
                                    return d.toLocaleDateString(undefined, { month: 'short' });
                                }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="appointments"
                                name="Appointments"
                                stroke="#3B82F6"
                                fillOpacity={1}
                                fill="url(#colorAppt)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-[#1F2937] p-6 rounded-lg border border-gray-700 shadow-lg flex flex-col">
                <h3 className="text-gray-300 font-bold mb-6 text-sm uppercase tracking-wider">Appointment Status</h3>
                <div className="h-64 w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#E5E7EB' }}
                            />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                iconType="circle"
                                formatter={(value) => <span className="text-gray-400 text-xs capitalize ml-1">{value.replace('_', ' ')}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;