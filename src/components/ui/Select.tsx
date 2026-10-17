import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[#262B32] dark:text-white"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-label={label ?? props['aria-label']}
            aria-describedby={error ? `${selectId}-error` : undefined}
            aria-invalid={!!error}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white dark:bg-[#262B32] text-[#090C11] dark:text-white text-sm transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent',
              'pl-3 pr-10 py-2.5',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-[#757B81]/40 hover:border-[#757B81]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <ChevronDown size={16} />
          </span>
        </div>
        {error && (
          <p id={`${selectId}-error`} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
