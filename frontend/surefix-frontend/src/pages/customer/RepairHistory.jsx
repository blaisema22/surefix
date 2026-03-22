import React, { useState } from 'react';
import { appointmentAPI } from '@/api/appointments.api';
import { Download, Loader2, Calendar } from 'lucide-react';
import AppointmentsPage from './AppointmentsPage';
import '../../styles/sf-pages.css';

export default function RepairHistory() {
    const [exporting, setExporting] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await appointmentAPI.getMyCustomerAppointments();
            if (response.data.success) {
                let history = (response.data.appointments || []).filter(a => a.status === 'completed');
                if (startDate) history = history.filter(a => new Date(a.appointment_date) >= new Date(startDate));
                if (endDate) history = history.filter(a => new Date(a.appointment_date) <= new Date(endDate));

                if (!history.length) { alert('No completed repairs found in this date range.'); return; }

                const headers = ['Date', 'Time', 'Service', 'Device', 'Centre', 'Status', 'Rating'];
                const rows = [
                    headers.join(','),
                    ...history.map(a => [
                        a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : '',
                        a.appointment_time || '',
                        `"${(a.service_name || '').replace(/"/g, '""')}"`,
                        `"${((a.device_brand || '') + ' ' + (a.device_model || '')).trim().replace(/"/g, '""')}"`,
                        `"${(a.centre_name || '').replace(/"/g, '""')}"`,
                        a.status,
                        a.rating || '',
                    ].join(','))
                ];

                const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `repair_history_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) { console.error(err); alert('Failed to export history.'); }
        finally { setExporting(false); }
    };

    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">

                {/* Header with export controls */}
                <div className="sf-anim-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                    <div>
                        <span className="sf-eyebrow">Service Records</span>
                        <h1 className="sf-page-title">Repair History</h1>
                        <p className="sf-page-sub">All your completed repair sessions in one place.</p>
                    </div>

                    {/* Export bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div className="sf-date-range-wrap">
                            <Calendar size={13} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                placeholder="From"
                            />
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>–</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                placeholder="To"
                            />
                        </div>
                        <button className="sf-btn-primary" onClick={handleExport} disabled={exporting}>
                            {exporting
                                ? <><Loader2 size={14} style={{ animation: 'sf-spin 0.7s linear infinite' }} />Exporting…</>
                                : <><Download size={14} />Export CSV</>
                            }
                        </button>
                    </div>
                </div>

                {/* Delegate list to AppointmentsPage in history mode */}
                <AppointmentsPage historyOnly />

            </div>
        </div>
    );
}