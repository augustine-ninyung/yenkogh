import React from 'react';
import { cn } from '@/utils/cn';

// Small pieces shared by the admin screens.

// ─── Page header ──────────────────────────────────────────────────────────────

export const AdminPageHeader: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">{title}</h1>
      <p className="text-sm text-muted mt-1">{description}</p>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ─── Status pill ──────────────────────────────────────────────────────────────

const TONES = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  grey: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70',
} as const;

const STATUS_TONES: Record<string, keyof typeof TONES> = {
  published: 'green',
  active: 'green',
  approved: 'green',
  resolved: 'green',
  draft: 'amber',
  pending: 'amber',
  reviewed: 'blue',
  admin: 'blue',
  archived: 'grey',
  user: 'grey',
  suspended: 'red',
  rejected: 'red',
};

/** A coloured pill for a status word. The word itself is always shown, so colour is never the only cue. */
export const StatusPill: React.FC<{ status: string; className?: string }> = ({ status, className }) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap',
      TONES[STATUS_TONES[status] ?? 'grey'],
      className
    )}
  >
    {status.replace(/[-_]/g, ' ')}
  </span>
);

const DOTS = { green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500', blue: 'bg-blue-500', grey: 'bg-gray-400' } as const;

/** A small coloured dot to sit beside a word that already says what it means. */
export const StatusDot: React.FC<{ tone: keyof typeof DOTS }> = ({ tone }) => (
  <span aria-hidden="true" className={cn('inline-block w-2 h-2 rounded-full shrink-0', DOTS[tone])} />
);

// Shared with the rest of the app; kept exported here for the admin pages
export { ConfirmDialog } from '@/components/ui/ConfirmDialog';
