import React, { useState } from 'react';

const Navbar = ({ onNavigate, isLoggedIn, user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleNavClick = (e, page) => {
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span 
              className="text-2xl font-bold text-primary cursor-pointer hover:text-secondary transition-colors" 
              onClick={(e) => handleNavClick(e, 'home')}
            >
              SureFix
            </span>
          </div>

          {/* Navigation Menu */}
          <ul className="hidden md:flex gap-8 items-center">
            <li><a href="/" onClick={(e) => handleNavClick(e, 'home')} className="text-gray-700 hover:text-primary transition-colors">Home</a></li>
            <li><a href="/book-repair" onClick={(e) => handleNavClick(e, 'book-repair')} className="text-gray-700 hover:text-primary transition-colors">Book Repair</a></li>
            <li><a href="/find-shop" onClick={(e) => handleNavClick(e, 'find-shop')} className="text-gray-700 hover:text-primary transition-colors">Find Repair Shop</a></li>
            <li><a href="/about" onClick={(e) => handleNavClick(e, 'home')} className="text-gray-700 hover:text-primary transition-colors">About Us</a></li>
          </ul>

          {/* Search Box */}
          <div className="flex items-center gap-2 ml-4">
            <input 
              type="text" 
              placeholder="Search" 
              className="hidden sm:block px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <i className="fas fa-search"></i>
            </button>
          </div>

          {/* User Menu / Auth */}
          <div className="ml-4 flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primary">
                  <i className="fas fa-user-circle text-xl"></i>
                  <span className="hidden sm:inline font-semibold">{user?.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 bg-error text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={(e) => handleNavClick(e, 'login')}
                className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
