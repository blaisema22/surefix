// Landing Page
import React from 'react';

const Landing = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Welcome to SureFix</h1>
        <p>Your trusted mobile repair service</p>
        <button className="btn-cta">Get Started</button>
      </section>
      <section className="features">
        <h2>Why Choose SureFix?</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Quick Service</h3>
            <p>Fast repair times at verified centres</p>
          </div>
          <div className="feature">
            <h3>Trusted Centres</h3>
            <p>Only certified repair centres</p>
          </div>
          <div className="feature">
            <h3>Easy Booking</h3>
            <p>Book appointments in minutes</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
