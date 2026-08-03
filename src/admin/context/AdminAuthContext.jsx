import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * AdminAuthContext now derives the admin session from the main app's
 * localStorage user (set by authService.login). The separate admin
 * login page has been removed — admins log in through /login.
 */
const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      const user   = stored ? JSON.parse(stored) : null;
      return user?.role === 'admin' ? user : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};
