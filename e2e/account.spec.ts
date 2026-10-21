import { test, expect, DEMO, signIn } from './fixtures';

// Creating, using and deleting an account.

const newTraveller = () => ({
  name: 'Ama Owusu',
  email: `ama.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
  password: 'Str0ng!pass',
});

test('sign-up needs consent, then creates the account', async ({ page }) => {
  const who = newTraveller();
  await page.goto('/register');
  await page.getByLabel('Full name').fill(who.name);
  await page.getByLabel('Email address').fill(who.email);
  await page.getByLabel('Password', { exact: true }).fill(who.password);
  await page.getByLabel('Confirm password').fill(who.password);

  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'agree to the Terms of Use' })).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);

  await page.getByRole('checkbox', { name: /I agree to the Terms of Use/ }).check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ama');
});

test('a wrong password is refused with a clear message', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(DEMO.traveller.email);
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText(/Incorrect password/)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('a traveller can add, change and remove a profile photo', async ({ page }) => {
  await signIn(page, DEMO.traveller);
  await page.goto('/profile');

  // A real photo, made in the browser so the test needs no image file
  const png = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(0, 0, 640, 480);
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: Buffer.from(png) });
  await expect(page.getByText('Profile photo updated')).toBeVisible();

  // It is stored as a small re-encoded square, not the original file
  const avatar = page.getByRole('img', { name: DEMO.traveller.name }).locator('img').first();
  await expect(avatar).toHaveAttribute('src', /^data:image\/(webp|jpeg);base64,/);
  const size = await avatar.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
  expect(size).toEqual([320, 320]);

  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Profile photo removed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add photo' })).toBeVisible();
});

test('a file that is not a photo is refused', async ({ page }) => {
  await signIn(page, DEMO.traveller);
  await page.goto('/profile');
  await page.locator('input[type="file"]').setInputFiles({ name: 'evil.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg onload="alert(1)"/>') });
  await expect(page.getByText('Choose a JPEG, PNG or WebP photo.')).toBeVisible();
});

test('a traveller can delete their account, and it is gone', async ({ page }) => {
  const who = newTraveller();
  await page.goto('/register');
  await page.getByLabel('Full name').fill(who.name);
  await page.getByLabel('Email address').fill(who.email);
  await page.getByLabel('Password', { exact: true }).fill(who.password);
  await page.getByLabel('Confirm password').fill(who.password);
  await page.getByRole('checkbox', { name: /I agree to the Terms of Use/ }).check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Delete my account' }).click();
  const dialog = page.getByRole('dialog');
  const confirm = dialog.getByRole('button', { name: 'Delete permanently' });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel(/Type DELETE to confirm/).fill('DELETE');
  await confirm.click();
  await expect(page).toHaveURL(/\/$/);

  // Signing in again fails: the account no longer exists
  await page.goto('/login');
  await page.getByLabel('Email address').fill(who.email);
  await page.getByLabel('Password', { exact: true }).fill(who.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText(/No account found/)).toBeVisible();
});
