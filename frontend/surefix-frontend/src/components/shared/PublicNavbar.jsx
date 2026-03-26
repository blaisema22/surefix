import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// Internal Icon component to ensure self-containment
const Icon = ({ d, size = 20, strokeWidth = 2, style, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
        strokeLinejoin="round" style={style} className={className}>
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const wrenchIcon = ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"];
const menuIcon = ["M3 12h18", "M3 6h18", "M3 18h18"];
const closeIcon = ["M18 6L6 18", "M6 6l12 12"];
const bellIcon = ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"];

const NavLink = ({ href, children }) => {
    const location = useLocation();
    const isActive = location.pathname === href;

    return (
        <Link to={href} style={{
            fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: isActive ? 700 : 600,
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
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();

    // Close mobile menu whenever route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <>
            <nav className="nav-glass animate-in sf-public-nav" style={{
                position: 'sticky', top: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', flexWrap: 'wrap'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'var(--sf-grad)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', boxShadow: 'var(--sf-shadow-blue)',
                    }}>
                        <Icon d={wrenchIcon} size={18} strokeWidth={2.5} style={{ color: '#fff' }} />
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400,
                        color: 'var(--sf-white)', letterSpacing: '-0.01em', fontStyle: 'italic'
                    }}>SureFix</span>
                </Link>

                <div className="sf-desktop-group" style={{ gap: 32 }}>
                    <NavLink href="/find-centres">Find Centers</NavLink>
                    <NavLink href="/support">Support</NavLink>
                </div>

                {user && location.pathname !== '/' ? (
                    <div className="sf-desktop-group" style={{ gap: 20 }}>
                        <Link to="/notifications" style={{ position: 'relative', color: 'var(--sf-text-2)', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--sf-white)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--sf-text-2)'}
                        >
                            <Icon d={bellIcon} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: -4, right: -8, background: '#ef4444', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0B1120' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/dashboard" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 22px', fontSize: 13, letterSpacing: '0.01em', fontWeight: 600, textTransform: 'none' }}>Dashboard</Link>
                    </div>
                ) : (
                    <div className="sf-desktop-group" style={{ gap: 16 }}>
                        <NavLink href="/login">Sign In</NavLink>
                        <Link to="/register" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 22px', fontSize: 13, letterSpacing: '0.01em', fontWeight: 600, textTransform: 'none' }}>Get Started</Link>
                    </div>
                )}

                {/* Mobile Toggle - Hidden as per user request */}
                <button className="sf-mobile-toggle" onClick={() => setIsOpen(!isOpen)}
                    style={{ background: 'none', border: 'none', color: 'var(--sf-text)', cursor: 'pointer', padding: 4, display: 'none' }}>
                    <Icon d={isOpen ? closeIcon : menuIcon} size={24} />
                </button>

                {/* Mobile Menu Content */}
                {isOpen && (
                    <div style={{
                        width: '100%', flexBasis: '100%', display: 'flex', flexDirection: 'column', gap: 24,
                        paddingTop: 24, paddingBottom: 8, borderTop: '1px solid var(--sf-border)', marginTop: 16,
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                            <NavLink href="/find-centres">Find Centers</NavLink>
                            <NavLink href="/support">Support</NavLink>
                            {user && location.pathname !== '/' ? (
                                <NavLink href="/dashboard">Dashboard</NavLink>
                            ) : (
                                <NavLink href="/login">Sign In</NavLink>
                            )}
                        </div>
                        {!user && (
                            <Link to="/register" className="btn btn-primary" style={{
                                borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, textTransform: 'none', justifyContent: 'center'
                            }}>Get Started</Link>
                        )}
                    </div>
                )}
            </nav>
        </>
    );
};

export default PublicNavbar;