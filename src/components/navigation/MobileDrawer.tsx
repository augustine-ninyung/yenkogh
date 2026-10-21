import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import {
  X,
  Compass,
  Calendar,
  Bus,
  Sparkles,
  Wallet,
  LayoutDashboard,
  User,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/Button';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { to: '/', label: 'Home', icon: Compass },
  { to: '/explore', label: 'Explore Destinations', icon: Compass },
  { to: '/events', label: 'Events & Festivals', icon: Calendar },
  { to: '/transportation', label: 'Transportation Guide', icon: Bus },
  { to: '/planner', label: 'AI Trip Planner', icon: Sparkles, badge: 'AI' },
  { to: '/budget', label: 'Budget Planner', icon: Wallet },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-[#090C11] shadow-2xl flex flex-col z-50 border-l border-gray-100 dark:border-white/10 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
          <Link to="/" onClick={onClose}>
            <Logo className="h-8 w-auto text-[#191E25] dark:text-white" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-[#090C11] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card if Authenticated */}
        {isAuthenticated && user && (
          <div className="p-4 bg-gray-50 dark:bg-[#262B32]/50 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#090C11] dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-muted dark:text-white/60 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#FFD300] text-[#090C11] font-semibold shadow-sm'
                      : 'text-muted dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#090C11] dark:hover:text-white'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#090C11] text-[#FFD300] dark:bg-white dark:text-[#090C11]">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {isAuthenticated && (
            <>
              <div className="pt-4 pb-1">
                <div className="h-px bg-gray-100 dark:bg-white/10 mx-3 mb-2" />
                <p className="px-3 text-[11px] font-semibold text-muted uppercase tracking-wider">Account</p>
              </div>
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#FFD300] text-[#090C11] font-semibold'
                      : 'text-muted dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5'
                  )
                }
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#FFD300] text-[#090C11] font-semibold'
                      : 'text-muted dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5'
                  )
                }
              >
                <User size={18} />
                <span>My Profile</span>
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                  <ShieldAlert size={18} />
                  <span>Admin Panel</span>
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-white/10">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <ButtonLink to="/login" onClick={onClose} variant="outline" fullWidth size="md">
                  Log In
                </ButtonLink>
              <ButtonLink to="/register" onClick={onClose} variant="primary" fullWidth size="md">
                  Sign Up Free
                </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
