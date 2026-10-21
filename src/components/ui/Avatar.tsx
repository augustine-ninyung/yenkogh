import React, { useMemo } from 'react';
import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Inside a control that is already labelled: hidden from assistive technology */
  decorative?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

// Deterministic color from name string
const COLORS = [
  // Dark enough for white initials to meet WCAG AA (4.5:1)
  'bg-red-700',
  'bg-orange-700',
  'bg-amber-700',
  'bg-green-700',
  'bg-teal-700',
  'bg-cyan-700',
  'bg-blue-700',
  'bg-violet-700',
  'bg-purple-700',
  'bg-pink-700',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  decorative = false,
}) => {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getColorFromName(name), [name]);
  const [imgError, setImgError] = React.useState(false);

  // Older accounts stored a ui-avatars.com link, which sent the person's name to
  // that service on every page view. The initials below show instead.
  const showImage = src && !src.startsWith('https://ui-avatars.com/') && !imgError;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center overflow-hidden shrink-0 font-semibold text-white select-none',
        sizeClasses[size],
        !showImage && bgColor,
        className
      )}
      {...(decorative ? { 'aria-hidden': true } : { 'aria-label': name, role: 'img', title: name })}
    >
      {showImage ? (
        <img
          src={src}
          alt={decorative ? '' : name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
