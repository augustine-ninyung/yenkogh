import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/context/useToast';
import { ApiError, FEEDBACK_MESSAGE_LIMITS, feedbackApi, type FeedbackKind, type FeedbackSubject } from '@/services/adminApi';

interface FeedbackDialogProps {
  subjectType: FeedbackSubject;
  subjectId: string;
  subjectName: string;
  className?: string;
}

const KINDS: { value: FeedbackKind; label: string }[] = [
  { value: 'correction', label: 'Something here is wrong or out of date' },
  { value: 'suggestion', label: 'I have a suggestion' },
  { value: 'report', label: 'Report a problem with this page' },
];

// ─── FeedbackDialog ───────────────────────────────────────────────────────────
// A "report a problem" link for a page about one destination or festival. What
// is sent goes to the admin area's Feedback queue.

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ subjectType, subjectId, subjectName, className }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>('correction');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const length = message.trim().length;
  const { min, max } = FEEDBACK_MESSAGE_LIMITS;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (length < min) {
      setError(`Please give a little more detail (at least ${min} characters).`);
      return;
    }
    if (length > max) {
      setError(`Please keep it to ${max} characters or fewer.`);
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      await feedbackApi.submit({ kind, subjectType, subjectId, subjectName, message });
      addToast({ variant: 'success', title: 'Thank you', message: 'Your feedback has been sent to the YɛnkɔGH team.' });
      setIsOpen(false);
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Could not send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-sm text-muted hover:text-[#090C11] dark:hover:text-white transition-colors ${className ?? ''}`}
      >
        <Flag size={14} />
        Report a problem or suggest a correction
      </button>

      <Modal isOpen={isOpen} onClose={() => !isSending && setIsOpen(false)} title={`Feedback on ${subjectName}`} size="md">
        {isAuthenticated ? (
          <form onSubmit={send} noValidate className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-[#262B32] dark:text-white mb-1">What is it about?</legend>
              {KINDS.map((option) => (
                <label key={option.value} className="flex items-center gap-2.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="feedback-kind"
                    checked={kind === option.value}
                    onChange={() => setKind(option.value)}
                    className="accent-[#FFD300]"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="feedback-message" className="text-sm font-semibold text-[#262B32] dark:text-white">
                  Details
                </label>
                <span className={`text-xs ${length > max ? 'text-red-600 font-semibold' : 'text-muted'}`}>
                  {length}/{max}
                </span>
              </div>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                }}
                rows={5}
                placeholder="Tell us what should change, and how you know."
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'feedback-message-error' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300] resize-y ${
                  error ? 'border-red-500' : 'border-gray-200 dark:border-white/15'
                }`}
              />
              {error && (
                <p id="feedback-message-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <p className="text-xs text-muted">
              Our editors will see your name and email with this message so they can follow up. It is not published.{' '}
              <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSending} className="font-bold">
                Send feedback
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted dark:text-white/80">
              Please log in to send feedback, so the team can follow up if they have a question.
            </p>
            <ButtonLink to="/login" state={{ from: location }} variant="primary" className="font-bold">
                Log in
              </ButtonLink>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FeedbackDialog;
