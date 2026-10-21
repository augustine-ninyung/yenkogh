import { defineConfig, devices } from '@playwright/test';

// Browser tests for the main user journeys. The app runs in demo mode (see
// .env.e2e), so every test starts from empty browser storage and never touches
// the live database. Run with: npm run test:e2e
const PORT = 5174;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    // A production build, as deployed, rather than the dev server (which reloads
    // the page while it prepares dependencies on a cold start)
    command: `npx vite build --mode e2e --outDir dist-e2e --emptyOutDir --logLevel warn && npx vite preview --mode e2e --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
