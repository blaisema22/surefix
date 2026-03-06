import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { centreAPI } from '../utils/api';
import toast from 'react-hot-toast';

const landingPageStyles = `
  .lp-nav {
    position: sticky; top: 0; z-index: 100;
    background: #fff; border-bottom: 1px solid #e4eaf6;
    display: flex; align-items: center;
    padding: 0 40px; height: 62px; gap: 0;
    box-shadow: 0 2px 12px rgba(30,60,120,0.07);
  }
  .lp-nav-logo {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; font-style: italic;
    color: #1a2f5a; margin-right: 48px; text-decoration: none;
  }
  .lp-nav-links { display: flex; gap: 4px; flex: 1; }
  .lp-nav-link {
    padding: 8px 16px; border-radius: 8px;
    font-size: 14px; font-weight: 500; color: #4a5e82;
    cursor: pointer; border: none; background: transparent;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
    text-decoration: none; display: inline-block;
  }
  .lp-nav-link:hover { background: #f0f4ff; color: #1a2f5a; }
  .lp-nav-link.active { color: #1a2f5a; font-weight: 700; }
  .lp-nav-right { display: flex; align-items: center; gap: 12px; }
  .lp-nav-search {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid #dde5f5; border-radius: 8px;
    padding: 7px 14px; font-size: 13px; color: #99aac5;
    background: #f8fafd; width: 190px;
  }
  .lp-nav-search input {
    border: none; background: transparent; outline: none;
    font-size: 13px; color: #2a3f6a; width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-nav-signin {
    background: #1a2f5a; color: #fff; border: none;
    border-radius: 8px; padding: 9px 22px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: background 0.15s;
    text-decoration: none;
  }
  .lp-nav-signin:hover { background: #3a6fd8; }
`;

const features = [
  { icon: 'fa-search', title: 'Find Repair Centres', desc: 'Search nearby repair shops by location with GPS-powered instant results.' },
  { icon: 'fa-calendar-check', title: 'Book Appointments', desc: 'Choose your date and time slot. No phone calls, no waiting in queue.' },
  { icon: 'fa-mobile-alt', title: 'Register Your Device', desc: 'Add your devices with their issues and maintain a full repair history.' },
  { icon: 'fa-envelope', title: 'Email Confirmations', desc: 'Automatic confirmation emails sent the moment your booking is made.' },
  { icon: 'fa-times-circle', title: 'Easy Cancellations', desc: 'Cancel or reschedule directly from your dashboard anytime.' },
  { icon: 'fa-clipboard-list', title: 'Service Catalog', desc: 'Browse services before you commit to anything.' },
];

const stats = [
  { number: '100+', label: 'Repair Centres' },
  { number: '5,000+', label: 'Bookings Made' },
  { number: '98%', label: 'Satisfaction' },
  { number: '24/7', label: 'Online Booking' },
];

