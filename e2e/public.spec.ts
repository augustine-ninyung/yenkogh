import { test, expect } from './fixtures';

// Pages anyone can see without signing in.

test('a visitor can find a destination and open its page', async ({ page }) => {
  await page.goto('/explore');
  await page.getByLabel('Search destinations').fill('Kakum');
  const card = page.getByRole('link', { name: /Kakum National Park/ }).first();
  await expect(card).toBeVisible();
  await card.click();

  await expect(page).toHaveURL(/\/explore\/kakum/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kakum National Park');
  // Photos are credited, and the gallery opens
  await expect(page.getByRole('link', { name: /author and licence on Wikimedia Commons/ })).toHaveAttribute('href', /commons\.wikimedia\.org\/wiki\/File:/);
  await page.getByRole('button', { name: /View Kakum canopy walkway/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('no invented ratings are shown on destination cards', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByRole('link', { name: /Cape Coast Castle/ }).first()).toBeVisible();
  await expect(page.getByText(/\(\d{3,}\)/)).toHaveCount(0);
});

for (const [path, heading, footerLink] of [
  ['/privacy', 'Privacy Policy', 'Privacy'],
  ['/terms', 'Terms of Use', 'Terms'],
  ['/cookies', 'Cookie Policy', 'Cookies'],
  ['/credits', 'Photo credits', 'Photo credits'],
] as const) {
  test(`the ${heading} page is reachable from the footer`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: footerLink, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  });
}

test('every photo on the credits page links to its source', async ({ page }) => {
  await page.goto('/credits');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Photo credits');
  const sources = page.getByRole('link', { name: 'Photographer and licence' });
  expect(await sources.count()).toBeGreaterThan(60);
  for (const href of await sources.evaluateAll((links) => links.map((a) => a.getAttribute('href')))) {
    expect(href).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  }
});

test('an unknown address shows the not-found page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('members-only pages send visitors to sign in, then back', async ({ page }) => {
  await page.goto('/planner');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email address').fill('user@yenkogh.com');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/planner$/);
});

test('keyboard users can skip straight to the content', async ({ page }) => {
  await page.goto('/explore');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
