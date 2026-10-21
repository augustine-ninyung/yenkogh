import { test, expect, DEMO, signIn } from './fixtures';

// The trip tools a signed-in traveller uses.

test.beforeEach(async ({ page }) => {
  await signIn(page, DEMO.traveller);
});

test('a saved destination appears on the profile', async ({ page }) => {
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Save Kakum National Park' }).click();
  await expect(page.getByRole('button', { name: 'Remove Kakum National Park from saved' })).toBeVisible();

  await page.goto('/profile');
  await page.getByRole('button', { name: /Saved Places \(1\)/ }).click();
  await expect(page.getByRole('link', { name: /Kakum National Park/ })).toBeVisible();
});

test('the trip planner turns a description into a day-by-day plan', async ({ page }) => {
  await page.goto('/planner');
  await page.getByLabel('Describe your trip').fill('2 days at Kakum National Park for two people with GHS 1500');
  await page.getByRole('button', { name: 'Create itinerary' }).click();
  // The description wins over the form's defaults: 2 days, 2 people, within GHS 1,500
  await expect(page.getByText('2-Day Ghana Trip: Kakum National Park')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/^2 Days · 2 Travelers · Estimated Cost: ₵/)).toBeVisible();
  await expect(page.getByText(/over your .* budget/)).toHaveCount(0);
});

test('the budget planner adds an expense', async ({ page }) => {
  await page.goto('/budget');
  await page.getByLabel('Expense title').fill('STC bus to Cape Coast');
  await page.getByLabel('Cost in Ghana Cedis').fill('120');
  await page.getByLabel('Expense category').selectOption({ index: 0 });
  await page.getByLabel('Cost in Ghana Cedis').press('Enter');
  await expect(page.getByText('STC bus to Cape Coast', { exact: true })).toBeVisible();
});
