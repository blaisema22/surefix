import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from './admin.api';
import { Search, ShieldCheck, ShieldOff, Loader2, AlertCircle, User, Wrench, UserCog, ChevronDown } from 'lucide-react';
import '@/styles/sf-pages.css';

const VerificationToggle = ({ user, onToggle, loadingId }) => {
    const isLoading = loadingId === user.user_id;
    const isVerified = user.is_verified;

    return (
        <button
            onClick={() => onToggle(user.user_id, !isVerified)}
            disabled={isLoading}
            className={`sf-btn-ghost ${isVerified ? 'text-green-400' : 'text-red-400'}`}
            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : isVerified ? (
                <ShieldCheck size={14} />
            ) : (
                <ShieldOff size={14} />
            )}
            {isVerified ? 'Verified' : 'Blocked'}
        </button>
    );
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState(null);
    const [updatingRole, setUpdatingRole] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllUsers();
            if (res.success) {
                setUsers(res.users || []);
            } else {
                setError('Failed to load users.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleVerification = async (userId, isVerified) => {
        setLoadingId(userId);
        try {
            await adminAPI.updateUserVerification(userId, isVerified);
            setUsers(prev =>
                prev.map(u => (u.user_id === userId ? { ...u, is_verified: isVerified } : u))
            );
        } catch (err) {
            alert('Failed to update status. Please try again.');
        } finally {
            setLoadingId(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        setUpdatingRole(userId);
        try {
            await adminAPI.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role.');
        } finally {
            setUpdatingRole(null);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const term = searchTerm.toLowerCase();
            return (
                u.name?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.role?.toLowerCase().includes(term)
            );
        });
    }, [users, searchTerm]);

    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">
                <div className="sf-anim-up" style={{ marginBottom: 28 }}>
                    <span className="sf-eyebrow">Admin Panel</span>
                    <h1 className="sf-page-title">User Management</h1>
                    <p className="sf-page-sub">Oversee all registered users and manage their system access.</p>
                </div>

                <div className="sf-search-wrap sf-anim-up sf-s1" style={{ marginBottom: 20 }}>
                    <Search size={16} className="sf-search-icon" />
                    <input
                        className="sf-search-input"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="sf-glass sf-anim-up sf-s2" style={{ padding: 0 }}>
                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Contact</th>
                                    <th>Role</th>
                                    <th>Registered On</th>
                                    <th>Access Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin inline-block" /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}><AlertCircle size={16} className="inline-block mr-2" />{error}</td></tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.user_id}>
                                            <td><div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{user.name}</div></td>
                                            <td><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{user.email}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{user.phone}</div></td>
                                            <td>
                                                <div className="relative inline-block">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                                        disabled={updatingRole === user.user_id}
                                                        className="appearance-none bg-white/5 border border-white/10 rounded px-2 py-1 pr-6 text-xs text-slate-300 focus:border-blue-500 outline-none cursor-pointer"
                                                        style={{ textTransform: 'capitalize' }}
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="repairer">Repairer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                    {updatingRole === user.user_id && <Loader2 size={10} className="animate-spin absolute -right-4 top-1.5" />}
                                                </div>
                                            </td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td><span className={`sf-badge ${user.is_verified ? 'sf-badge-completed' : 'sf-badge-cancelled'}`}>{user.is_verified ? 'Verified' : 'Blocked'}</span></td>
                                            <td><VerificationToggle user={user} onToggle={handleToggleVerification} loadingId={loadingId} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;