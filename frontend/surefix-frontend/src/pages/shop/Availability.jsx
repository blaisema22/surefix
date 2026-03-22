import React, { useState, useEffect, useCallback } from 'react';
import { getMyCentre, updateMyCentre } from '../../api/shop';

const styles = {
    container: { padding: '1rem', maxWidth: '600px' },
    card: {
        backgroundColor: '#1e1e1e',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #333',
        textAlign: 'center'
    },
    statusText: {
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
        color: '#ccc'
    },
    statusIndicator: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        marginBottom: '2rem'
    },
    open: { color: '#28a745' },
    closed: { color: '#dc3545' },
    button: {
        padding: '0.8rem 2rem',
        fontSize: '1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        color: 'white',
        minWidth: '150px'
    },
    buttonDisabled: {
        cursor: 'not-allowed',
        opacity: 0.6
    }
};

export default function ShopAvailability() {
    const [centre, setCentre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchCentre = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getMyCentre();
            // Handle both unwrapped data and axios response object
            const data = res.data || res;
            if (data.success && data.centre) {
                setCentre(data.centre);
            } else {
                setError('Could not fetch your centre profile.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCentre();
    }, [fetchCentre]);

    const handleToggleStatus = async () => {
        if (!centre) return;

        setIsSaving(true);
        setError(null);
        try {
            const updatedCentre = { ...centre, is_active: !centre.is_active };
            await updateMyCentre(updatedCentre);
            setCentre(updatedCentre);
        } catch (err) {
            setError('Failed to update status. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading availability status...</div>;
    if (error && !centre) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Shop Availability</h2>
            <p style={{ margin: '0 0 2rem 0', color: '#aaa' }}>Toggle your shop's status to appear in or be hidden from customer search results.</p>
            <div style={styles.card}>
                <p style={styles.statusText}>Your shop is currently:</p>
                <p style={{ ...styles.statusIndicator, ...(centre?.is_active ? styles.open : styles.closed) }}>{centre?.is_active ? 'OPEN' : 'CLOSED'}</p>
                <button style={{ ...styles.button, backgroundColor: centre?.is_active ? styles.closed.color : styles.open.color, ...(isSaving ? styles.buttonDisabled : {}) }} onClick={handleToggleStatus} disabled={isSaving}>{isSaving ? 'Saving...' : centre?.is_active ? 'Close Shop' : 'Open Shop'}</button>
                {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '2rem' }}>When your shop is closed, customers will not be able to find it in search or book new appointments. Existing appointments are not affected.</p>
            </div>
        </div>
    );
}