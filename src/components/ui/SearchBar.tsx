import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
  showClear?: boolean;
}

const sizeMap = {
  sm: { input: 'pl-9 pr-3 py-2 text-sm', icon: 16, iconLeft: 'left-2.5' },
  md: { input: 'pl-10 pr-3 py-2.5 text-sm', icon: 18, iconLeft: 'left-3' },
  lg: { input: 'pl-12 pr-4 py-3.5 text-base', icon: 22, iconLeft: 'left-3.5' },
};

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search destinations, experiences…',
  value,
  onChange,
  onSearch,
  className,
  size = 'md',
  showButton = false,
  showClear = true,
}) => {
  const sz = sizeMap[size];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        {/* Search icon */}
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none text-[#757B81]',
            sz.iconLeft
          )}
          aria-hidden="true"
        >
          <Search size={sz.icon} />
        </span>

        <input
          type="search"
          role="searchbox"
          aria-label={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border border-gray-200 dark:border-[#757B81]/40 bg-white dark:bg-[#262B32]',
            'text-[#090C11] dark:text-white placeholder:text-[#757B81]',
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent',
            'hover:border-[#757B81]',
            sz.input,
            showClear && value ? 'pr-10' : ''
          )}
        />

        {/* Clear button */}
        {showClear && value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757B81] hover:text-[#262B32] dark:hover:text-white transition-colors duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showButton && (
        <Button
          variant="primary"
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
          onClick={() => onSearch?.(value)}
          aria-label="Search"
        >
          Search
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
