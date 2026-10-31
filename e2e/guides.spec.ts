import { test, expect, DEMO, signIn } from './fixtures';

// The tour guide directory: only verified guides who agreed to be listed appear.

test('with no verified guides, the page says so', async ({ page }) => {
  await page.goto('/guides');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tour guides');
  await expect(page.getByText('No guides listed yet')).toBeVisible();
});

test('a guide stays private until verified, then appears publicly', async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page, DEMO.admin);
  await page.goto('/admin/guides');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tour guides');

  // Add the guide as a draft, unverified
  await page.getByRole('button', { name: /Add|New/ }).first().click();
  const form = page.getByRole('dialog');
  await form.getByLabel('Full name').fill('Esi Test Guide');
  await form.getByLabel('Main region').selectOption({ label: 'Central' });
  await form.getByLabel('Languages').fill('English\nFante');
  await form.getByLabel('Phone').fill('+233 24 000 0000');
  await form.getByRole('button', { name: /Save|Create|Add/ }).last().click();
  await expect(form).toBeHidden();

  // Publishing is refused, and the public page stays empty
  await page.getByRole('button', { name: 'Publish Esi Test Guide' }).click();
  await expect(page.getByText(/before publishing this guide/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish Esi Test Guide' })).toBeVisible();
  await page.goto('/guides');
  await expect(page.getByText('No guides listed yet')).toBeVisible();

  // Record the check and the guide's agreement, then publish
  await page.goto('/admin/guides');
  await page.getByRole('button', { name: 'Edit Esi Test Guide' }).click();
  await form.getByLabel('Licence number').fill('GTA-12345');
  await form.getByLabel('Date checked').fill('2026-10-31');
  await form.getByLabel(/^Verified/).check();
  await form.getByLabel(/has agreed to be listed/).check();
  await form.getByRole('button', { name: /Save/ }).last().click();
  await expect(form).toBeHidden();
  await page.getByRole('button', { name: 'Publish Esi Test Guide' }).click();
  await expect(page.getByRole('button', { name: 'Unpublish Esi Test Guide' })).toBeVisible();

  // Now it is public, with its licence and a working contact link
  await page.goto('/guides');
  await expect(page.getByRole('heading', { name: 'Esi Test Guide' })).toBeVisible();
  await expect(page.getByText(/Licence GTA-12345, checked on/)).toBeVisible();
  await expect(page.getByRole('link', { name: '+233 24 000 0000' })).toHaveAttribute('href', 'tel:+233240000000');

  // Search narrows the list
  await page.getByLabel('Search tour guides').fill('nobody like this');
  await expect(page.getByText('No guides match your search')).toBeVisible();
  await page.getByLabel('Search tour guides').fill('fante');
  await expect(page.getByRole('heading', { name: 'Esi Test Guide' })).toBeVisible();
});

test('@mobile admin pages fit a 320 px screen', async ({ page }) => {
  await signIn(page, DEMO.admin);
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of ['/admin', '/admin/guides', '/admin/traffic', '/guides']) {
    await page.goto(path);
    await page.locator('#main').waitFor();
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBe(0);
  }
});
