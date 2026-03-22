import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCustomers } from '../../api/shop';

const ShopCustomers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const load = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const res = await getMyCustomers(); // This now returns response.data directly
            if (res?.success) {
                setCustomers(res.customers ?? []);
            } else throw new Error(res?.message ?? 'Failed.');
        } catch (err) {
            setError(err.message ?? 'Failed to load customers.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filteredCustomers = useMemo(() => {
        let data = [...customers];

        // 1. Filter by Search Term
        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            data = data.filter(c => c.name?.toLowerCase().includes(lower) || c.email?.toLowerCase().includes(lower));
        }

        // 2. Sort and Slice based on Tab
        if (filter === 'recent') {
            data.sort((a, b) => new Date(b.last_appointment) - new Date(a.last_appointment));
            if (!searchTerm.trim()) data = data.slice(0, 20); // Only limit if not searching
        } else if (filter === 'frequent') {
            data.sort((a, b) => b.total_bookings - a.total_bookings);
            if (!searchTerm.trim()) data = data.slice(0, 20);
        }

        return data;
    }, [customers, filter, searchTerm]);

    const handleExport = () => {
        if (filteredCustomers.length === 0) return;

        const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Last Visit'];
        const rows = filteredCustomers.map(c => [
            `"${c.name}"`,
            c.email,
            c.phone || '',
            c.total_bookings,
            new Date(c.last_appointment).toLocaleDateString()
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const FILTERS = [
        { key: 'all', label: 'All Customers' },
        { key: 'recent', label: 'Recent Visitors' },
        { key: 'frequent', label: 'Most Frequent' },
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }} className="sf-anim-up">
                    <div>
                        <span className="sf-eyebrow">Clientele</span>
                        <h1 className="sf-page-title">Customers</h1>
                        <p className="sf-page-sub">Users who have booked appointments with your centre.</p>
                    </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            className="sf-input"
                            style={{ padding: '8px 12px', minWidth: '250px', fontSize: '0.9rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={filteredCustomers.length === 0} title="Export CSV">
                        <i className="fa-solid fa-download"></i>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
                        <i className="fa-solid fa-arrows-rotate mr-1"></i>
                    </button>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="sf-tabs" style={{ marginBottom: 24, width: 'fit-content' }}>
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`sf-tab ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {error && <div className="sf-alert sf-alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="sf-skeleton" style={{ height: 68, borderRadius: 12 }} />
                    ))}
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="sf-empty">
                    <div className="sf-empty-icon"><i className="fa-solid fa-magnifying-glass"></i></div>
                    <div className="sf-empty-title">No customers found</div>
                    <div className="sf-empty-desc">Try adjusting your search or filters.</div>
                </div>
            ) : (
                <div className="sf-table-wrap">
                    <table className="sf-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Bookings</th>
                                <th>Last Visit</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(c => (
                                <tr key={c.user_id} className="hover:bg-white/5 transition-colors">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: 10,
                                                background: 'var(--sf-grad)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.82rem', fontWeight: 700, color: 'white', flexShrink: 0,
                                            }}>
                                                {c.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--sf-text)' }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: 'var(--sf-text-2)', fontSize: '0.85rem' }}>{c.email}</div>
                                        <div style={{ color: 'var(--sf-text-3)', fontSize: '0.78rem' }}>{c.phone ?? 'No phone'}</div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: 'var(--sf-blue-light)' }}>{c.total_bookings}</span>
                                    </td>
                                    <td>{new Date(c.last_appointment).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="text-xs font-bold text-blue-400 hover:text-blue-300"
                                            onClick={() => navigate(`/shop/customers/${c.user_id}`, { state: { customer: c } })}
                                        >
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="sf-pagination">
                        <span>Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
};

export default ShopCustomers;