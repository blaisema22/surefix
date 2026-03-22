import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    Users, Search, CheckCircle, XCircle, Trash2,
    Shield, User, Mail, Phone, Loader2, AlertCircle,
    Wrench
} from 'lucide-react';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'customer', 'repairer', 'admin'
    const [processingId, setProcessingId] = useState(null);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get('/admin/users');
                if (response.data.success) {
                    setUsers(response.data.users);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Handle verification toggle
    const handleVerifyToggle = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unverify' : 'verify'} this user?`)) return;

        setProcessingId(userId);
        try {
            await api.patch(`/admin/users/${userId}/verify`, { is_verified: !currentStatus });
            setUsers(prev => prev.map(u =>
                u.user_id === userId ? { ...u, is_verified: !currentStatus } : u
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle user deletion
    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;

        setProcessingId(userId);
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.user_id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        } finally {
            setProcessingId(null);
        }
    };

    // Filtering logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        repairers: users.filter(u => u.role === 'repairer').length,
        customers: users.filter(u => u.role === 'customer').length
    };

    if (loading && users.length === 0) return <div className="min-h-screen bg-[#0B0F1A] text-white flex justify-center items-center"><Loader2 className="animate-spin mr-2" /> Loading Users...</div>;

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Users className="text-blue-500" /> User Management
                        </h1>
                        <p className="text-gray-400 mt-1">Oversee registered customers and repair technicians.</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-700">
                            <span className="text-gray-500 uppercase font-bold text-xs block">Total</span>
                            <span className="font-bold text-xl">{stats.total}</span>
                        </div>
                        <div className="bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-700">
                            <span className="text-gray-500 uppercase font-bold text-xs block">Repairers</span>
                            <span className="font-bold text-xl text-purple-400">{stats.repairers}</span>
                        </div>
                        <div className="bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-700">
                            <span className="text-gray-500 uppercase font-bold text-xs block">Customers</span>
                            <span className="font-bold text-xl text-green-400">{stats.customers}</span>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-[#111827] rounded-lg p-1 border border-gray-700">
                        {['all', 'customer', 'repairer', 'admin'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${roleFilter === r ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#1F2937] text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.user_id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {user.name}
                                                {user.is_verified && <CheckCircle size={14} className="text-blue-400" />}
                                            </div>
                                            <div className="text-sm text-gray-400 flex items-center gap-2"><Mail size={12} /> {user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                                    user.role === 'repairer' ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' :
                                                        'bg-green-900/30 text-green-400 border border-green-900/50'
                                                }`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : user.role === 'repairer' ? <Wrench size={12} /> : <User size={12} />}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">{user.is_verified ? 'Verified' : 'Unverified'}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right space-x-2">
                                            {user.role !== 'admin' && (
                                                <>
                                                    <button onClick={() => handleVerifyToggle(user.user_id, user.is_verified)} disabled={processingId === user.user_id} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors" title={user.is_verified ? "Unverify User" : "Verify User"}>{user.is_verified ? <XCircle size={18} /> : <CheckCircle size={18} />}</button>
                                                    <button onClick={() => handleDelete(user.user_id)} disabled={processingId === user.user_id} className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg transition-colors" title="Delete User"><Trash2 size={18} /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersManagement;