// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute
 *
 * Props:
 *  - requiredRole: string | string[]  (optional) role(s) allowed to access the route
 *  - fallbackPath: string             (optional) where to redirect when unauthorized (default: '/')
 *  - children: ReactNode              (optional) render children instead of <Outlet />
 *
 * Behavior:
 *  - Reads "user" from localStorage (safe JSON parse)
 *  - If no user => redirect to fallbackPath with state.from (so you can redirect back after login)
 *  - If user.exp (unix seconds) exists and is expired => clears user and redirect to fallbackPath
 *  - If requiredRole is provided and user.role doesn't match => redirect to fallbackPath
 *  - Otherwise renders nested routes via <Outlet/> (or children if provided)
 */
export default function ProtectedRoute({ requiredRole, fallbackPath = '/', children }) {
  const location = useLocation();

  // safe parse localStorage user
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    // malformed user in storage — clear it to avoid repeated errors
    console.warn('ProtectedRoute: failed to parse user from localStorage, clearing it.', err);
    localStorage.removeItem('user');
    user = null;
  }

  // Not logged in => redirect to login (with original location in state)
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If token expiry present (common field: exp in unix seconds), handle expiry
  // This is optional — only runs when user.exp exists and is a number
  if (user.exp && typeof user.exp === 'number') {
    const expiryMs = user.exp * 1000;
    if (Date.now() >= expiryMs) {
      // expired: remove user and redirect to login
      localStorage.removeItem('user');
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }
  }

  // Role check: requiredRole may be string or array of strings
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!allowed) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Allowed: either render children (if provided) or nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
}
