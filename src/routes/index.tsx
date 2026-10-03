import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import ExplorePage from '@/pages/ExplorePage';
import DestinationDetailPage from '@/pages/DestinationDetailPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import TransportationPage from '@/pages/TransportationPage';
import AIPlannerPage from '@/pages/AIPlannerPage';
import BudgetPlannerPage from '@/pages/BudgetPlannerPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Authenticated Pages
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminDestinationsPage from '@/pages/admin/AdminDestinationsPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import AdminTransportPage from '@/pages/admin/AdminTransportPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';

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
        <Route path="transportation" element={<TransportationPage />} />
        <Route path="planner" element={<AIPlannerPage />} />
        <Route path="budget" element={<BudgetPlannerPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
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
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
