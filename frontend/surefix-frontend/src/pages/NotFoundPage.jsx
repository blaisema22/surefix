import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const NotFoundPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <main className="flex items-center justify-center bg-[var(--sf-bg)] text-[var(--sf-text)]" style={{ minHeight: '100vh' }}>
            <div className="text-center max-w-md p-6">
                <div className="text-8xl font-black text-[var(--sf-blue)] opacity-30 tracking-tighter -mb-2">404</div>
                <h1 className="text-3xl font-bold text-[var(--sf-text)] m-0">Page Not Found</h1>
                <p className="text-[var(--sf-text-2)] mt-2 mb-8">
                    Sorry, the page you are looking for could not be found or has been moved.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary"
                    >
                        ← Go Back
                    </button>
                    <Link
                        to={user ? '/dashboard' : '/'}
                        className="btn btn-primary"
                    >
                        {user ? 'Go to Dashboard' : 'Go to Homepage'}
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default NotFoundPage;