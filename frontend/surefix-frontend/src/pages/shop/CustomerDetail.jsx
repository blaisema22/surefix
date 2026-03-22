import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { appointmentAPI } from '../../api/appointments.api';
import { timeAgo } from '../../utils/time';

const styles = {
    container: { display: 'flex', justifyContent: 'center', width: '100%' },
    wrapper: { width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100 },
    header: { borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem', marginBottom: '2rem' },
    title: { margin: 0, color: '#fff' },
    link: { color: '#3b82f6', textDecoration: 'none' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' },
    customerInfo: { backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' },
    infoItem: { marginBottom: '1rem', fontSize: '0.95rem' },
    infoLabel: { color: '#888', display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' },
    appointmentList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    card: { backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid #333' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    serviceName: { margin: 0, fontSize: '1.1rem', color: '#fff' },
    statusBadge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' },
    noData: { textAlign: 'center', padding: '3rem', color: '#666', border: '2px dashed #333', borderRadius: '8px' },
};

const statusColors = {
    pending: '#ffc107',
    confirmed: '#28a745',
    in_progress: '#17a2b8',
    completed: '#6c757d',
    cancelled: '#dc3545'
};

const CustomerDetail = () => {
    const location = useLocation();
    const customer = location.state?.customer;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!customer) {
            setError('No customer data found. Please go back to the customers list.');
            setLoading(false);
            return;
        }

        const fetchAppointments = async () => {
            try {
                const response = await appointmentAPI.getShopAppointments();
                if (response.success) {
                    const customerAppointments = response.appointments.filter(
                        app => app.user_id === customer.user_id
                    );
                    setAppointments(customerAppointments);
                } else {
                    setError('Failed to load appointment history.');
                }
            } catch (err) {
                setError('An error occurred while fetching appointments.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [customer]);

    if (!customer) {
        return (
            <div style={styles.container}>
                <div style={styles.wrapper}>
                <div style={styles.noData}>
                    <h2>Customer Not Found</h2>
                    <p>{error}</p>
                    <Link to="/shop/customers" style={styles.link}>Back to Customers</Link>
                </div>
                </div>
            </div>
        );
    }

    // ✅ FIX 1: Removed the stray ); that was closing the return too early
    return (
        <div style={styles.container}>
            <div style={styles.wrapper} className="sf-anim-up">
            <div style={styles.header}>
                <h2 style={styles.title}>{customer.name}</h2>
                <Link to="/shop/customers" style={styles.link}>&larr; Back to Customer List</Link>
            </div>

            <div style={styles.grid}>
                <div style={styles.customerInfo}>
                    <h3>Customer Details</h3>
                    <div style={styles.infoItem}><span style={styles.infoLabel}>Email</span> {customer.email}</div>
                    <div style={styles.infoItem}><span style={styles.infoLabel}>Phone</span> {customer.phone || 'N/A'}</div>
                    <div style={styles.infoItem}><span style={styles.infoLabel}>Member Since</span> {customer.member_since ? new Date(customer.member_since).toLocaleDateString() : 'N/A'}</div>
                    <div style={styles.infoItem}><span style={styles.infoLabel}>Total Bookings</span> {customer.total_bookings}</div>
                    <div style={styles.infoItem}><span style={styles.infoLabel}>Last Visit</span> {timeAgo(customer.last_appointment || customer.last_visit)}</div>
                </div>

                <div>
                    <h3>Appointment History ({appointments.length})</h3>
                    {loading && <p>Loading history...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && (
                        appointments.length === 0 ? (
                            <div style={styles.noData}>No appointment history found for this customer.</div>
                        ) : (
                            <div style={styles.appointmentList}>
                                {appointments.map(app => (
                                    <div key={app.appointment_id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <h4 style={styles.serviceName}>{app.service_name}</h4>
                                            <span style={{ ...styles.statusBadge, backgroundColor: statusColors[app.status] || '#555', color: app.status === 'pending' ? 'black' : 'white' }}>{app.status}</span>
                                        </div>
                                        <div><strong>Device:</strong> {app.device_brand} {app.device_model}</div>
                                        <div><strong>Date:</strong> {new Date(app.appointment_date).toLocaleDateString()} at {app.appointment_time.slice(0, 5)}</div>
                                        <div><strong>Booking Ref:</strong> {app.booking_reference}</div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
            </div>
        </div>
        // ✅ FIX 2: Removed the misplaced ); that appeared here inside the JSX
    );
};

export default CustomerDetail;