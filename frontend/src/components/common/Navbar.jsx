import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const roleHome = user?.role === 'admin' ? '/admin' : user?.role === 'repairer' ? '/repairer' : '/dashboard';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={user ? roleHome : '/'} className="navbar-brand">SUREFIX</Link>

        <div className="navbar-links">
          <NavLink to="/search" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Find Centres
          </NavLink>

          {/* Customer links */}
          {user?.role === 'customer' && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/devices" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>My Devices</NavLink>
              <NavLink to="/appointments" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Appointments</NavLink>
            </>
          )}

          {/* Repairer links */}
          {user?.role === 'repairer' && (
            <NavLink to="/repairer" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>My Dashboard</NavLink>
          )}

          {/* Admin links */}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-cogs"></i> Admin Panel
            </NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <NavLink to="/profile" className="btn btn-ghost btn-sm">
                {user.role === 'admin' ? <i className="fas fa-cogs"></i> : user.role === 'repairer' ? <i className="fas fa-wrench"></i> : <i className="fas fa-user"></i>} {user.name?.split(' ')[0]}
              </NavLink>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
