import React from 'react';
import { cn } from '@/utils/cn';

// ─── PageHeader ───────────────────────────────────────────────────────────────
// The title at the top of a page: what the page is, one plain sentence about
// it, and optionally a few actions. Deliberately quiet, so the page's own
// content (search, filters, results) is what draws the eye.

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Width of the content column, matching the page below */
  width?: 'max-w-5xl' | 'max-w-7xl';
  /**
   * 'band' spans the page with a bottom border (public pages);
   * 'inline' sits inside a layout that already has its own padding (dashboard).
   */
  variant?: 'band' | 'inline';
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, width = 'max-w-7xl', variant = 'band' }) => {
  const body = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#090C11] dark:text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted dark:text-white/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );

  if (variant === 'inline') return <header>{body}</header>;

  return (
    <header className="bg-white dark:bg-[#090C11] border-b border-gray-200 dark:border-white/10">
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 sm:pt-8', width)}>{body}</div>
    </header>
  );
};

export default PageHeader;
