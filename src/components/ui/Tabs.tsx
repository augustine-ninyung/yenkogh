import React from 'react';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={cn(
        'flex',
        variant === 'default' && 'border-b border-gray-200 dark:border-white/10 gap-0',
        variant === 'pills' && 'gap-2 flex-wrap',
        variant === 'underline' && 'gap-6 border-b border-gray-200 dark:border-white/10',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2 rounded-md',

              // Default variant
              variant === 'default' && [
                'px-4 py-2.5 border-b-2 -mb-px rounded-none',
                isActive
                  ? 'border-[#FFD300] text-[#090C11] dark:text-white'
                  : 'border-transparent text-[#757B81] hover:text-[#262B32] dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20',
              ],

              // Pills variant
              variant === 'pills' && [
                'px-4 py-2 rounded-xl',
                isActive
                  ? 'bg-[#FFD300] text-[#090C11] shadow-sm'
                  : 'text-[#757B81] hover:text-[#262B32] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10',
              ],

              // Underline variant
              variant === 'underline' && [
                'pb-2.5 border-b-2 rounded-none',
                isActive
                  ? 'border-[#FFD300] text-[#090C11] dark:text-white'
                  : 'border-transparent text-[#757B81] hover:text-[#262B32] dark:hover:text-white',
              ]
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-[#090C11]/10 text-[#090C11]'
                    : 'bg-gray-100 dark:bg-white/10 text-[#757B81] dark:text-white/60'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
