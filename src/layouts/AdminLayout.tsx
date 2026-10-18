import { SkipLink } from '@/components/navigation/SkipLink';
import React, { useEffect, useState, Suspense } from 'react';
import { Outlet, NavLink, Navigate, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { PageFallback } from '@/components/ui/PageFallback';
import {
  BarChart3,
  MapPin,
  Map,
  PartyPopper,
  Calendar,
  Truck,
  Users,
  MessageSquareWarning,
  ScrollText,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { ToastContainer } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { auditApi } from '@/services/adminApi';

// ─── Nav items ────────────────────────────────────────────────────────────────

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { to: '/admin/destinations', label: 'Destinations', icon: MapPin },
  { to: '/admin/regions', label: 'Regions', icon: Map },
  { to: '/admin/festivals', label: 'Festivals', icon: PartyPopper },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/transportation', label: 'Transportation', icon: Truck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquareWarning },
  { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
];

// Marks that this browser session's admin visit has been written to the audit log
const LOGIN_LOGGED_KEY = 'yenkogh_admin_login_logged';

// ─── Sidebar nav link ─────────────────────────────────────────────────────────

const AdminNavLink: React.FC<{
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}> = ({ to, label, icon: Icon, exact = false, onClick }) => (
  <NavLink
    to={to}
    end={exact}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-[#FFD300] text-[#090C11]'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      )
    }
  >
    <Icon size={18} className="shrink-0" />
    <span>{label}</span>
  </NavLink>
);

// ─── AdminLayout ──────────────────────────────────────────────────────────────

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // One audit entry per session, not one per page view
  useEffect(() => {
    if (!isAdmin || sessionStorage.getItem(LOGIN_LOGGED_KEY) === user?.id) return;
    sessionStorage.setItem(LOGIN_LOGGED_KEY, user?.id ?? '');
    void auditApi.logAdminLogin();
  }, [isAdmin, user?.id]);

  // Keeps non-admins out of the screens. The data itself is guarded by the backend,
  // which refuses admin requests from anyone else whatever the browser shows.
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link
          to="/admin"
          className="flex items-center"
          onClick={() => setMobileOpen(false)}
        >
          <Logo className="h-8 w-auto text-white" />
        </Link>
        <div className="flex items-center gap-1.5 mt-1">
          <ShieldCheck size={12} className="text-[#FFD300]" />
          <p className="text-xs text-white/50">Admin Panel</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Admin navigation">
        {adminNavItems.map((item) => (
          <AdminNavLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Admin user info + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft size={18} className="shrink-0" aria-hidden="true" />
          <span>Back to site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
          aria-label="Log out of admin panel"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0a0d12] text-[#262B32] dark:text-white">
      <SkipLink />
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#090C11] fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#090C11] flex flex-col lg:hidden shadow-2xl',
          'transform transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile admin navigation"
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 sm:px-6 py-3 bg-white dark:bg-[#262B32] border-b border-gray-200 dark:border-white/10 sticky top-0 z-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <Link
            to="/admin"
            className="lg:hidden"
          >
            <Logo className="h-7 w-auto text-[#191E25] dark:text-white" />
          </Link>

          {/* Title */}
          <div className="hidden lg:flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#FFD300]" />
            <span className="text-sm font-semibold text-[#262B32] dark:text-white">
              Admin Panel
            </span>
          </div>

          {/* Right side: site link, theme, user info */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              aria-label="Back to site"
              className="inline-flex items-center gap-1.5 p-2 sm:p-0 rounded-lg text-sm font-medium text-muted hover:text-[#090C11] dark:hover:text-white hover:bg-gray-100 sm:hover:bg-transparent dark:hover:bg-white/10 sm:dark:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
            <ThemeToggle />
            {user && (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-[#262B32] dark:text-white leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted capitalize">{user.role}</p>
                </div>
                <Avatar src={user.avatar} name={user.name} size="sm" />
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main id="main" tabIndex={-1} className="focus:outline-none flex-1 p-4 sm:p-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminLayout;
