import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('teachment_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('teachment_token', token);
      fetchCurrentUser();
    } else {
      localStorage.removeItem('teachment_token');
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.warn('Session check note:', err.message);
      if (err.message && (err.message.includes('401') || err.message.includes('token') || err.message.includes('denied'))) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('teachment_token', data.token);
      setToken(data.token);
      setUser(data.user);

      try {
        const me = await api.getMe();
        if (me?.user) setUser(me.user);
        if (me?.profile) setProfile(me.profile);
      } catch (e) {
        console.warn('Profile fetch after login:', e.message);
      }

      return data.user || data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await api.register(payload);
      localStorage.setItem('teachment_token', data.token);
      setToken(data.token);
      setUser(data.user);

      try {
        const me = await api.getMe();
        if (me?.user) setUser(me.user);
        if (me?.profile) setProfile(me.profile);
      } catch (e) {
        console.warn('Profile fetch after register:', e.message);
      }

      return data.user || data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('teachment_token');
    setToken('');
    setUser(null);
    setProfile(null);
  };

  // 1-Click Demo Account Switcher
  const switchDemoAccount = async (accountType) => {
    setLoading(true);
    try {
      // Try dedicated demo endpoint first (bulletproof, auto-recovering)
      const data = await api.demoLogin(accountType === 'school' ? 'school' : 'teacher');
      localStorage.setItem('teachment_token', data.token);
      setToken(data.token);
      setUser(data.user);

      try {
        const me = await api.getMe();
        if (me?.user) setUser(me.user);
        if (me?.profile) setProfile(me.profile);
      } catch (e) {
        console.warn('Profile fetch after demo login:', e.message);
      }

      return data.user || data;
    } catch (err) {
      console.warn('Demo endpoint failed, falling back to credentials:', err.message);
      let credentials = { email: 'teacher@teachment.com', password: 'password123' };
      if (accountType === 'school') {
        credentials = { email: 'teachment.tech@gmail.com', password: 'password123' };
      } else if (accountType === 'pooja') {
        credentials = { email: 'pooja.verma@gmail.com', password: 'password123' };
      }
      return await login(credentials.email, credentials.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
