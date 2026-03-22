import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Internal Icon component to ensure self-containment
const Icon = ({ d, size = 20, strokeWidth = 2, style, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
        strokeLinejoin="round" style={style} className={className}>
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const wrenchIcon = ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"];

const NavLink = ({ href, children }) => {
    const location = useLocation();
    const isActive = location.pathname === href;

    return (
        <Link to={href} style={{
            fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: isActive ? 700 : 600,
            letterSpacing: '0.04em',
            color: isActive ? 'var(--sf-white)' : 'var(--sf-text-2)', textDecoration: 'none',
            transition: 'color 0.2s',
        }}
            onMouseEnter={e => e.target.style.color = 'var(--sf-white)'}
            onMouseLeave={e => e.target.style.color = isActive ? 'var(--sf-white)' : 'var(--sf-text-2)'}
        >{children}</Link>
    );
};

const PublicNavbar = () => {
    return (
        <nav className="glass animate-in" style={{
            position: 'sticky', top: 0, zIndex: 100,
            borderBottom: '1px solid var(--sf-border)',
            padding: '16px 48px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--sf-grad)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: 'var(--shadow-blue)',
                }}>
                    <Icon d={wrenchIcon} size={18} strokeWidth={2.5} style={{ color: '#fff' }} />
                </div>
                <span style={{
                    fontFamily: 'Instrument Serif, serif', fontSize: 22, fontWeight: 400,
                    color: 'var(--sf-white)', letterSpacing: '-0.01em', fontStyle: 'italic'
                }}>SureFix</span>
            </Link>

            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                <NavLink href="/find-centres">Find Centers</NavLink>
                <NavLink href="/support">Support</NavLink>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <NavLink href="/login">Sign In</NavLink>
                <Link to="/register" className="btn btn-primary" style={{
                    borderRadius: 10, padding: '10px 22px', fontSize: 13, letterSpacing: '0.01em', fontWeight: 600, textTransform: 'none'
                }}>Get Started</Link>
            </div>
        </nav>
    );
};

export default PublicNavbar;