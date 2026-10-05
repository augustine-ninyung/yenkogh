import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { validateEmail } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/services/authService';
import { isBackendConfigured } from '@/lib/supabase';

// Pages that sent a visitor here because they need an account
const MEMBER_PAGES: Record<string, string> = {
  '/transportation': 'the Transportation guide',
  '/planner': 'the AI Trip Planner',
  '/budget': 'the Budget Planner',
};

const PHOTO = { id: '1562490654-131366a15276', caption: 'Rainforest canopy walkway', credit: 'orva studio' };

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const requested = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const from = requested?.pathname ? `${requested.pathname}${requested.search ?? ''}` : '/dashboard';
  const requestedFeature = MEMBER_PAGES[requested?.pathname ?? ''];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    // Signing in only needs a password to be present; the strength rules apply when one is created
    const passErr = password ? null : 'Password is required.';

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

  const clearError = (field: 'email' | 'password') => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up your trips, saved places and budgets."
      headline="Your Ghana plans, right where you left them."
      photo={PHOTO}
      footer={
        <>
          New to YɛnkɔGH?{' '}
          <Link to="/register" state={location.state} className="font-bold text-[#090C11] dark:text-white underline decoration-[#FFD300] decoration-2 underline-offset-4 hover:decoration-4">
            Create a free account
          </Link>
        </>
      }
    >
      {requestedFeature && (
        <div role="status" className="p-3.5 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/50 text-sm text-[#090C11] dark:text-white">
          Log in or{' '}
          <Link to="/register" state={location.state} className="font-bold underline">
            create a free account
          </Link>{' '}
          to use {requestedFeature}.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearError('email');
          }}
          error={errors.email}
          placeholder="name@example.com"
          autoComplete="email"
          autoFocus
        />

        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            clearError('password');
          }}
          error={errors.password}
          placeholder="Your password"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="h-12 font-bold"
        >
          <span className="inline-flex items-center gap-2">
            Sign in
            <ArrowRight size={18} />
          </span>
        </Button>
      </form>

      {/* The demo accounts exist only while the app runs without a backend */}
      {!isBackendConfigured && (
        <div>
          <div className="flex items-center gap-3 text-xs font-medium text-[#757B81]">
            <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            Or try a demo account
            <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillDemo(DEMO_USER_EMAIL, DEMO_USER_PASSWORD)}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/15 text-sm font-semibold hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => fillDemo(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD)}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/15 text-sm font-semibold hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
            >
              Admin
            </button>
          </div>
          <p className="mt-2.5 text-center text-xs text-[#757B81]">Fills in the details; press Sign in to continue.</p>
        </div>
      )}
    </AuthShell>
  );
};

export default LoginPage;
