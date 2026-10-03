import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Trash2, ArrowRight } from 'lucide-react';
import type { Budget } from '@/types';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters';
import { budgetService } from '@/services/budgetService';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface BudgetCardProps {
  budget: Budget;
  onDelete?: (id: string) => void;
  className?: string;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onDelete, className }) => {
  const totalSpent = budgetService.calculateTotal(budget);
  const remaining = budgetService.calculateRemaining(budget);
  const percentSpent = budget.totalBudget > 0
    ? Math.min(100, Math.round((totalSpent / budget.totalBudget) * 100))
    : 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#262B32] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between',
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD300]/20 flex items-center justify-center text-[#090C11] dark:text-[#FFD300]">
              <Wallet size={16} />
            </div>
            <h3 className="font-bold text-base text-[#090C11] dark:text-white line-clamp-1">
              {budget.name}
            </h3>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="text-[#757B81] hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              aria-label={`Delete budget ${budget.name}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-[#757B81] dark:text-white/70 mb-1.5">
            <span>Spent: {formatCurrency(totalSpent)}</span>
            <span>Total: {formatCurrency(budget.totalBudget)}</span>
          </div>
          <ProgressBar value={percentSpent} size="sm" />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-4">
          <div>
            <span className="text-[#757B81] dark:text-white/50 block text-[11px]">Remaining</span>
            <span className={cn('font-bold', remaining < 0 ? 'text-red-500' : 'text-emerald-500')}>
              {formatCurrency(remaining)}
            </span>
          </div>
          <div>
            <span className="text-[#757B81] dark:text-white/50 block text-[11px]">Expenses</span>
            <span className="font-bold text-[#090C11] dark:text-white">
              {budget.items?.length || 0} logged
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end">
        <Link
          to={`/budget?budgetId=${budget.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-[#090C11] dark:text-white hover:bg-[#FFD300] hover:text-[#090C11] transition-all"
        >
          <span>Manage Budget</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
