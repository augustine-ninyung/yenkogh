import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 gap-4',
        className
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/10 text-[#757B81]">
        {icon ?? <PackageOpen size={28} />}
      </div>
      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="text-base font-semibold text-[#262B32] dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[#757B81]">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
