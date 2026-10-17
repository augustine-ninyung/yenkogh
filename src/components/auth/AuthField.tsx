import React, { useId, useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AuthFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Shown under the field when there is no error */
  hint?: string;
  /** Link or note shown on the right of the label */
  labelAside?: React.ReactNode;
}

// ─── AuthField ────────────────────────────────────────────────────────────────
// A labelled input for the sign-in and sign-up forms. Password fields get a
// show/hide button.

export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  hint,
  labelAside,
  type = 'text',
  className,
  ...props
}) => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-[#262B32] dark:text-white">
          {label}
        </label>
        {labelAside}
      </div>

      <div className="relative">
        <Icon aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-12 pl-11 rounded-xl border bg-white dark:bg-[#262B32] text-[15px] text-[#090C11] dark:text-white placeholder:text-muted/70 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent',
            isPassword ? 'pr-12' : 'pr-4',
            error
              ? 'border-red-500'
              : 'border-gray-200 dark:border-white/15 hover:border-gray-300 dark:hover:border-white/30',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted hover:text-[#090C11] dark:hover:text-white"
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted dark:text-white/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default AuthField;
