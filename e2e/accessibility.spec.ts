import AxeBuilder from '@axe-core/playwright';
import { test, expect, DEMO, signIn } from './fixtures';

// Automated WCAG 2.1 AA checks with axe-core on the main pages, in both themes.
// These catch a large share of problems (contrast, names, labels, structure),
// though not everything: keyboard and screen-reader checks by hand still matter.

const PUBLIC_PAGES = ['/', '/explore', '/explore/kakum-national-park', '/events', '/login', '/register', '/privacy', '/credits'];
const MEMBER_PAGES = ['/dashboard', '/profile', '/planner', '/budget', '/transportation'];

async function audit(page: import('@playwright/test').Page) {
  // Let entrance animations finish so colours are checked as people see them
  await page.waitForTimeout(800);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  return serious.map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n    ')}`);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('yenkogh_theme', t), theme);
    });

    for (const path of PUBLIC_PAGES) {
      test(`${path} has no serious accessibility problems`, async ({ page }) => {
        await page.goto(path);
        await page.locator('#main').waitFor();
        expect(await audit(page)).toEqual([]);
      });
    }

    for (const path of MEMBER_PAGES) {
      test(`${path} (signed in) has no serious accessibility problems`, async ({ page }) => {
        await signIn(page, DEMO.traveller);
        await page.goto(path);
        await page.locator('#main').waitFor();
        expect(await audit(page)).toEqual([]);
      });
    }
  });
}
