import React from 'react';
import { cn } from '@/utils/cn';

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines }) => {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse',
              i === lines - 1 && 'w-3/4',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse',
        className
      )}
    />
  );
};

// ─── Destination Card Skeleton ───────────────────────────────────────────────

export const DestinationCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-[#262B32] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
    {/* Image */}
    <div className="h-48 bg-gray-200 dark:bg-white/10 animate-pulse" />
    {/* Content */}
    <div className="p-4 flex flex-col gap-3">
      {/* Title */}
      <Skeleton className="h-5 w-2/3" />
      {/* Subtitle */}
      <Skeleton className="h-4 w-1/2" />
      {/* Rating row */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-10 ml-auto" />
      </div>
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

// ─── Event Card Skeleton ─────────────────────────────────────────────────────

export const EventCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-[#262B32] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 p-4">
    {/* Date block */}
    <div className="flex flex-col items-center justify-center w-14 shrink-0 gap-1">
      <Skeleton className="h-5 w-10" />
      <Skeleton className="h-7 w-8" />
    </div>
    {/* Divider */}
    <div className="w-px bg-gray-200 dark:bg-white/10 animate-pulse self-stretch" />
    {/* Content */}
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
    {/* Thumb */}
    <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
  </div>
);

export default Skeleton;
