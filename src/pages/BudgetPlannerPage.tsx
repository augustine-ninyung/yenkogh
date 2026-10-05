import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  PieChart as PieIcon,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { budgetService } from '@/services/budgetService';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { BudgetCategoryKey, BudgetItem } from '@/types';

const CATEGORY_META: Record<BudgetCategoryKey, { label: string; color: string }> = {
  transportation: { label: 'Transportation (Bus/Taxi)', color: '#3B82F6' },
  accommodation: { label: 'Accommodation (Hotels/Lodge)', color: '#8B5CF6' },
  food: { label: 'Food & Dining (Chop bars/Jollof)', color: '#F59E0B' },
  activities: { label: 'Activities & Tours', color: '#10B981' },
  entranceFees: { label: 'Heritage & Park Entry Fees', color: '#EF4444' },
  shopping: { label: 'Kente & Souvenirs', color: '#EC4899' },
  miscellaneous: { label: 'Emergency & Miscellaneous', color: '#6B7280' },
};

export const BudgetPlannerPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [totalBudget, setTotalBudget] = useState(3000);
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', name: 'STC Bus Accra to Cape Coast', amount: 90, category: 'transportation' },
    { id: '2', name: 'Cape Coast Hotel (2 Nights)', amount: 700, category: 'accommodation' },
    { id: '3', name: 'Kakum Canopy Walk Entry', amount: 60, category: 'entranceFees' },
    { id: '4', name: 'Cape Coast Castle Guided Tour', amount: 80, category: 'entranceFees' },
    { id: '5', name: 'Local Dining (Waakye & Seafood)', amount: 250, category: 'food' },
    { id: '6', name: 'Souvenirs & Kente Strips', amount: 150, category: 'shopping' },
  ]);

  // New Item Input State
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemCategory, setItemCategory] = useState<BudgetCategoryKey>('food');

  const totalSpent = useMemo(() => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // Chart data
  const chartData = useMemo(() => {
    const group: Record<string, number> = {};
    items.forEach((item) => {
      group[item.category] = (group[item.category] || 0) + item.amount;
    });

    return Object.entries(group).map(([key, val]) => ({
      name: CATEGORY_META[key as BudgetCategoryKey]?.label || key,
      value: val,
      color: CATEGORY_META[key as BudgetCategoryKey]?.color || '#FFD300',
    }));
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(itemAmount);
    if (!itemName.trim() || isNaN(amt) || amt <= 0) return;

    const newItem: BudgetItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      amount: amt,
      category: itemCategory,
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemAmount('');

    addToast({
      variant: 'success',
      title: 'Expense Added',
      message: `${newItem.name} (${formatCurrency(amt)}) added to budget.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSaveBudget = async () => {
    if (!isAuthenticated || !user) {
      addToast({
        variant: 'info',
        title: 'Account Required',
        message: 'Please log in to store this travel budget to your account.',
      });
      return;
    }

    try {
      const budgetObj = await budgetService.create(user.id, {
        name: `Ghana Journey Budget (${new Date().toLocaleDateString()})`,
        totalBudget,
      });

      for (const it of items) {
        await budgetService.addItem(budgetObj.id, it);
      }

      addToast({
        variant: 'success',
        title: 'Budget Saved!',
        message: 'Your travel budget has been securely saved to your dashboard.',
      });
    } catch {
      addToast({
        variant: 'error',
        title: 'Save Failed',
        message: 'Could not save budget. Please try again.',
      });
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Header Banner */}
      <div className="bg-[#262B32] dark:bg-[#090C11] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <Badge variant="warning" className="mb-3">
            Financial Travel Planner
          </Badge>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold mb-3">
            Ghana Travel Budget Calculator
          </h1>
          <p className="text-white/70 max-w-2xl text-sm sm:text-base">
            Know exactly what your trip costs before you pack. Allocate funds across transport, hotels, meals, park entrance fees, and souvenirs in Ghana Cedis.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-2">
            <span className="text-xs uppercase font-semibold text-[#757B81] block">
              Total Budget
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#090C11] dark:text-white">
                {formatCurrency(totalBudget)}
              </span>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-[#757B81]">Adjust target:</span>
              <input
                type="number"
                step={100}
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-2">
            <span className="text-xs uppercase font-semibold text-[#757B81] block">
              Total Estimated Expenses
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#090C11] dark:text-white">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs font-medium text-[#757B81]">({percentSpent}%)</span>
            </div>
            <ProgressBar value={percentSpent} size="sm" />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-2">
            <span className="text-xs uppercase font-semibold text-[#757B81] block">
              Budget Remaining
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-3xl font-bold ${
                  remaining < 0 ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {formatCurrency(remaining)}
              </span>
            </div>
            <p className="text-xs text-[#757B81]">
              {remaining < 0
                ? 'Warning: Expenses exceed your allocated budget!'
                : 'You are well within your planned travel funds.'}
            </p>
          </div>
        </div>

        {/* 2-Column: Expense Items List & Visual Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expenses List & Add Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Expense Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[#FFD300]" />
                <span>Add an Expense Item</span>
              </h3>

              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Expense title (e.g., Fufu dinner, STC Bus)"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Cost (GH₵)"
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as BudgetCategoryKey)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                  >
                    {Object.entries(CATEGORY_META).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4 pt-1 flex justify-end">
                  <Button type="submit" variant="primary" size="sm">
                    Add to Budget
                  </Button>
                </div>
              </form>
            </div>

            {/* Current Items List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                <h3 className="font-bold text-base">Expense Breakdown ({items.length} items)</h3>
                <Button variant="outline" size="sm" onClick={handleSaveBudget}>
                  Save Budget Plan
                </Button>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-[#757B81] text-center py-8">
                  No expense items added yet. Use the form above to add your expected costs.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {items.map((item) => {
                    const meta = CATEGORY_META[item.category] || { label: item.category, color: '#FFD300' };
                    return (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                          <div>
                            <p className="font-semibold text-[#090C11] dark:text-white">
                              {item.name}
                            </p>
                            <span className="text-[11px] text-[#757B81]">{meta.label}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#090C11] dark:text-white">
                            {formatCurrency(item.amount)}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[#757B81] hover:text-red-500 p-1 transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Visual Category Chart Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PieIcon size={18} className="text-[#FFD300]" />
                <span>Spending by Category</span>
              </h3>

              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) =>formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-[#757B81]">
                  Add items to view visual breakdown
                </div>
              )}

              {/* Legend */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/10 text-xs">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[#757B81] dark:text-white/70 truncate max-w-[140px]">
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-semibold">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlannerPage;
