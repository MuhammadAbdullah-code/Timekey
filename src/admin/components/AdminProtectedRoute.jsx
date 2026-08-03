import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Protects admin routes by checking the logged-in user's role.
 * Reads from localStorage (set by authService.login).
 * Redirects non-admins to /login instead of the old /admin-access page.
 */
const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();

  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  if (!user) {
    // Not logged in at all — go to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Logged in but not an admin — go to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
