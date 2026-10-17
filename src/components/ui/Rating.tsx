import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RatingProps {
  value: number;
  maxValue?: number;
  showValue?: boolean;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 12,
  md: 16,
  lg: 20,
};

export const Rating: React.FC<RatingProps> = ({
  value,
  maxValue = 5,
  showValue = false,
  reviewCount,
  size = 'md',
  className,
}) => {
  const starSize = sizeMap[size];
  const clampedValue = Math.min(Math.max(value, 0), maxValue);

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`Rating: ${clampedValue} out of ${maxValue} stars${reviewCount !== undefined ? `, ${reviewCount} reviews` : ''}`}
      role="img"
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxValue }).map((_, i) => {
          const filled = i < Math.floor(clampedValue);
          const partial = !filled && i < clampedValue;
          const fillPercent = partial ? (clampedValue - Math.floor(clampedValue)) * 100 : 0;

          return (
            <span key={i} className="relative inline-block" aria-hidden="true">
              {/* Background (empty) star */}
              <Star
                size={starSize}
                className="text-gray-200 dark:text-white/20"
                fill="currentColor"
              />
              {/* Foreground (filled) star – clip to fillPercent for partial */}
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${fillPercent}%` }}
                >
                  <Star size={starSize} className="text-[#FFD300]" fill="currentColor" />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Numeric value */}
      {showValue && (
        <span
          className={cn(
            'font-semibold text-[#262B32] dark:text-white',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {clampedValue.toFixed(1)}
        </span>
      )}

      {/* Review count */}
      {reviewCount !== undefined && (
        <span
          className={cn(
            'text-muted',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}
        >
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default Rating;
