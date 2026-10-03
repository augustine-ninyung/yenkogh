import React from 'react';
import { cn } from '@/utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 gap-4',
        className
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500">
        <AlertTriangle size={28} />
      </div>
      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="text-base font-semibold text-[#262B32] dark:text-white">{title}</h3>
        <p className="text-sm text-[#757B81]">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          leftIcon={<RefreshCw size={16} />}
        >
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
