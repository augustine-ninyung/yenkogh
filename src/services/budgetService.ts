import type { Budget, BudgetCategory, BudgetItem, BudgetCategoryKey } from '@/types';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'yenkogh_budgets';
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const DEFAULT_CATEGORIES: Array<{
  key: BudgetCategoryKey;
  label: string;
  allocated: number;
  spent: number;
  color: string;
}> = [
  { key: 'transportation', label: 'Transportation', allocated: 0, spent: 0, color: '#3B82F6' },
  { key: 'accommodation', label: 'Accommodation', allocated: 0, spent: 0, color: '#8B5CF6' },
  { key: 'food', label: 'Food & Drinks', allocated: 0, spent: 0, color: '#F59E0B' },
  { key: 'activities', label: 'Activities', allocated: 0, spent: 0, color: '#10B981' },
  { key: 'entranceFees', label: 'Entrance Fees', allocated: 0, spent: 0, color: '#EF4444' },
  { key: 'shopping', label: 'Shopping', allocated: 0, spent: 0, color: '#EC4899' },
  { key: 'miscellaneous', label: 'Miscellaneous', allocated: 0, spent: 0, color: '#6B7280' },
];

/** Categories with an even allocation and `spent` totalled from the given lines. */
const buildCategories = (totalBudget: number, items: BudgetItem[]): BudgetCategory[] => {
  const perCategory = Math.round(totalBudget / DEFAULT_CATEGORIES.length);
  return DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    allocated: perCategory,
    spent: items.filter((i) => i.category === c.key).reduce((sum, i) => sum + i.amount, 0),
  }));
};

// ─── Backend (Supabase) ───────────────────────────────────────────────────────

/** A row of the `budgets` table. */
interface BudgetRow {
  id: string;
  user_id: string;
  trip_id: string | null;
  name: string;
  total_budget: number | string;
  currency: 'GHS';
  categories: BudgetCategory[];
  items: BudgetItem[];
  created_at: string;
  updated_at: string;
}

