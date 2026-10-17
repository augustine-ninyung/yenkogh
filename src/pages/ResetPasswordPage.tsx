import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { validatePassword, validateConfirmPassword } from '@/utils/validators';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { authService } from '@/services/authService';
import { authLinkError } from '@/lib/supabase';

const PHOTO = { id: '1727023663921-967d01f69c7e', caption: 'Black Star Gate, Accra', credit: 'Nana Kwandoh' };

const linkClass =
  'font-bold text-[#090C11] dark:text-white underline decoration-[#FFD300] decoration-2 underline-offset-4 hover:decoration-4';

// ─── ResetPasswordPage ────────────────────────────────────────────────────────
// Where the link in a password-reset email lands. The link signs the person in
// for this one purpose; without it there is nothing to reset.

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [linkState, setLinkState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // The reset link is valid if it left a signed-in session behind
  useEffect(() => {
    if (isAuthLoading) return;
    let cancelled = false;
    const check = authLinkError ? Promise.resolve(null) : authService.getSessionToken();
    check.then((token) => {
      if (!cancelled) setLinkState(token ? 'valid' : 'invalid');
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passErr = validatePassword(password);
    const confErr = validateConfirmPassword(password, confirmPassword);
    if (passErr || confErr) {
      setErrors({ password: passErr || undefined, confirmPassword: confErr || undefined });
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      await authService.setNewPassword(password);
      addToast({
        variant: 'success',
        title: 'Password Changed',
        message: 'You are signed in with your new password.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ password: (err instanceof Error && err.message) || 'Could not change the password. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthShell
      title={linkState === 'invalid' ? 'This link has expired' : 'Choose a new password'}
      subtitle={
        linkState === 'invalid'
          ? 'Reset links work once and only for a short time.'
          : 'Pick something you have not used here before.'
      }
      headline="Everything you need to see Ghana, in one account."
      photo={PHOTO}
      footer={
        <Link to="/login" className={linkClass}>
          Back to sign in
        </Link>
      }
    >
      {linkState === 'checking' && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {linkState === 'invalid' && (
        <div className="space-y-5">
          <p role="alert" className="p-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/15 text-sm text-red-800 dark:text-red-200">
            We could not use this reset link. It may have expired, been used already, or been opened in a different browser from the one you requested it in.
          </p>
          <ButtonLink to="/forgot-password" variant="primary" fullWidth size="lg" className="h-12 font-bold">
              Send me a new link
            </ButtonLink>
        </div>
      )}

      {linkState === 'valid' && (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <AuthField
              label="New password"
              icon={Lock}
              type="password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              placeholder="Create a password"
              autoComplete="new-password"
              autoFocus
            />
            <PasswordChecklist password={password} />
          </div>

          <AuthField
            label="Confirm new password"
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            placeholder="Type it again"
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isSaving} className="h-12 font-bold">
            Save new password
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPasswordPage;
