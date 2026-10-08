import React, { useState, Suspense } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { PageFallback } from '@/components/ui/PageFallback';
import {
  LayoutDashboard,
  Map,
  Heart,
  Wallet,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { ToastContainer } from '@/components/ui/Toast';

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/trips', label: 'My Trips', icon: Map },
  { to: '/dashboard/saved', label: 'Saved Places', icon: Heart },
  { to: '/dashboard/budget', label: 'Budget Planner', icon: Wallet },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// ─── Sidebar nav link ─────────────────────────────────────────────────────────

const SidebarLink: React.FC<{
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
          ? 'bg-[#FFD300] text-[#090C11] shadow-sm'
          : 'text-[#757B81] dark:text-[#9aa0a8] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-[#262B32] dark:hover:text-white'
      )
    }
  >
    <Icon size={18} className="shrink-0" />
    <span>{label}</span>
  </NavLink>
);

// ─── DashboardLayout ──────────────────────────────────────────────────────────

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 dark:border-white/10">
        <Link
          to="/"
          className="flex items-center"
          onClick={() => setMobileOpen(false)}
        >
          <Logo className="h-8 w-auto text-[#191E25] dark:text-white" />
        </Link>
        <p className="text-xs text-[#757B81] mt-1">My Dashboard</p>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#262B32] dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#757B81] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          aria-label="Log out of your account"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#090C11] text-[#262B32] dark:text-white">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-[#262B32] border-r border-gray-100 dark:border-white/10 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#262B32] flex flex-col lg:hidden',
          'transform transition-transform duration-300 ease-in-out shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#757B81] hover:text-[#262B32] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#262B32] border-b border-gray-100 dark:border-white/10 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg text-[#757B81] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link
            to="/"
          >
            <Logo className="h-7 w-auto text-[#191E25] dark:text-white" />
          </Link>
          {user && (
            <div className="ml-auto">
              <Avatar src={user.avatar} name={user.name} size="sm" />
            </div>
          )}
        </header>

        {/* Breadcrumb/page area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Desktop header bar */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-[#757B81]">
              <Link to="/" className="hover:text-[#FFD300] transition-colors">
                Home
              </Link>
              <ChevronRight size={14} />
              <span className="text-[#262B32] dark:text-white font-medium">Dashboard</span>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#262B32] dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#757B81]">{user.email}</p>
                </div>
                <Avatar src={user.avatar} name={user.name} size="sm" />
              </div>
            )}
          </div>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