const rowToBudget = (row: BudgetRow): Budget => ({
  id: row.id,
  userId: row.user_id,
  tripId: row.trip_id ?? undefined,
  name: row.name,
  // Postgres numerics arrive as strings
  totalBudget: Number(row.total_budget),
  currency: row.currency,
  categories: row.categories ?? [],
  items: row.items ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function fetchRemote(id: string): Promise<Budget> {
  if (!supabase) throw new Error('Backend is not configured.');
  const { data, error } = await supabase.from('budgets').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Budget not found');
  return rowToBudget(data as BudgetRow);
}

async function patchRemote(id: string, row: Partial<BudgetRow>): Promise<Budget> {
  if (!supabase) throw new Error('Backend is not configured.');
  const { data, error } = await supabase
    .from('budgets')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToBudget(data as BudgetRow);
}

/** Replaces a budget's lines and re-totals its categories. */
const saveItemsRemote = (budget: Budget, items: BudgetItem[]) =>
  patchRemote(budget.id, { items, categories: buildCategories(budget.totalBudget, items) });

// ─── Local fallback ───────────────────────────────────────────────────────────

function readAll(): Budget[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Budget[];
  } catch {
    return [];
  }
}

function writeAll(budgets: Budget[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}

// ─── Budget Service ───────────────────────────────────────────────────────────

export const budgetService = {
  async getAll(userId: string): Promise<Budget[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data as BudgetRow[]).map(rowToBudget);
    }
    await delay(300);
    return readAll().filter((b) => b.userId === userId);
  },

  async getById(id: string): Promise<Budget | null> {
    if (supabase) {
      const { data, error } = await supabase.from('budgets').select('*').eq('id', id).maybeSingle();
      if (error) return null;
      return data ? rowToBudget(data as BudgetRow) : null;
    }
    await delay(200);
    return readAll().find((b) => b.id === id) ?? null;
  },

  /** The budget linked to a trip, if one has been created. */
  async getByTripId(tripId: string): Promise<Budget | null> {
    if (supabase) {
      const { data, error } = await supabase.from('budgets').select('*').eq('trip_id', tripId).maybeSingle();
      if (error) return null;
      return data ? rowToBudget(data as BudgetRow) : null;
    }
    await delay(200);
    return readAll().find((b) => b.tripId === tripId) ?? null;
  },

  /**
   * Creates or refreshes the budget linked to a trip. `items` replaces the
   * budget's lines in full, so the caller passes both the plan's lines and the
   * traveller's own.
   */
  async syncForTrip(
    userId: string,
    data: { tripId: string; name: string; totalBudget: number; items: BudgetItem[] },
  ): Promise<Budget> {
    const categories = buildCategories(data.totalBudget, data.items);

    if (supabase) {
      const existing = await budgetService.getByTripId(data.tripId);
      if (existing) {
        return patchRemote(existing.id, {
          name: data.name,
          total_budget: data.totalBudget,
          items: data.items,
          categories,
        });
      }
      const { data: created, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          trip_id: data.tripId,
          name: data.name,
          total_budget: data.totalBudget,
          items: data.items,
          categories,
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return rowToBudget(created as BudgetRow);
    }

    await delay(200);
    const all = readAll();
    const now = new Date().toISOString();
    const existing = all.find((b) => b.tripId === data.tripId);
    const budget: Budget = {
      id: existing?.id ?? `budget-${Date.now()}`,
      userId,
      tripId: data.tripId,
      name: data.name,
      totalBudget: data.totalBudget,
      currency: 'GHS',
      categories,
      items: data.items,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    writeAll(existing ? all.map((b) => (b.id === existing.id ? budget : b)) : [...all, budget]);
    return budget;
  },

  async create(
    userId: string,
    data: { name: string; totalBudget: number; tripId?: string },
  ): Promise<Budget> {
    if (supabase) {
      const { data: created, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          trip_id: data.tripId ?? null,
          name: data.name,
          total_budget: data.totalBudget,
          items: [],
          categories: buildCategories(data.totalBudget, []),
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return rowToBudget(created as BudgetRow);
    }

    await delay(400);
    const budget: Budget = {
      id: `budget-${Date.now()}`,
      userId,
      tripId: data.tripId,
      name: data.name,
      totalBudget: data.totalBudget,
      currency: 'GHS',
      categories: buildCategories(data.totalBudget, []),
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeAll([...readAll(), budget]);
    return budget;
  },

  async update(id: string, updates: Partial<Budget>): Promise<Budget> {
    if (supabase) {
      const row: Partial<BudgetRow> = {};
      if (updates.name !== undefined) row.name = updates.name;
      if (updates.totalBudget !== undefined) row.total_budget = updates.totalBudget;
      if (updates.items !== undefined) row.items = updates.items;
      if (updates.categories !== undefined) row.categories = updates.categories;
      if ('tripId' in updates) row.trip_id = updates.tripId ?? null;
      return patchRemote(id, row);
    }
    await delay(300);
    const all = readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Budget not found');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    writeAll(all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    await delay(300);
    writeAll(readAll().filter((b) => b.id !== id));
  },

  async addItem(budgetId: string, item: Omit<BudgetItem, 'id'>): Promise<Budget> {
    if (supabase) {
      const budget = await fetchRemote(budgetId);
      const newItem: BudgetItem = { ...item, id: `item-${Date.now()}-${budget.items.length}` };
      return saveItemsRemote(budget, [...budget.items, newItem]);
    }
    await delay(200);
    const all = readAll();
    const idx = all.findIndex((b) => b.id === budgetId);
    if (idx === -1) throw new Error('Budget not found');
    // Two items added in the same millisecond must not share an id
    const newItem: BudgetItem = { ...item, id: `item-${Date.now()}-${all[idx].items.length}` };
    all[idx].items.push(newItem);
    // Update the 'spent' total for the relevant category
    const catIdx = all[idx].categories.findIndex((c) => c.key === item.category);
    if (catIdx !== -1) all[idx].categories[catIdx].spent += item.amount;
    all[idx].updatedAt = new Date().toISOString();
    writeAll(all);
    return all[idx];
  },

  async removeItem(budgetId: string, itemId: string): Promise<Budget> {
    if (supabase) {
      const budget = await fetchRemote(budgetId);
      return saveItemsRemote(budget, budget.items.filter((i) => i.id !== itemId));
    }
    await delay(200);
    const all = readAll();
    const idx = all.findIndex((b) => b.id === budgetId);
    if (idx === -1) throw new Error('Budget not found');
    const item = all[idx].items.find((i) => i.id === itemId);
    if (item) {
      const catIdx = all[idx].categories.findIndex((c) => c.key === item.category);
      if (catIdx !== -1) all[idx].categories[catIdx].spent -= item.amount;
    }
    all[idx].items = all[idx].items.filter((i) => i.id !== itemId);
    all[idx].updatedAt = new Date().toISOString();
    writeAll(all);
    return all[idx];
  },

  // Synchronous calculation helpers (no delay needed — operate on in-memory budget object)
  calculateTotal(budget: Budget): number {
    return budget.items.reduce((sum, i) => sum + i.amount, 0);
  },

  calculateByCategory(budget: Budget): Record<string, number> {
    return budget.items.reduce(
      (acc, i) => ({ ...acc, [i.category]: (acc[i.category] ?? 0) + i.amount }),
      {} as Record<string, number>,
    );
  },

  calculateRemaining(budget: Budget): number {
    return budget.totalBudget - budgetService.calculateTotal(budget);
  },
};
