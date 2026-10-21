import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { lazyPage } from './lazyPage';

// Pages. Each is fetched the first time it is opened, apart from the landing
// page, which is part of the first download.
import LandingPage from '@/pages/LandingPage';
const ExplorePage = lazyPage(() => import('@/pages/ExplorePage'));
const DestinationDetailPage = lazyPage(() => import('@/pages/DestinationDetailPage'));
const EventsPage = lazyPage(() => import('@/pages/EventsPage'));
const EventDetailPage = lazyPage(() => import('@/pages/EventDetailPage'));
const FestivalDetailPage = lazyPage(() => import('@/pages/FestivalDetailPage'));
const TransportationPage = lazyPage(() => import('@/pages/TransportationPage'));
const AIPlannerPage = lazyPage(() => import('@/pages/AIPlannerPage'));
const BudgetPlannerPage = lazyPage(() => import('@/pages/BudgetPlannerPage'));
const LoginPage = lazyPage(() => import('@/pages/LoginPage'));
const RegisterPage = lazyPage(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazyPage(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyPage(() => import('@/pages/ResetPasswordPage'));
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage'));
const PrivacyPage = lazyPage(() => import('@/pages/PrivacyPage'));
const TermsPage = lazyPage(() => import('@/pages/TermsPage'));
const CookiesPage = lazyPage(() => import('@/pages/CookiesPage'));
const CreditsPage = lazyPage(() => import('@/pages/CreditsPage'));

// Authenticated Pages
const DashboardPage = lazyPage(() => import('@/pages/DashboardPage'));
const ProfilePage = lazyPage(() => import('@/pages/ProfilePage'));

// Admin Pages
const AdminDashboardPage = lazyPage(() => import('@/pages/admin/AdminDashboardPage'));
const AdminDestinationsPage = lazyPage(() => import('@/pages/admin/AdminDestinationsPage'));
const AdminEventsPage = lazyPage(() => import('@/pages/admin/AdminEventsPage'));
const AdminTransportPage = lazyPage(() => import('@/pages/admin/AdminTransportPage'));
const AdminUsersPage = lazyPage(() => import('@/pages/admin/AdminUsersPage'));
const AdminRegionsPage = lazyPage(() => import('@/pages/admin/AdminRegionsPage'));
const AdminFestivalsPage = lazyPage(() => import('@/pages/admin/AdminFestivalsPage'));
const AdminFeedbackPage = lazyPage(() => import('@/pages/admin/AdminFeedbackPage'));
const AdminAuditPage = lazyPage(() => import('@/pages/admin/AdminAuditPage'));
const AdminTrafficPage = lazyPage(() => import('@/pages/admin/AdminTrafficPage'));

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
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cookies" element={<CookiesPage />} />
        <Route path="credits" element={<CreditsPage />} />

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
          <Route path="traffic" element={<AdminTrafficPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
