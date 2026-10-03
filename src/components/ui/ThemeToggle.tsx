import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
        'text-[#757B81] hover:text-[#262B32] dark:hover:text-white',
        'hover:bg-gray-100 dark:hover:bg-white/10',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2',
        className
      )}
    >
      <span
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        )}
        aria-hidden="true"
      >
        <Sun size={20} />
      </span>
      <span
        className={cn(
          'absolute transition-all duration-300',
          !isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        )}
        aria-hidden="true"
      >
        <Moon size={20} />
      </span>
    </button>
  );
};

export default ThemeToggle;
