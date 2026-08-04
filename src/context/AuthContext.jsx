import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, logoutUser } from '../service/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.status === 'success' && res.data) setUser(res.data);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (email, password, remember) => {
    const res = await loginUser(email, password, remember);
    if (res.status === 'success' && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
