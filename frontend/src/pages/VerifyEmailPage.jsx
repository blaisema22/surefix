import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">SUREFIX</div>
        {status === 'verifying' && (
          <>
            <div className="page-loader"><div className="spinner" /></div>
            <p>Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, margin: '16px 0' }}><i className="fas fa-check-circle" style={{ color: 'var(--green)' }}></i></div>
            <h2 style={{ color: 'var(--green)', marginBottom: 12 }}>Email Verified!</h2>
            <p style={{ marginBottom: 24 }}>Your account is now active. You can sign in to start booking appointments.</p>
            <Link to="/login" className="btn btn-primary">Sign In →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, margin: '16px 0' }}><i className="fas fa-times-circle" style={{ color: 'var(--accent)' }}></i></div>
            <h2 style={{ color: 'var(--accent)', marginBottom: 12 }}>Verification Failed</h2>
            <p style={{ marginBottom: 24 }}>The verification link is invalid or has expired.</p>
            <Link to="/register" className="btn btn-secondary">Back to Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
