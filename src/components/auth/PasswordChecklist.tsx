import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

// Mirrors validatePassword, so the checklist and the error message never disagree
const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: '8 or more characters', test: (p) => p.length >= 8 },
  { label: 'A letter', test: (p) => /[a-zA-Z]/.test(p) },
  { label: 'A number', test: (p) => /[0-9]/.test(p) },
];

/** The password rules, each ticking green as the password being typed meets it. */
export const PasswordChecklist: React.FC<{ password: string }> = ({ password }) => (
  <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Password requirements">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(password);
      return (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-1.5 text-xs transition-colors',
            met ? 'text-green-700 dark:text-green-400 font-medium' : 'text-[#757B81] dark:text-white/50'
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center w-3.5 h-3.5 rounded-full border',
              met ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 dark:border-white/30'
            )}
          >
            {met && <Check size={10} strokeWidth={3} />}
          </span>
          {rule.label}
          <span className="sr-only">{met ? '(met)' : '(not met yet)'}</span>
        </li>
      );
    })}
  </ul>
);

export default PasswordChecklist;
