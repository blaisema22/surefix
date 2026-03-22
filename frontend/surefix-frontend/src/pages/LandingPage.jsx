import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import PublicNavbar from '../components/shared/PublicNavbar';

// ─── Design tokens ──────────────────────────────────────────────────────────
const CSS = `
  /* Landing-specific custom animations/utilities only */
  @keyframes letterDrop {
    0%   { opacity: 0; transform: translateY(-40px) rotateX(90deg); filter: blur(8px); }
    60%  { opacity: 1; transform: translateY(4px) rotateX(-8deg); filter: blur(0); }
    100% { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  .redefined-word {
    display: inline-block;
    perspective: 600px;
  }
  .redefined-letter {
    display: inline-block;
    background: linear-gradient(135deg, #3b82f6, #06b6d4, #a78bfa, #3b82f6);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: letterDrop 0.6s var(--sf-ease) both, gradientShift 4s ease infinite;
  }
  .redefined-cursor {
    display: inline-block;
    width: 3px;
    height: 0.8em;
    background: var(--sf-cyan);
    border-radius: 2px;
    margin-left: 5px;
    vertical-align: middle;
    animation: cursorBlink 1s ease infinite;
    opacity: 1;
  }

  /* Noise overlay */
  .noise::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }
`;

// ─── Icons (inline SVG so no external dep needed) ──────────────────────────
const Icon = ({ d, size = 20, strokeWidth = 2, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" style={style} className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  wrench: ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"],
  search: ["M21 21l-4.35-4.35", "M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  zap: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"],
  bell: ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  play: ["M5 3l14 9-14 9V3z"],
  check: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "m9 11 3 3L22 4"],
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 7m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0"],
  star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
};

// ─── Sub-components ─────────────────────────────────────────────────────────
const FeatureCard = ({ iconKey, title, desc, delay, color }) => (
  <div className="glass-card animate-slide-up"
    style={{ animationDelay: delay, padding: '2rem' }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 24, background: `${color}18`, color
    }}>
      <Icon d={icons[iconKey]} size={22} />
    </div>
    <h3 style={{
      fontSize: 17, fontFamily: 'var(--font-sans)', fontWeight: 700,
      color: 'var(--sf-white)', marginBottom: 12, letterSpacing: '-0.02em'
    }}>{title}</h3>
    <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--sf-text)', fontWeight: 400 }}>{desc}</p>
  </div>
);

const FooterLink = ({ href, children }) => (
  <a href={href} style={{
    fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 500,
    color: '#475569', textDecoration: 'none', transition: 'color 0.2s'
  }}
    onMouseEnter={e => e.target.style.color = 'var(--sf-blue)'}
    onMouseLeave={e => e.target.style.color = '#475569'}
  >{children}</a>
);

// ─── Cycling animated headline word ─────────────────────────────────────────
const WORDS = ['Redefined.', 'Reimagined.', 'Elevated.', 'Perfected.', 'Simplified.'];

