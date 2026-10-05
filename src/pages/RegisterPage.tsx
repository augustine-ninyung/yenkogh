import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { validateName, validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { EmailConfirmationRequiredError } from '@/services/authService';
import { cn } from '@/utils/cn';

const PHOTO = { id: '1727023663921-967d01f69c7e', caption: 'Black Star Gate, Accra', credit: 'Nana Kwandoh' };

// Mirrors validatePassword, so the checklist and the error message never disagree
const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: '8 or more characters', test: (p) => p.length >= 8 },
  { label: 'A letter', test: (p) => /[a-zA-Z]/.test(p) },
  { label: 'A number', test: (p) => /[0-9]/.test(p) },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Someone sent here from a members-only page goes back to it once registered
  const requested = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const destination = requested?.pathname ? `${requested.pathname}${requested.search ?? ''}` : '/dashboard';

  // A field's error goes away as soon as the person starts correcting it
  const editing = (field: string, set: (value: string) => void) => (value: string) => {
    set(value);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confErr = validateConfirmPassword(password, confirmPassword);

    if (nameErr || emailErr || passErr || confErr) {
      setErrors({
        ...(nameErr && { name: nameErr }),
        ...(emailErr && { email: emailErr }),
        ...(passErr && { password: passErr }),
        ...(confErr && { confirmPassword: confErr }),
      });
      return;
    }

    setErrors({});

    try {
      await register(name, email, password);
      addToast({
        variant: 'success',
        title: 'Account Created!',
        message: 'Welcome to YɛnkɔGH. Start discovering Ghana today!',
      });
      navigate(destination, { replace: true });
    } catch (err) {
      if (err instanceof EmailConfirmationRequiredError) {
        addToast({
          variant: 'info',
          title: 'Confirm Your Email',
          message: err.message,
        });
        navigate('/login', { state: location.state });
        return;
      }
      addToast({
        variant: 'error',
        title: 'Registration Error',
        message: (err instanceof Error && err.message) ||'Could not register account.',
      });
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to join. Plan trips, save places and keep a budget for each one."
      headline="Everything you need to see Ghana, in one account."
      photo={PHOTO}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-bold text-[#090C11] dark:text-white underline decoration-[#FFD300] decoration-2 underline-offset-4 hover:decoration-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Full name"
          icon={User}
          value={name}
          onChange={editing('name', setName)}
          error={errors.name}
          placeholder="Kofi Mensah"
          autoComplete="name"
          autoFocus
        />

        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={editing('email', setEmail)}
          error={errors.email}
          placeholder="kofi@example.com"
          autoComplete="email"
        />

        <div>
          <AuthField
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={editing('password', setPassword)}
            error={errors.password}
            placeholder="Create a password"
            autoComplete="new-password"
          />
          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Password requirements">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    'flex items-center gap-1.5 text-xs transition-colors',
                    met ? 'text-green-700 dark:text-green-400 font-medium' : 'text-[#757B81] dark:text-white/50'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-3.5 h-3.5 rounded-full border',
                      met ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 dark:border-white/30'
                    )}
                  >
                    {met && <Check size={10} strokeWidth={3} />}
                  </span>
                  {rule.label}
                  <span className="sr-only">{met ? '(met)' : '(not met yet)'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <AuthField
          label="Confirm password"
          icon={Lock}
          type="password"
          value={confirmPassword}
          onChange={editing('confirmPassword', setConfirmPassword)}
          error={errors.confirmPassword}
          placeholder="Type it again"
          autoComplete="new-password"
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
            Create account
            <ArrowRight size={18} />
          </span>
        </Button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
