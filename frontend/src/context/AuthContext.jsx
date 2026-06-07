import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('citemind_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  const persist = (token, u) => {
    localStorage.setItem('citemind_token', token);
    localStorage.setItem('citemind_user', JSON.stringify(u));
    setUser(u);
  };

  const login = async (data) => {
    const res = await api.login(data);
    persist(res.data.token, res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    persist(res.data.token, res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('citemind_token');
    localStorage.removeItem('citemind_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
