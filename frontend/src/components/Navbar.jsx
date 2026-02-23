// Navbar Component
import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">SureFix</div>
        <ul className="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/devices">My Devices</a></li>
          <li><a href="/centres">Find Centres</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
