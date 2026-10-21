import { test as base, expect, type Page } from '@playwright/test';

// Every test gets a page that cannot reach other servers: photos from
// Wikimedia and the like are answered with an empty response, so tests are
// fast, repeatable and never depend on (or add load to) outside services.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https?:\/\/(?!localhost[:/])/, (route) =>
      route.request().resourceType() === 'image'
        ? route.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64') })
        : route.abort(),
    );
    await use(page);
  },
});

export { expect };

export const DEMO = {
  traveller: { email: 'user@yenkogh.com', password: 'password123', name: 'Kwame Mensah' },
  admin: { email: 'admin@yenkogh.com', password: 'admin123', name: 'Akosua Boateng' },
};

/** Signs in through the login form and waits until the app has moved on. */
export async function signIn(page: Page, who: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(who.email);
  await page.getByLabel('Password', { exact: true }).fill(who.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}
