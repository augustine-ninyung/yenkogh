import { test, expect, DEMO, signIn } from './fixtures';

// Anonymous traffic counts, as the admin sees them.

test('page views are counted and shown to the admin', async ({ page }) => {
  // A visitor looks around
  await page.goto('/explore');
  await page.getByRole('link', { name: /Kakum National Park/ }).first().click();
  await expect(page).toHaveURL(/\/explore\/kakum/);
  await page.goto('/events');

  await signIn(page, DEMO.admin);
  await page.goto('/admin');
  await page.getByRole('navigation', { name: 'Admin navigation' }).getByRole('link', { name: 'Traffic' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Traffic');

  const pages = page.getByRole('region', { name: 'Most opened pages' });
  await expect(pages.getByRole('cell', { name: 'Destinations' })).toBeVisible();
  await expect(pages.getByRole('cell', { name: 'A destination page' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Where visits came from' }).getByRole('cell', { name: 'Direct or bookmarked' })).toBeVisible();

  // The range can be changed, and the table view lists the same figures
  await page.getByRole('button', { name: '7 days' }).click();
  await expect(page.getByRole('button', { name: '7 days' })).toHaveAttribute('aria-pressed', 'true');
  const perDay = page.getByRole('region', { name: 'Page views per day' });
  await perDay.getByText('Show as a table').click();
  await expect(perDay.getByRole('columnheader', { name: 'Page views' })).toBeVisible();
});

test('a browser that sends Global Privacy Control is not counted', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
  await page.goto('/explore');
  await page.goto('/events');
  const stored = await page.evaluate(() => localStorage.getItem('yenkogh_db_page_views'));
  expect(stored).toBeNull();
});
