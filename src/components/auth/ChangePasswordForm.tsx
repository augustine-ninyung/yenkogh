import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthField } from '@/components/auth/AuthField';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { useToast } from '@/context/ToastContext';
import { validatePassword, validateConfirmPassword } from '@/utils/validators';
import { authService } from '@/services/authService';

type Errors = { current?: string; password?: string; confirmPassword?: string };

// ─── ChangePasswordForm ───────────────────────────────────────────────────────
// For someone who is signed in and knows their current password.

export const ChangePasswordForm: React.FC = () => {
  const { addToast } = useToast();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  const editing = (field: keyof Errors, set: (value: string) => void) => (value: string) => {
    set(value);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sameAsCurrent = Boolean(current) && password === current;
    const next: Errors = {
      current: current ? undefined : 'Enter your current password.',
      password:
        validatePassword(password) || (sameAsCurrent ? 'Choose a password different from your current one.' : undefined),
      confirmPassword: validateConfirmPassword(password, confirmPassword) || undefined,
    };
    if (next.current || next.password || next.confirmPassword) {
      setErrors(next);
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      await authService.changePassword(current, password);
      setCurrent('');
      setPassword('');
      setConfirmPassword('');
      addToast({
        variant: 'success',
        title: 'Password Changed',
        message: 'Use your new password the next time you sign in.',
      });
    } catch (err) {
      const message = (err instanceof Error && err.message) || 'Could not change the password. Please try again.';
      // A wrong current password belongs on that field; anything else on the new one
      setErrors(/current password/i.test(message) ? { current: message } : { password: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-5 max-w-2xl"
    >
      <div>
        <h2 className="text-lg font-bold text-[#090C11] dark:text-white">Change password</h2>
        <p className="text-sm text-muted mt-1">You will stay signed in on this device.</p>
      </div>

      <AuthField
        label="Current password"
        icon={Lock}
        type="password"
        value={current}
        onChange={editing('current', setCurrent)}
        error={errors.current}
        autoComplete="current-password"
      />

      <div>
        <AuthField
          label="New password"
          icon={Lock}
          type="password"
          value={password}
          onChange={editing('password', setPassword)}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordChecklist password={password} />
      </div>

      <AuthField
        label="Confirm new password"
        icon={Lock}
        type="password"
        value={confirmPassword}
        onChange={editing('confirmPassword', setConfirmPassword)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
        <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold">
          Change password
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
