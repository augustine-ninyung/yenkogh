import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { useLocation } from 'react-router-dom';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Guards routes that require authentication.
// While auth state is loading → show full-page spinner.
// If not authenticated → redirect to /login, preserving the attempted location.
// If authenticated → render the nested <Outlet />.

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#090C11]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
