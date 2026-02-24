// Navbar Component
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    authService.logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">SureFix</Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/my-devices">My Devices</Link></li>
              <li><Link to="/find-centres">Find Centres</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
