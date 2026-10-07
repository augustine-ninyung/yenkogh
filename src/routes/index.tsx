import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Pages. Each is fetched the first time it is opened, apart from the landing
// page, which is part of the first download.
import LandingPage from '@/pages/LandingPage';
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const DestinationDetailPage = lazy(() => import('@/pages/DestinationDetailPage'));
const EventsPage = lazy(() => import('@/pages/EventsPage'));
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const FestivalDetailPage = lazy(() => import('@/pages/FestivalDetailPage'));
const TransportationPage = lazy(() => import('@/pages/TransportationPage'));
const AIPlannerPage = lazy(() => import('@/pages/AIPlannerPage'));
const BudgetPlannerPage = lazy(() => import('@/pages/BudgetPlannerPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Authenticated Pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminDestinationsPage = lazy(() => import('@/pages/admin/AdminDestinationsPage'));
const AdminEventsPage = lazy(() => import('@/pages/admin/AdminEventsPage'));
const AdminTransportPage = lazy(() => import('@/pages/admin/AdminTransportPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminRegionsPage = lazy(() => import('@/pages/admin/AdminRegionsPage'));
const AdminFestivalsPage = lazy(() => import('@/pages/admin/AdminFestivalsPage'));
const AdminFeedbackPage = lazy(() => import('@/pages/admin/AdminFeedbackPage'));
const AdminAuditPage = lazy(() => import('@/pages/admin/AdminAuditPage'));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public Layout Routes ── */}
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="explore/:id" element={<DestinationDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="festivals" element={<Navigate to="/events?view=festivals" replace />} />
        <Route path="festivals/:id" element={<FestivalDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        {/* Members only, shown inside the public layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="transportation" element={<TransportationPage />} />
          <Route path="planner" element={<AIPlannerPage />} />
          <Route path="budget" element={<BudgetPlannerPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ── Protected Dashboard Routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/trips" element={<DashboardPage />} />
          <Route path="dashboard/saved" element={<ProfilePage />} />
          <Route path="dashboard/budget" element={<BudgetPlannerPage />} />
          <Route path="dashboard/profile" element={<ProfilePage />} />
          <Route path="dashboard/settings" element={<ProfilePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ── Admin Routes ── */}
      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="destinations" element={<AdminDestinationsPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="transportation" element={<AdminTransportPage />} />
          <Route path="regions" element={<AdminRegionsPage />} />
          <Route path="festivals" element={<AdminFestivalsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
