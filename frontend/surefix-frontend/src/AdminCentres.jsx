import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '@/api/admin.api';
import { Search, ToggleLeft, ToggleRight, Loader2, AlertCircle } from 'lucide-react';
import '@/styles/sf-pages.css';

const VisibilityToggle = ({ centre, onToggle, loadingId }) => {
    const isLoading = loadingId === centre.centre_id;
    const isVisible = centre.is_visible;

    return (
        <button
            onClick={() => onToggle(centre.centre_id, !isVisible)}
            disabled={isLoading}
            className={`sf-btn-ghost ${isVisible ? 'text-green-400' : 'text-red-400'}`}
            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : isVisible ? (
                <ToggleRight size={16} />
            ) : (
                <ToggleLeft size={16} />
            )}
            {isVisible ? 'Visible' : 'Hidden'}
        </button>
    );
};

const AdminCentres = () => {
    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState(null);

    const fetchCentres = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllCentres();
            if (res.success) {
                setCentres(res.centres || []);
            } else {
                setError('Failed to load repair centres.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCentres();
    }, []);

    const handleToggleVisibility = async (centreId, isVisible) => {
        setLoadingId(centreId);
        try {
            await adminAPI.updateCentreVisibility(centreId, isVisible);
            setCentres(prev =>
                prev.map(c => (c.centre_id === centreId ? { ...c, is_visible: isVisible } : c))
            );
        } catch (err) {
            alert('Failed to update status. Please try again.');
        } finally {
            setLoadingId(null);
        }
    };

    const filteredCentres = useMemo(() => {
        return centres.filter(c => {
            const term = searchTerm.toLowerCase();
            return (
                c.name?.toLowerCase().includes(term) ||
                c.owner_name?.toLowerCase().includes(term) ||
                c.owner_email?.toLowerCase().includes(term) ||
                c.address?.toLowerCase().includes(term)
            );
        });
    }, [centres, searchTerm]);

    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">
                <div className="sf-anim-up" style={{ marginBottom: 28 }}>
                    <span className="sf-eyebrow">Admin Panel</span>
                    <h1 className="sf-page-title">Manage Repair Centres</h1>
                    <p className="sf-page-sub">Oversee all registered repair centres and manage their platform visibility.</p>
                </div>

                <div className="sf-search-wrap sf-anim-up sf-s1" style={{ marginBottom: 20 }}>
                    <Search size={16} className="sf-search-icon" />
                    <input
                        className="sf-search-input"
                        placeholder="Search by centre name, owner, email, or address..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="sf-glass sf-anim-up sf-s2" style={{ padding: 0 }}>
                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Centre Name</th>
                                    <th>Owner</th>
                                    <th>Registered On</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin inline-block" /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}><AlertCircle size={16} className="inline-block mr-2" />{error}</td></tr>
                                ) : filteredCentres.length > 0 ? (
                                    filteredCentres.map(centre => (
                                        <tr key={centre.centre_id}>
                                            <td><div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{centre.name}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{centre.address}</div></td>
                                            <td><div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{centre.owner_name}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{centre.owner_email}</div></td>
                                            <td>{new Date(centre.created_at).toLocaleDateString()}</td>
                                            <td><span className={`sf-badge ${centre.is_visible ? 'sf-badge-completed' : 'sf-badge-cancelled'}`}>{centre.is_visible ? 'Visible' : 'Hidden'}</span></td>
                                            <td><VisibilityToggle centre={centre} onToggle={handleToggleVisibility} loadingId={loadingId} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No centres found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCentres;