import { test, expect, DEMO, signIn } from './fixtures';

// The admin area, and keeping everyone else out of it.

test('a traveller cannot open the admin area', async ({ page }) => {
  await signIn(page, DEMO.traveller);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('a visitor who is not signed in cannot open the admin area', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).not.toHaveURL(/\/admin/);
});

test('an admin can open the admin pages and return to the site', async ({ page }) => {
  await signIn(page, DEMO.admin);
  await page.goto('/admin');
  await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
  for (const section of ['Destinations', 'Users', 'Feedback']) {
    await page.getByRole('navigation', { name: 'Admin navigation' }).getByRole('link', { name: section }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await page.getByRole('banner').getByRole('link', { name: 'Back to site' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('an admin can reach the admin area from their dashboard', async ({ page }) => {
  await signIn(page, DEMO.admin);
  await page.goto('/dashboard');
  await page.getByRole('link', { name: 'Admin Panel' }).first().click();
  await expect(page).toHaveURL(/\/admin$/);
});

test('@mobile on a phone, an admin can get back to the site', async ({ page }) => {
  await signIn(page, DEMO.admin);
  await page.goto('/admin');
  // From the header
  await page.getByRole('banner').getByRole('link', { name: 'Back to site' }).click();
  await expect(page).toHaveURL(/\/$/);
  // And from the slide-out menu
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.locator('aside').filter({ visible: true }).getByRole('link', { name: 'Back to site' }).click();
  await expect(page).toHaveURL(/\/$/);
});
