import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight, Search } from 'lucide-react';
import '../../styles/sf-pages.css';

const BookingPage = () => {
    return (
        <div className="sf-page" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sf-page-wrap">

                {/* Header */}
                <div className="sf-anim-up" style={{ marginBottom: 32 }}>
                    <span className="sf-eyebrow">Booking Center</span>
                    <h1 className="sf-page-title">Book a Repair</h1>
                    <p className="sf-page-sub">Find a repair centre near you to get started.</p>
                </div>

                {/* CTA card */}
                <div className="sf-glass sf-anim-up sf-s1" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    {/* Icon */}
                    <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#f97316', margin: '0 auto 20px',
                    }}>
                        <Wrench size={28} />
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.85)', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
                        Ready to fix something?
                    </h2>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.3)', maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.65 }}>
                        To book a repair, first find a certified repair centre near you, then select a service and schedule your appointment.
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/find-repair" className="sf-btn-primary" style={{ textDecoration: 'none', fontSize: 14, padding: '12px 28px' }}>
                            <Search size={15} /> Find Repair Centre
                        </Link>
                        <Link to="/customer/appointments" className="sf-btn-ghost" style={{ textDecoration: 'none', fontSize: 14, padding: '12px 24px' }}>
                            My Bookings <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Info tiles */}
                <div className="sf-anim-up sf-s2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
                    {[
                        { num: '1', title: 'Find a Centre', desc: 'Search verified repair shops near your location.' },
                        { num: '2', title: 'Choose a Service', desc: 'Select from available repair services and pricing.' },
                        { num: '3', title: 'Book Your Slot', desc: 'Pick a date and time that works best for you.' },
                    ].map(({ num, title, desc }) => (
                        <div key={num} style={{
                            padding: '18px 20px', borderRadius: 14,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(249,115,22,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: 'rgba(249,115,22,0.85)',
                                marginBottom: 10,
                            }}>{num}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 5 }}>{title}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.55 }}>{desc}</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default BookingPage;