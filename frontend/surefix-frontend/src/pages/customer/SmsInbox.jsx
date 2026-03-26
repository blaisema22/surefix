import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, Trash2, Phone, Mail, Clock, Download } from 'lucide-react';
import smsAPI from '../../api/sms.api';
import '../../styles/sf-pages.css';

const SmsInbox = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMessages = async () => {
        try {
            setRefreshing(true);
            const res = await smsAPI.getSmsSimulator();
            if (res.success) {
                setMessages(res.messages || []);
            }
        } catch (err) {
            addToast('Failed to load SMS', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const clearAll = async () => {
        if (!window.confirm('Clear all SMS messages?')) return;
        try {
            await smsAPI.clearSmsSimulator();
            setMessages([]);
            addToast('SMS cleared', 'success');
        } catch {
            addToast('Failed to clear SMS', 'error');
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const formatDate = (iso) => {
        const date = new Date(iso);
        return date.toLocaleString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPhone = (phone) => phone?.replace(/^\+250/, '0') || 'Unknown';

    if (loading) {
        return (
            <div className="sf-page">
                <div className="sf-page-wrap" style={{ padding: '100px 0', textAlign: 'center' }}>
                    <div className="sf-spinner-lg" style={{ margin: 0 }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 13 }}>Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sf-page">
            <div className="sf-page-wrap" style={{ paddingBottom: 120 }}>
                <div className="sf-anim-up" style={{ marginBottom: 32 }}>
                    <span className="sf-eyebrow">SMS Inbox</span>
                    <h1 className="sf-page-title">Messages ({messages.length})</h1>
                    <p className="sf-page-sub">
                        All SMS notifications sent to <strong>{formatPhone(user?.phone)}</strong>
                        {user?.phone ? '' : ' ⚠️ Add phone in Profile for SMS'}
                    </p>
                </div>

                {messages.length === 0 ? (
                    <div className="sf-empty-state" style={{ padding: '80px 32px', textAlign: 'center' }}>
                        <Phone size={48} color="rgba(255,255,255,0.1)" />
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.6)', margin: '16px 0 8px' }}>No messages yet</h2>
                        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.3)', maxWidth: 360, lineHeight: 1.6, margin: '0 auto 24px' }}>
                            SMS notifications will appear here when you book appointments or receive updates.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="sf-btn-primary" onClick={loadMessages} style={{ padding: '10px 24px' }}>
                                <RefreshCw size={15} /> Refresh
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="sf-glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={16} color="#f97316" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>SMS ({messages.length})</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Sent to {formatPhone(messages[0]?.phone_number)}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="sf-btn-ghost" onClick={loadMessages} disabled={refreshing}>
                                    {refreshing ? <RefreshCw size={14} className="sf-spin" /> : <RefreshCw size={14} />}
                                </button>
                                <button className="sf-btn-danger" onClick={clearAll} style={{ padding: '6px 12px', fontSize: 12 }}>
                                    <Trash2 size={14} /> Clear
                                </button>
                            </div>
                        </div>

                        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                            {messages.map((msg, i) => (
                                <div key={msg.id || i} style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    transition: 'background 0.2s'
                                }} className="sf-hover-light">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                                            {msg.type?.charAt(0).toUpperCase() + msg.type?.slice(1) || 'Message'}
                                            {msg.appointment_id && (
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>Ref: #{msg.appointment_id}</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            {formatDate(msg.created_at)}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)',
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                        fontFamily: 'system-ui, -apple-system, sans-serif'
                                    }}>
                                        {msg.message}
                                    </div>
                                    {msg.status && (
                                        <div style={{ fontSize: 11, color: msg.status === 'sent' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)', marginTop: 8 }}>
                                            ✓ {msg.status.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmsInbox;

