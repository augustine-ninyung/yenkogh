import React from 'react';
import { cn } from '@/utils/cn';

// ─── Sub-component props ────────────────────────────────────────────────────

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ─── Card ───────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  as: Component = 'div',
}) => {
  return (
    <Component
      className={cn(
        'bg-white dark:bg-[#262B32] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-200',
        paddingClasses[padding],
        hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  );
};

// ─── CardHeader ─────────────────────────────────────────────────────────────

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between',
      className
    )}
  >
    {children}
  </div>
);

// ─── CardBody ───────────────────────────────────────────────────────────────

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={cn('p-4', className)}>{children}</div>
);

// ─── CardFooter ─────────────────────────────────────────────────────────────

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-4 py-3 border-t border-gray-100 dark:border-white/5',
      className
    )}
  >
    {children}
  </div>
);

export default Card;
