import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vanatrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vanatrack_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token validity on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('vanatrack_token');
      if (savedToken) {
        try {
          const data = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('vanatrack_user', JSON.stringify(data.user));
        } catch (err) {
          console.warn('Session expired or token invalid');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('vanatrack_token', data.token);
      localStorage.setItem('vanatrack_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vanatrack_token');
    localStorage.removeItem('vanatrack_user');
  };

  // One-click quick role switcher for testing & evaluation
  const quickSwitchRole = async (targetRole) => {
    const roleCredentials = {
      admin: { email: 'admin@vanatrack.org', password: 'Admin@123' },
      project_manager: { email: 'manager@vanatrack.org', password: 'Manager@123' },
      viewer: { email: 'viewer@vanatrack.org', password: 'Viewer@123' },
    };

    const creds = roleCredentials[targetRole];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    quickSwitchRole,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isProjectManager: user?.role === 'project_manager',
    isViewer: user?.role === 'viewer',
    canManage: user?.role === 'admin' || user?.role === 'project_manager',
    canVerify: user?.role === 'admin' || user?.role === 'project_manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
