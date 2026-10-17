import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import { validateEmail } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { authService } from '@/services/authService';

const PHOTO = { id: '1562490654-131366a15276', caption: 'Rainforest canopy walkway', credit: 'orva studio' };

const linkClass =
  'font-bold text-[#090C11] dark:text-white underline decoration-[#FFD300] decoration-2 underline-offset-4 hover:decoration-4';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [isSending, setIsSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsSending(true);
    setError(undefined);
    try {
      await authService.requestPasswordReset(email);
      setSentTo(email.trim());
    } catch (err) {
      setError((err instanceof Error && err.message) || 'Could not send the email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthShell
      title={sentTo ? 'Check your email' : 'Forgot your password?'}
      subtitle={
        sentTo
          ? 'Follow the link in the email to choose a new password.'
          : 'Enter the email you signed up with and we will send you a link to choose a new one.'
      }
      headline="Your Ghana plans, right where you left them."
      photo={PHOTO}
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className={linkClass}>
            Back to sign in
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div role="status" className="space-y-4">
          <div className="flex gap-3 p-4 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/50 text-sm text-[#090C11] dark:text-white">
            <MailCheck size={20} className="shrink-0 mt-0.5" />
            {/* Deliberately the same whether or not the address has an account */}
            <p>
              If <strong>{sentTo}</strong> has a YɛnkɔGH account, a reset link is on its way. It can take a few minutes; check your spam folder too.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-sm text-muted hover:text-[#090C11] dark:hover:text-white underline"
          >
            Use a different email address
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <AuthField
            label="Email address"
            icon={Mail}
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              setError(undefined);
            }}
            error={error}
            placeholder="name@example.com"
            autoComplete="email"
            autoFocus
          />
          <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isSending} className="h-12 font-bold">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;
