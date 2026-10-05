import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { validateEmail, validatePassword } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/services/authService';
import { isBackendConfigured } from '@/lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr || undefined,
        password: passErr || undefined,
      });
      return;
    }

    setErrors({});

    try {
      await login(email, password);
      addToast({
        variant: 'success',
        title: 'Akwaaba!',
        message: 'Signed in successfully. Welcome back to YɛnkɔGH.',
      });
      navigate(from, { replace: true });
    } catch (err) {
      addToast({
        variant: 'error',
        title: 'Sign In Failed',
        message: (err instanceof Error && err.message) ||'Invalid credentials. Please verify and try again.',
      });
    }
  };

  const fillDemoUser = () => {
    setEmail(DEMO_USER_EMAIL);
    setPassword(DEMO_USER_PASSWORD);
  };

  const fillDemoAdmin = () => {
    setEmail(DEMO_ADMIN_EMAIL);
    setPassword(DEMO_ADMIN_PASSWORD);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50 dark:bg-[#090C11] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-xl space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-block font-['Playfair_Display',serif] text-3xl font-bold mb-2">
              <span className="text-[#FFD300]">Yɛnkɔ</span>
              <span className="text-[#090C11] dark:text-white">GH</span>
            </Link>
            <h1 className="text-xl font-bold text-[#090C11] dark:text-white">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[#757B81] mt-1">
              Access your planned trips, saved attractions, and travel budget
            </p>
          </div>

          {/* Quick Demo Fill Buttons for Examiners/Users (the demo accounts are local-only) */}
          {!isBackendConfigured && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Demo Quick Sign In:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoUser}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-[#090C11] text-[11px] font-semibold border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Regular Traveler
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-[#090C11] text-[11px] font-semibold border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Admin Officer
              </button>
            </div>
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#757B81] dark:text-white/70 block mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757B81] dark:text-white/70 block mb-1.5 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#757B81] hover:text-[#090C11] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="font-bold"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-[#757B81]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#FFD300] hover:underline">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
