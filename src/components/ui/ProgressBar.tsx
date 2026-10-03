import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string; // arbitrary hex or leave undefined for default yellow
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const trackHeight = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  label,
  showPercentage = false,
  size = 'md',
  className,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-sm font-medium text-[#262B32] dark:text-white">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-[#757B81] tabular-nums">
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden',
          trackHeight[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-in-out',
            !color && 'bg-[#FFD300]'
          )}
          style={{
            width: `${clamped}%`,
            ...(color ? { backgroundColor: color } : {}),
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
