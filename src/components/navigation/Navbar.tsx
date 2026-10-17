import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import {
  Menu,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/Button';
import { MobileDrawer } from './MobileDrawer';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/events', label: 'Events' },
  { to: '/transportation', label: 'Transportation' },
  { to: '/planner', label: 'AI Planner', badge: 'AI' },
  { to: '/budget', label: 'Budget Planner' },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navBackgroundClass = !isHome || isScrolled
    ? 'bg-white/95 dark:bg-[#090C11]/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 shadow-sm text-[#262B32] dark:text-white'
    : 'bg-transparent text-white';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          navBackgroundClass
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Logo variant="mark" className={cn('h-10 w-auto transition-colors', !isHome || isScrolled ? 'text-[#191E25] dark:text-white' : 'text-white')} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                      isActive
                        ? (!isHome || isScrolled) ? 'text-accent-ink font-semibold' : 'text-[#FFD300] font-semibold'
                        : (!isHome || isScrolled)
                          ? 'text-muted dark:text-white/80 hover:text-[#090C11] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFD300] text-[#090C11] leading-none">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFD300] rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              {isAuthenticated && user ? (
                /* Profile Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2"
                    aria-label="User profile menu"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        profileDropdownOpen && 'rotate-180',
                        (!isHome || isScrolled) ? 'text-muted dark:text-white/70' : 'text-white/80'
                      )}
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
                        <p className="text-sm font-semibold text-[#090C11] dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted dark:text-white/60 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#262B32] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard size={16} className="text-[#FFD300]" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#262B32] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <User size={16} className="text-[#FFD300]" />
                          <span>My Profile</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#262B32] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <ShieldAlert size={16} className="text-amber-500" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-gray-100 dark:border-white/10">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Auth Buttons */
                <div className="hidden sm:flex items-center gap-2">
                  <ButtonLink to="/login" variant={!isHome || isScrolled ? 'ghost' : 'outline'} size="sm" className={cn( isHome && !isScrolled && 'text-white border-white/40 hover:bg-white/10 hover:text-white' )}>
                      Log In
                    </ButtonLink>
                  <ButtonLink to="/register" variant="primary" size="sm">
                      Get Started
                    </ButtonLink>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className={cn(
                  'md:hidden p-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2',
                  (!isHome || isScrolled)
                    ? 'text-[#262B32] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    : 'text-white hover:bg-white/10'
                )}
                aria-label="Open mobile menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </>
  );
};
