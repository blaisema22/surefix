// AuthContext
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
