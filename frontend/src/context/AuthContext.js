import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// API base URL configuration
// Priority: REACT_APP_API_URL env → same-host fallback (use current hostname with backend port)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;


const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_token'));

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('lms_user', JSON.stringify(userData));
    localStorage.setItem('lms_token', jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_token');
  };

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAdmin, 
      isTeacher,
      apiBaseUrl: API_BASE_URL 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 