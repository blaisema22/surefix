import React from 'react';

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#1e1e1e', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', border: '1px solid #444' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1.5rem' },
    title: { margin: 0, color: '#fff' },
    closeBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' },
    content: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', color: '#ccc' },
    label: { fontWeight: '600', color: '#888' },
    value: { color: '#fff', wordBreak: 'break-word' },
};

const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>User Details</h3>
                    <button style={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                <div style={styles.content}>
                    <span style={styles.label}>User ID:</span>
                    <span style={styles.value}>{user.user_id}</span>

                    <span style={styles.label}>Name:</span>
                    <span style={styles.value}>{user.name}</span>

                    <span style={styles.label}>Email:</span>
                    <span style={styles.value}>{user.email}</span>

                    <span style={styles.label}>Phone:</span>
                    <span style={styles.value}>{user.phone || 'N/A'}</span>

                    <span style={styles.label}>Role:</span>
                    <span style={{ ...styles.value, textTransform: 'capitalize' }}>{user.role}</span>

                    <span style={styles.label}>Status:</span>
                    <span style={{ ...styles.value, color: user.is_verified ? '#28a745' : '#dc3545' }}>
                        {user.is_verified ? 'Verified' : 'Not Verified'}
                    </span>

                    <span style={styles.label}>Joined:</span>
                    <span style={styles.value}>{new Date(user.created_at).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;