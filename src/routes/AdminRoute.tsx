import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ─── AdminRoute ───────────────────────────────────────────────────────────────
// Guards admin-only routes.
// If not authenticated or user is not an admin → redirect to /dashboard.
// Otherwise → render the nested <Outlet />.

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
