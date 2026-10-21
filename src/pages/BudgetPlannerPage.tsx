import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  PieChart as PieIcon,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { budgetService } from '@/services/budgetService';
import { tripService } from '@/services/tripService';
import { formatCurrency, formatDateRange } from '@/utils/formatters';
import { isPlanItem } from '@/utils/tripPlanning';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Budget, BudgetCategoryKey, BudgetItem, Trip } from '@/types';

const CATEGORY_META: Record<BudgetCategoryKey, { label: string; color: string }> = {
  transportation: { label: 'Transportation (Bus/Taxi)', color: '#3B82F6' },
  accommodation: { label: 'Accommodation (Hotels/Lodge)', color: '#8B5CF6' },
  food: { label: 'Food & Dining (Chop bars/Jollof)', color: '#F59E0B' },
  activities: { label: 'Activities & Tours', color: '#10B981' },
  entranceFees: { label: 'Heritage & Park Entry Fees', color: '#EF4444' },
  shopping: { label: 'Kente & Souvenirs', color: '#EC4899' },
  miscellaneous: { label: 'Emergency & Miscellaneous', color: '#6B7280' },
};

// The page's example budget, shown until a saved budget is opened
const SAMPLE_ITEMS: BudgetItem[] = [
  { id: '1', name: 'STC Bus Accra to Cape Coast', amount: 90, category: 'transportation' },
  { id: '2', name: 'Cape Coast Hotel (2 Nights)', amount: 700, category: 'accommodation' },
  { id: '3', name: 'Kakum Canopy Walk Entry', amount: 60, category: 'entranceFees' },
  { id: '4', name: 'Cape Coast Castle Guided Tour', amount: 80, category: 'entranceFees' },
  { id: '5', name: 'Local Dining (Waakye & Seafood)', amount: 250, category: 'food' },
  { id: '6', name: 'Souvenirs & Kente Strips', amount: 150, category: 'shopping' },
];

// Selector value for the unsaved example budget
const SCRATCH = 'scratch';