const AnimatedWord = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [key, setKey] = useState(0); // forces re-mount → re-runs animation

  useEffect(() => {
    const cycle = setInterval(() => {
      // 1. fade / exit letters
      setVisible(false);
      setTimeout(() => {
        // 2. swap word + re-trigger letter animations
        setIndex(i => (i + 1) % WORDS.length);
        setKey(k => k + 1);
        setVisible(true);
      }, 400); // exit duration
    }, 5000);
    return () => clearInterval(cycle);
  }, []);

  const word = WORDS[index];

  return (
    <span className="redefined-word" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
      {word.split('').map((ch, i) => (
        <span
          key={`${key}-${i}`}
          className="redefined-letter"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
      <span className="redefined-cursor" />
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--sf-base)', overflowX: 'hidden', position: 'relative' }}>

        {/* Ambient lights */}
        <div style={{
          position: 'fixed', top: '-10%', left: '-10%',
          width: '50%', height: '50%', background: 'rgba(59,130,246,0.05)',
          filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0
        }} />
        <div style={{
          position: 'fixed', bottom: 0, right: 0,
          width: '40%', height: '40%', background: 'rgba(6,182,212,0.04)',
          filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0
        }} />

        {/* ── NAV ── */}
        <PublicNavbar />

        <main style={{ position: 'relative', zIndex: 10 }}>

          {/* ── HERO ── */}
          <section style={{ padding: '96px 48px 128px', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

              {/* Badge */}
              <div className="animate-slide-up" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.22)',
                padding: '8px 18px', borderRadius: 99, marginBottom: 40,
              }}>
                <span className="animate-pulse" style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--sf-blue)',
                  display: 'inline-block'
                }} />
                <span style={{
                  fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 600,
                  letterSpacing: '0.06em', color: 'var(--sf-blue)'
                }}>
                  Trusted by 12,000+ Premium Clients
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-slide-up" style={{
                fontFamily: 'var(--font-serif)', fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                fontWeight: 400, color: 'var(--sf-white)', letterSpacing: '-0.02em',
                lineHeight: 1.0, marginBottom: 28, animationDelay: '0.1s'
              }}>
                Device Repair.<br />
                <AnimatedWord />
              </h1>

              {/* Sub */}
              <p className="animate-slide-up" style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', color: 'var(--sf-text)', fontWeight: 400,
                maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.8, animationDelay: '0.2s'
              }}>
                The specialized ecosystem connecting hardware owners with certified technicians.
                Book instantly, track progress in real-time, and experience professional-grade results.
              </p>

              {/* CTAs */}
              <div className="animate-slide-up" style={{
                display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
                animationDelay: '0.3s'
              }}>
                <Link to="/find-centres" className="btn btn-primary" style={{ borderRadius: 12, padding: '16px 32px', fontSize: 15, fontWeight: 600, letterSpacing: '0', textTransform: 'none' }}>
                  <Icon d={icons.search} size={17} /> Find Service Point
                </Link>
                <Link to="/register" className="glass btn" style={{
                  borderRadius: 12, padding: '16px 32px', fontSize: 15,
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, letterSpacing: '0',
                  textTransform: 'none', color: 'var(--sf-white)',
                  border: '1px solid var(--sf-border)',
                }}>
                  Partner Network <Icon d={icons.arrow} size={17} />
                </Link>
              </div>

              {/* Stats */}
              <div className="animate-slide-up" style={{
                marginTop: 80,
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 32, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto',
                animationDelay: '0.45s'
              }}>
                {[
                  { val: '2.4k+', label: 'Certified Centers' },
                  { val: '98%', label: 'Satisfaction Rate' },
                  { val: '< 24h', label: 'Avg. Turnaround' },
                  { val: '1M+', label: 'Repairs Done' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400,
                      color: 'var(--sf-white)', letterSpacing: '-0.01em'
                    }}>{s.val}</div>
                    <div style={{
                      fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
                      letterSpacing: '0.03em',
                      color: '#475569', marginTop: 8
                    }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section style={{ padding: '96px 48px', position: 'relative' }}>
            {/* Divider line */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 1, height: 96, background: 'linear-gradient(to bottom, transparent, var(--sf-border))'
            }} />

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <span style={{
                  fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sf-blue)',
                  display: 'block', marginBottom: 16
                }}>Engineered Excellence</span>
                <h2 style={{
                  fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  fontWeight: 400, color: 'var(--sf-white)', letterSpacing: '-0.01em', marginBottom: 16
                }}>
                  Designed for Reliability
                </h2>
                <p style={{ color: 'var(--sf-text)', maxWidth: 520, margin: '0 auto', fontWeight: 400, lineHeight: 1.75, fontSize: 15 }}>
                  We've eliminated the friction in device repair through a unified technological platform.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                <FeatureCard iconKey="zap" color="var(--sf-blue)"
                  title="Instant Matching"
                  desc="Proprietary algorithms find the best-equipped centers for your specific device model and issue instantly."
                  delay="0.1s" />
                <FeatureCard iconKey="shield" color="var(--sf-cyan)"
                  title="Certified Parts"
                  desc="All SureFix partner centers are required to use genuine components and follow industry-standard procedures."
                  delay="0.2s" />
                <FeatureCard iconKey="bell" color="var(--sf-purple)"
                  title="Real-time Tracking"
                  desc="Receive live updates as your device moves from diagnostics, through repair, to final quality assurance."
                  delay="0.3s" />
              </div>
            </div>
          </section>

          {/* ── WORKFLOW ── */}
          <section style={{
            padding: '96px 48px',
            background: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid var(--sf-border)',
            borderBottom: '1px solid var(--sf-border)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center'
            }}>
              {/* Left */}
              <div>
                <span style={{
                  fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sf-cyan)',
                  display: 'block', marginBottom: 20
                }}>Seamless Journey</span>
                <h2 style={{
                  fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3vw, 2.75rem)',
                  fontWeight: 400, color: 'var(--sf-white)', letterSpacing: '-0.01em', lineHeight: 1.2,
                  marginBottom: 48
                }}>How SureFix Elevates Your Repair Experience</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {[
                    { t: 'Secure Diagnostics', d: 'Book a professional evaluation at a time that works for you.' },
                    { t: 'Transparent Quoting', d: 'Receive detailed cost breakdowns before any work begins.' },
                    { t: 'Certified Completion', d: 'All repairs are backed by our network-wide guarantee.' },
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                      <div className="glass" style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 18,
                        color: 'var(--sf-blue)', fontStyle: 'italic',
                      }}>0{i + 1}</div>
                      <div>
                        <h4 style={{
                          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
                          color: 'var(--sf-white)', marginBottom: 6
                        }}>{step.t}</h4>
                        <p style={{ fontSize: 14, color: 'var(--sf-text)', fontWeight: 400, lineHeight: 1.75 }}>{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — visual card */}
              <div className="animate-scale-in" style={{ position: 'relative' }}>
                {/* Glow blobs */}
                <div style={{
                  position: 'absolute', top: -40, right: -40, width: 160, height: 160,
                  background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0
                }} />
                <div style={{
                  position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
                  background: 'rgba(6,182,212,0.1)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0
                }} />

                <div className="glass-card" style={{
                  padding: 16, aspectRatio: '1', borderRadius: 48,
                  position: 'relative', zIndex: 1, overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(59,130,246,0.06)',
                    borderRadius: 48, transition: 'background 0.3s',
                  }} />
                  <div style={{
                    width: '100%', height: '100%', borderRadius: 38,
                    background: 'rgba(8,12,20,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {/* Mini mock UI */}
                    <div style={{ width: '80%' }}>
                      {[
                        { label: 'Diagnostics', status: 'Complete', color: '#22d3ee' },
                        { label: 'Parts Ordered', status: 'In Progress', color: 'var(--sf-blue)' },
                        { label: 'Final QA', status: 'Pending', color: '#475569' },
                      ].map((row, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 18px', marginBottom: 8,
                          background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                          border: '1px solid rgba(255,255,255,0.06)',
                          animation: `slideUp 0.6s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.15}s both`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
                            <span style={{
                              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                              color: 'var(--sf-white)'
                            }}>{row.label}</span>
                          </div>
                          <span style={{
                            fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 600,
                            color: row.color, letterSpacing: '0.02em'
                          }}>{row.status}</span>
                        </div>
                      ))}
                      <div style={{
                        marginTop: 20, textAlign: 'center', padding: '14px',
                        background: 'var(--sf-grad)', borderRadius: 12,
                        fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                        color: '#fff', letterSpacing: '0.01em',
                        boxShadow: 'var(--sf-shadow-blue)',
                        animation: 'slideUp 0.6s var(--sf-ease) 0.75s both',
                      }}>Track My Device</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{ padding: '96px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 600, height: 400,
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div className="glass-card" style={{
              maxWidth: 720, margin: '0 auto', padding: '80px 64px',
              background: 'var(--sf-grad-subtle)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative corner accent */}
              <div style={{
                position: 'absolute', top: -1, left: -1, right: -1,
                height: 2, background: 'var(--sf-grad)', borderRadius: '24px 24px 0 0'
              }} />

              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 700, color: 'var(--sf-white)', letterSpacing: '-0.03em', marginBottom: 16
              }}>
                Ready for a better fix?
              </h2>
              <p style={{ fontSize: 17, color: '#94a3b8', fontWeight: 300, marginBottom: 48 }}>
                Join the future of professional hardware maintenance today.
              </p>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/register" className="btn btn-primary" style={{ borderRadius: 18, padding: '16px 40px' }}>
                  Get Started
                </a>
                <a href="/find-centres" className="glass btn" style={{
                  borderRadius: 18, padding: '16px 40px', fontSize: 12,
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: 'var(--sf-white)',
                  border: '1px solid var(--sf-border)',
                }}>
                  Explore Centers
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer className="sf-footer" style={{
          padding: '64px 48px',
          borderTop: '1px solid var(--sf-border)',
          position: 'relative', zIndex: 20
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40
          }}>
            <div>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'var(--sf-grad)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', boxShadow: 'var(--shadow-blue)',
                }}>
                  <Icon d={icons.wrench} size={15} strokeWidth={2.5} style={{ color: '#fff' }} />
                </div>
                <span style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800,
                  color: 'var(--sf-white)', letterSpacing: '-0.03em'
                }}>SureFix</span>
              </a>
              <p style={{
                fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: '#334155'
              }}>
                © 2026 SureFix Ecosystem · All Rights Reserved
              </p>
            </div>

            <div style={{ display: 'flex', gap: 64 }}>
              {[
                { heading: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
                { heading: 'Social', links: [['Twitter', '#'], ['LinkedIn', '#']] },
              ].map(col => (
                <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{
                    fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
                    marginBottom: 4
                  }}>{col.heading}</span>
                  {col.links.map(([label, href]) => (
                    <FooterLink key={label} href={href}>{label}</FooterLink>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;