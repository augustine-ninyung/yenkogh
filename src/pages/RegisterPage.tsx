import React, { useId, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/context/useToast';
import { validateName, validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { EmailConfirmationRequiredError } from '@/services/authService';

const PHOTO = { id: '1727023663921-967d01f69c7e', caption: 'Black Star Gate, Accra', credit: 'Nana Kwandoh' };

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const consentId = useId();
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
    const consentErr = agreed ? '' : 'Please agree to the Terms of Use and Privacy Policy to create an account.';

    if (nameErr || emailErr || passErr || confErr || consentErr) {
      setErrors({
        ...(nameErr && { name: nameErr }),
        ...(emailErr && { email: emailErr }),
        ...(passErr && { password: passErr }),
        ...(confErr && { confirmPassword: confErr }),
        ...(consentErr && { consent: consentErr }),
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
          <PasswordChecklist password={password} />
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

        <div>
          <div className="flex items-start gap-3">
            <input
              id={consentId}
              type="checkbox"
              checked={agreed}
              onChange={(e) => editing('consent', (v) => setAgreed(v === 'yes'))(e.target.checked ? 'yes' : '')}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? `${consentId}-error` : undefined}
              className="mt-0.5 w-5 h-5 shrink-0 rounded border-gray-300 accent-[#090C11] dark:accent-[#FFD300] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2"
            />
            <label htmlFor={consentId} className="text-sm text-[#262B32] dark:text-white/85 leading-snug">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="font-semibold underline underline-offset-2">Terms of Use</Link>
              {' '}and have read the{' '}
              <Link to="/privacy" target="_blank" className="font-semibold underline underline-offset-2">Privacy Policy</Link>
              <span className="sr-only"> (links open in a new tab)</span>.
            </label>
          </div>
          {errors.consent && (
            <p id={`${consentId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.consent}
            </p>
          )}
        </div>

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