export const BudgetPlannerPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tripParam = searchParams.get('trip');

  // Saved budgets and the trips they belong to
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedId, setSelectedId] = useState<string>(SCRATCH);

  const [totalBudget, setTotalBudget] = useState(3000);
  const [items, setItems] = useState<BudgetItem[]>(SAMPLE_ITEMS);

  // New Item Input State
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemCategory, setItemCategory] = useState<BudgetCategoryKey>('food');

  const activeBudget = budgets.find((b) => b.id === selectedId) ?? null;
  const activeTrip = trips.find((t) => t.id === activeBudget?.tripId) ?? null;

  const showBudget = (budget: Budget | null) => {
    setSelectedId(budget?.id ?? SCRATCH);
    setTotalBudget(budget?.totalBudget ?? 3000);
    setItems(budget?.items ?? SAMPLE_ITEMS);
  };

  // Load the traveller's budgets, opening the one for the trip named in the URL
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([budgetService.getAll(user.id), tripService.getAll(user.id)]).then(async ([loaded, userTrips]) => {
      if (cancelled) return;
      let all = loaded;
      let target = tripParam ? all.find((b) => b.tripId === tripParam) : undefined;

      // A trip added without an itinerary has no budget yet, so start one for it
      const trip = userTrips.find((t) => t.id === tripParam);
      if (tripParam && trip && !target) {
        target = await budgetService.syncForTrip(user.id, {
          tripId: trip.id,
          name: `${trip.name} budget`,
          totalBudget: 3000,
          items: [],
        });
        await tripService.update(trip.id, { budgetId: target.id });
        if (cancelled) return;
        all = [...all, target];
      }

      setBudgets(all);
      setTrips(userTrips);
      if (target) showBudget(target);
    });
    return () => {
      cancelled = true;
    };
  }, [user, tripParam]);

  const handleSelect = (id: string) => {
    const budget = budgets.find((b) => b.id === id) ?? null;
    showBudget(budget);
    setSearchParams(budget?.tripId ? { trip: budget.tripId } : {});
  };

  /** Keeps the list of saved budgets in step after a change is stored. */
  const applySaved = (saved: Budget) => {
    setBudgets((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
    setItems(saved.items);
    setTotalBudget(saved.totalBudget);
  };

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

  const handleTotalChange = (value: number) => {
    setTotalBudget(value);
    // A saved budget stores its new target as soon as it is changed
    if (activeBudget) budgetService.update(activeBudget.id, { totalBudget: value }).then(applySaved);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(itemAmount);
    if (!itemName.trim() || isNaN(amt) || amt <= 0) return;

    const name = itemName.trim();
    setItemName('');
    setItemAmount('');

    if (activeBudget) {
      applySaved(await budgetService.addItem(activeBudget.id, { name, amount: amt, category: itemCategory }));
    } else {
      setItems([...items, { id: Date.now().toString(), name, amount: amt, category: itemCategory }]);
    }

    addToast({
      variant: 'success',
      title: 'Expense Added',
      message: activeTrip
        ? `${name} (${formatCurrency(amt)}) added to the budget for ${activeTrip.name}.`
        : `${name} (${formatCurrency(amt)}) added to budget.`,
    });
  };

  const handleRemoveItem = async (id: string) => {
    if (activeBudget) applySaved(await budgetService.removeItem(activeBudget.id, id));
    else setItems(items.filter((i) => i.id !== id));
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
      let saved = await budgetService.create(user.id, {
        name: `Ghana Journey Budget (${new Date().toLocaleDateString()})`,
        totalBudget,
      });

      for (const it of items) {
        saved = await budgetService.addItem(saved.id, { name: it.name, amount: it.amount, category: it.category });
      }

      setBudgets((prev) => [...prev, saved]);
      showBudget(saved);

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
            Estimate what your trip will cost before you pack. Allocate funds across transport, hotels, meals, park entrance fees, and souvenirs in Ghana Cedis.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Which budget: one per saved trip, plus the unsaved example */}
        {budgets.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
              <label htmlFor="budget-select" className="text-xs uppercase font-semibold text-muted block mb-1.5">
                Budget for
              </label>
              <select
                id="budget-select"
                value={selectedId}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full md:w-96 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
              >
                {budgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {trips.find((t) => t.id === b.tripId)?.name ?? b.name}
                  </option>
                ))}
                <option value={SCRATCH}>New budget (not saved yet)</option>
              </select>
            </div>

            {activeTrip && (
              <div className="text-sm md:text-right">
                <p className="text-muted dark:text-white/70">
                  {formatDateRange(activeTrip.startDate, activeTrip.endDate)} · {activeTrip.numberOfTravelers}{' '}
                  {activeTrip.numberOfTravelers === 1 ? 'traveler' : 'travelers'}
                </p>
                <Link
                  to={activeTrip.itinerary ? `/planner?tripId=${activeTrip.id}` : `/planner?festival=${activeTrip.festivalId ?? ''}`}
                  className="inline-flex items-center gap-1.5 font-semibold hover:text-[#FFD300] transition-colors mt-1"
                >
                  {activeTrip.itinerary ? 'Open this trip in the planner' : 'Plan this trip'} <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Top Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-2">
            <span className="text-xs uppercase font-semibold text-muted block">
              Total Budget
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#090C11] dark:text-white">
                {formatCurrency(totalBudget)}
              </span>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-muted">Adjust target:</span>
              <input
                type="number"
                step={100}
                min={0}
                max={100000000}
                aria-label="Target budget in Ghana Cedis"
                value={totalBudget}
                onChange={(e) => handleTotalChange(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-2">
            <span className="text-xs uppercase font-semibold text-muted block">
              Total Estimated Expenses
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#090C11] dark:text-white">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs font-medium text-muted">({percentSpent}%)</span>
            </div>
            <ProgressBar value={percentSpent} size="sm" />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-2">
            <span className="text-xs uppercase font-semibold text-muted block">
              Budget Remaining
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-3xl font-bold ${
                  remaining < 0 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(remaining)}
              </span>
            </div>
            <p className="text-xs text-muted">
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
                <span>Add an Expense Item{activeTrip ? ` to ${activeTrip.name}` : ''}</span>
              </h3>

              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Expense title (e.g., Fufu dinner, STC Bus)"
                    aria-label="Expense title"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    maxLength={80}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Cost (GH₵)"
                    aria-label="Cost in Ghana Cedis"
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <select
                    aria-label="Expense category"
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
                {activeBudget ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Changes save automatically</span>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSaveBudget}>
                    Save Budget Plan
                  </Button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">
                  No expense items added yet. Use the form above to add your expected costs.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {items.map((item) => {
                    const meta = CATEGORY_META[item.category] || { label: item.category, color: '#FFD300' };
                    // Lines that come from the trip plan are changed in the planner, not here
                    const fromPlan = isPlanItem(item);
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
                            <span className="text-[11px] text-muted">
                              {meta.label}
                              {fromPlan && ' · from the trip plan'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#090C11] dark:text-white">
                            {formatCurrency(item.amount)}
                          </span>
                          {fromPlan ? (
                            <span className="p-1 text-muted/60" title="Change this in the trip planner">
                              <Lock size={15} aria-label="Set by the trip plan" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-muted hover:text-red-500 p-1 transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
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
                <div className="h-48 flex items-center justify-center text-xs text-muted">
                  Add items to view visual breakdown
                </div>
              )}

              {/* Legend */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/10 text-xs">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-muted dark:text-white/70 truncate max-w-[140px]">
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