const steps = [
  { step: '01', icon: 'fa-user-plus', title: 'Create Your Account', desc: 'Sign up for free in under a minute. No credit card required.' },
  { step: '02', icon: 'fa-search-location', title: 'Find a Repair Centre', desc: 'Search by location or browse our network of trusted shops.' },
  { step: '03', icon: 'fa-calendar-check', title: 'Book & Get Confirmed', desc: 'Pick a time slot and receive an instant confirmation email.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [centresData, setCentresData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState(0);
  const [loadingCenters, setLoadingCenters] = useState(true);

  const handleBookingCTA = () => {
    if (user) {
      navigate('/search');
    } else {
      setShowAuthPrompt(true);
      setTimeout(() => {
        document.getElementById('auth-prompt')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoadingCenters(true);
    centreAPI.getAll()
      .then(res => {
        if (!isMounted) return;
        setCentresData(res.data.centres || []);
      })
      .catch(err => {
        console.error('Failed to load centres', err);
        toast.error('Unable to load repair centres right now.');
      })
      .finally(() => {
        if (isMounted) setLoadingCenters(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filteredCentres = useMemo(() => {
    if (!searchTerm.trim()) return centresData;
    const query = searchTerm.toLowerCase();
    return centresData.filter(c =>
      (c.name || '').toLowerCase().includes(query)
      || (c.address || '').toLowerCase().includes(query)
      || (c.district || '').toLowerCase().includes(query)
    );
  }, [searchTerm, centresData]);

  const centre = filteredCentres[selectedCenter] || filteredCentres[0] || {};
  const mapSrc = centre.latitude && centre.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${centre.latitude},${centre.longitude}&zoom=15`
    : '';

  return (
    <>
      <style>{landingPageStyles}</style>

      {/* â”€â”€ LANDING PAGE NAVBAR â”€â”€ */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-logo">SureFix</Link>
        <div className="lp-nav-links">
          <Link to="/" className="lp-nav-link active">Home</Link>
          <Link to="/search" className="lp-nav-link">Find Repair Shop</Link>
        </div>
        <div className="lp-nav-right">
          <div className="lp-nav-search">
            <input placeholder="Search" />
            <span style={{ color: "#6b88b8", fontSize: 14 }}>ðŸ”</span>
          </div>
          {user ? (
            <Link to="/dashboard" className="lp-nav-signin">My Dashboard</Link>
          ) : (
            <Link to="/login" className="lp-nav-signin">Sign In</Link>
          )}
        </div>
      </nav>

      <div style={{ paddingTop: 0 }}>

      {/* HERO */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(233,69,96,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(233,69,96,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          top: '-200px', left: '-200px',
          background: 'radial-gradient(circle, rgba(233,69,96,0.1) 0%, transparent 70%)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          bottom: '-100px', right: '10%',
          background: 'radial-gradient(circle, rgba(74,144,226,0.06) 0%, transparent 70%)', zIndex: 0,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

            {/* Left text */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.25)',
                borderRadius: 20, padding: '6px 14px',
                fontSize: 12, color: 'var(--accent)', fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24,
              }}>
                <i className="fas fa-globe-africa"></i> Built for Rwanda
              </div>

              <h1 style={{ color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.1 }}>
                Repair Your<br />
                <span style={{ color: 'var(--accent)' }}>Electronics</span><br />
                the Smart Way
              </h1>

              <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.8, maxWidth: 460 }}>
                Book repair appointments online at trusted centres across Kigali.
                No phone calls. No walk-ins. Just a few clicks.
              </p>

              {user ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/search" className="btn btn-primary btn-lg"><i className="fas fa-search"></i> Find Repair Centres</Link>
                  <Link to="/dashboard" className="btn btn-secondary btn-lg">My Dashboard â†’</Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn btn-primary btn-lg">Get Started Free â†’</Link>
                    <button onClick={handleBookingCTA} className="btn btn-secondary btn-lg"><i className="fas fa-wrench"></i> Book a Repair</button>
                  </div>
                  <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in â†’</Link>
                  </p>
                </>
              )}
            </div>

            {/* Right: mock confirmation card */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', top: 20, left: '5%', right: '5%', bottom: -20,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 16, transform: 'rotate(2deg)', opacity: 0.5,
              }} />
              <div style={{
                position: 'relative', width: '100%',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 28,
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--accent)', marginBottom: 16, letterSpacing: 1 }}>
                  APPOINTMENT CONFIRMED
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  iPhone 14 Screen Repair
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  <i className="fas fa-map-marker-alt"></i> TechFix Kigali, Remera
                </div>
                {[
                  ['Date', 'Monday, March 10, 2026'],
                  ['Time', '10:00 AM'],
                  ['Reference', 'SFAB12CD34'],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 20, padding: '10px 16px',
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)',
                  borderRadius: 8, fontSize: 13, color: '#4ade80',
                }}>
                  <i className="fas fa-check-circle"></i> Confirmation email sent
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{
                padding: '32px 24px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Get your device repaired in 3 simple steps
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                padding: '40px 32px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                position: 'relative',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '4rem',
                  color: 'rgba(233,69,96,0.08)', position: 'absolute',
                  top: 16, left: 24, lineHeight: 1, userSelect: 'none',
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 40, marginBottom: 20, position: 'relative' }}><i className={`fas ${s.icon}`}></i></div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, fontSize: '1.1rem' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Everything You Need</h2>
            <p style={{ color: 'var(--text-secondary)' }}>A complete platform built for electronic repair in Rwanda</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}><i className={`fas ${f.icon}`}></i></div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 12 }}>Instant Repair Centre Search</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Jump directly to the live search list powered by our database.
          </p>
          <Link to="/search" className="btn btn-primary btn-lg">
            <i className="fas fa-search"></i> Visit Repair Search
          </Link>
        </div>
      </section>

      {/* AUTH PROMPT â€” shown to non-logged-in users */}
      {!user && (
        <section id="auth-prompt" style={{
          padding: '100px 0',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}><i className="fas fa-lock"></i></div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
              Ready to Book Your Repair?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.8, maxWidth: 520, margin: '0 auto 40px' }}>
              To book a repair appointment, you need a SureFix account.
              It's completely free and takes less than 60 seconds to create.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ minWidth: 220 }}>
                <i className="fas fa-magic"></i> Create Free Account
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ minWidth: 220 }}>
                Sign In to Book â†’
              </Link>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, maxWidth: 500, margin: '0 auto',
              textAlign: 'left',
            }}>
              {[
                <><i className="fas fa-check"></i> Free to create an account</>,
                <><i className="fas fa-check"></i> Book in under 2 minutes</>,
                <><i className="fas fa-check"></i> Instant email confirmation</>,
                <><i className="fas fa-check"></i> Cancel anytime from dashboard</>,
              ].map((b, i) => (
                <div key={i} style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{b}</div>
              ))}
            </div>

            {showAuthPrompt && (
              <div style={{
                marginTop: 32, padding: '14px 24px',
                background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)',
                borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--accent)',
              }}>
                <i className="fas fa-hand-point-up"></i> Please sign up or log in first to book a repair appointment
              </div>
            )}
          </div>
        </section>
      )}

      {/* LOGGED-IN CTA */}
      {user && (
        <section style={{ padding: '80px 0', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>
              Welcome back, <span style={{ color: 'var(--accent)' }}>{user.name?.split(' ')[0]}</span>!
            </h2>
            <p style={{ marginBottom: 32 }}>Ready to book your next repair?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/search" className="btn btn-primary btn-lg"><i className="fas fa-search"></i> Find Repair Centres</Link>
              <Link to="/appointments" className="btn btn-secondary btn-lg"><i className="fas fa-calendar"></i> My Appointments</Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '1.3rem', marginBottom: 4 }}>SUREFIX</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Electronic Repair Appointment System â€” Kigali, Rwanda</p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/search" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Find Centres</Link>
            {!user ? (
              <>
                <Link to="/register" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign Up</Link>
                <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Login</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dashboard</Link>
                <Link to="/appointments" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Appointments</Link>
              </>
            )}
          </div>
        </div>
        <div className="container" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Â© {new Date().getFullYear()} SureFix Â· Team KBM â€” Manishimwe Blaise Â· Keza Kevine Â· Nikuzwe Marie Mercie
          </p>
        </div>
      </footer>
   </div></> 
  );
  }

