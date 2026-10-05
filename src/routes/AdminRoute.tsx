import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

// ─── AdminRoute ───────────────────────────────────────────────────────────────
// Guards admin-only routes.
// If not authenticated or user is not an admin → redirect to /dashboard.
// Otherwise → render the nested <Outlet />.

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // The session is restored asynchronously; redirecting before then would bounce a real admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#090C11]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
