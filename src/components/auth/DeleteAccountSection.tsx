import React, { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/context/useToast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const CONFIRM_WORD = 'DELETE';

// ─── DeleteAccountSection ─────────────────────────────────────────────────────
// Lets someone erase their account and all data linked to it, as promised in
// the Privacy Policy. Typing a word to confirm guards against a stray click.

export const DeleteAccountSection: React.FC = () => {
  const { deleteAccount } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const inputId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const close = () => {
    if (isDeleting) return;
    setIsOpen(false);
    setTyped('');
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typed !== CONFIRM_WORD) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      addToast({ variant: 'success', title: 'Account deleted', message: 'Your account and its data have been removed.' });
      navigate('/', { replace: true });
    } catch (err) {
      addToast({
        variant: 'error',
        title: 'Could not delete account',
        message: (err instanceof Error && err.message) || 'Please try again.',
      });
      setIsDeleting(false);
    }
  };

  return (
    <section
      aria-labelledby="delete-account-title"
      className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-red-200 dark:border-red-500/30 shadow-sm space-y-4 max-w-2xl"
    >
      <div>
        <h2 id="delete-account-title" className="text-lg font-bold text-[#090C11] dark:text-white">
          Delete account
        </h2>
        <p className="text-sm text-muted mt-1">
          Permanently removes your account, profile photo, saved places, trips, budgets and feedback. This cannot be undone.
        </p>
      </div>
      <Button type="button" variant="danger" onClick={() => setIsOpen(true)}>
        <Trash2 size={16} aria-hidden="true" />
        <span>Delete my account</span>
      </Button>

      <Modal isOpen={isOpen} onClose={close} title="Delete your account?" size="md">
        <form onSubmit={confirm} className="space-y-4">
          <p className="text-sm text-[#262B32] dark:text-white/85">
            Everything linked to your account will be erased straight away. You will be signed out.
          </p>
          <div>
            <label htmlFor={inputId} className="block text-sm font-semibold mb-1.5">
              Type <span className="font-mono">{CONFIRM_WORD}</span> to confirm
            </label>
            <input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={close} disabled={isDeleting}>
              Keep my account
            </Button>
            <Button type="submit" variant="danger" isLoading={isDeleting} disabled={typed !== CONFIRM_WORD}>
              Delete permanently
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default DeleteAccountSection;
