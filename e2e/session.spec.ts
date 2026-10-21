import { test, expect, DEMO, signIn } from './fixtures';

// Signing out asks first, and an idle session warns, then signs out.

test.describe('signing out', () => {
  test('asks first, and cancelling keeps you signed in', async ({ page }) => {
    await signIn(page, DEMO.traveller);
    await page.getByRole('button', { name: 'Sign out' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sign out?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.getByRole('dialog', { name: 'Sign out?' }).getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('from the account menu on the main site', async ({ page }) => {
    await signIn(page, DEMO.traveller);
    await page.goto('/explore');
    await page.getByRole('button', { name: /Account menu for/ }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.getByRole('dialog', { name: 'Sign out?' }).getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
  });
});

test.describe('inactivity', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await signIn(page, DEMO.traveller);
  });

  test('after 10 idle minutes a warning offers to continue the session', async ({ page }) => {
    await page.clock.fastForward('09:50');
    await expect(page.getByRole('dialog', { name: 'Are you still there?' })).toBeHidden();

    await page.clock.fastForward('00:15');
    const warning = page.getByRole('dialog', { name: 'Are you still there?' });
    await expect(warning).toBeVisible();
    await expect(warning.getByRole('timer')).toContainText('seconds');

    await warning.getByRole('button', { name: 'Continue session' }).click();
    await expect(warning).toBeHidden();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('ignoring the warning signs you out when the countdown ends', async ({ page }) => {
    await page.clock.fastForward('10:05');
    await expect(page.getByRole('dialog', { name: 'Are you still there?' })).toBeVisible();

    await page.clock.fastForward('01:00');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('You were signed out after 10 minutes without activity.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('activity keeps the session going', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.clock.fastForward('06:00');
      await page.mouse.move(100 + i * 20, 200);
      await page.keyboard.press('Shift');
    }
    // 18 minutes have passed, but never 10 without activity
    await expect(page.getByRole('dialog', { name: 'Are you still there?' })).toBeHidden();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
