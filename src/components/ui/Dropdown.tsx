import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] rounded-xl bg-white dark:bg-[#262B32] shadow-lg border border-gray-100 dark:border-white/10 py-1',
            'animate-in fade-in zoom-in-95 duration-150 origin-top',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, idx) => (
            <React.Fragment key={item.value}>
              {item.divider && idx !== 0 && (
                <div className="my-1 border-t border-gray-100 dark:border-white/10" aria-hidden="true" />
              )}
              <button
                role="menuitem"
                onClick={() => handleSelect(item.value)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-[#262B32] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-150 focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFD300] focus-visible:bg-gray-50 dark:focus-visible:bg-white/10"
              >
                {item.icon && (
                  <span className="shrink-0 text-muted" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
