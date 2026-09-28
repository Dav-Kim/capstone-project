// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import  {Api} from './services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('astrohub_active_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const saved = localStorage.getItem('astrohub_active_session');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    const crewList = await api.getCrew();
    const user = crewList.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
    );
    if (!user) {
      throw new Error('Access Denied: Invalid Orbital Credentials.');
    }
    setCurrentUser(user);
    localStorage.setItem('astrohub_active_session', JSON.stringify(user));
    return user;
  };

  const register = async (crewData) => {
    const crewList = await api.getCrew();
    const exists = crewList.some((c) => c.email.toLowerCase() === crewData.email.trim().toLowerCase());
    if (exists) {
      throw new Error('Registration Halted: Crew Member already registered in Sector database.');
    }
    const newCrew = {
      ...crewData,
      id: `c-${Date.now().toString().slice(-3)}`,
      oxygenQuota: crewData.oxygenQuota || 90
    };
    const saved = await api.registerCrew(newCrew);
    setCurrentUser(saved);
    localStorage.setItem('astrohub_active_session', JSON.stringify(saved));
    return saved;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('astrohub_active_session');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);