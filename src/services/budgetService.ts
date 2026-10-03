import type { Budget, BudgetItem, BudgetCategoryKey } from '@/types';

const STORAGE_KEY = 'yenkogh_budgets';
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

export const budgetService = {
  async getAll(userId: string): Promise<Budget[]> {
    await delay(300);
    return readAll().filter((b) => b.userId === userId);
  },

  async getById(id: string): Promise<Budget | null> {
    await delay(200);
    return readAll().find((b) => b.id === id) ?? null;
  },

  async create(
    userId: string,
    data: { name: string; totalBudget: number; tripId?: string },
  ): Promise<Budget> {
    await delay(400);
    const perCategory = Math.round(data.totalBudget / DEFAULT_CATEGORIES.length);
    const budget: Budget = {
      id: `budget-${Date.now()}`,
      userId,
      tripId: data.tripId,
      name: data.name,
      totalBudget: data.totalBudget,
      currency: 'GHS',
      categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, allocated: perCategory })),
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeAll([...readAll(), budget]);
    return budget;
  },

  async update(id: string, updates: Partial<Budget>): Promise<Budget> {
    await delay(300);
    const all = readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Budget not found');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    writeAll(all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    await delay(300);
    writeAll(readAll().filter((b) => b.id !== id));
  },

  async addItem(budgetId: string, item: Omit<BudgetItem, 'id'>): Promise<Budget> {
    await delay(200);
    const all = readAll();
    const idx = all.findIndex((b) => b.id === budgetId);
    if (idx === -1) throw new Error('Budget not found');
    const newItem: BudgetItem = { ...item, id: `item-${Date.now()}` };
    all[idx].items.push(newItem);
    // Update the 'spent' total for the relevant category
    const catIdx = all[idx].categories.findIndex((c) => c.key === item.category);
    if (catIdx !== -1) all[idx].categories[catIdx].spent += item.amount;
    all[idx].updatedAt = new Date().toISOString();
    writeAll(all);
    return all[idx];
  },

  async removeItem(budgetId: string, itemId: string): Promise<Budget> {
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
