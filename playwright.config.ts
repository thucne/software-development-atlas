import { defineConfig, devices } from '@playwright/test';

const port = process.env.PORT || 3005;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? `npx pnpm start -p ${port}` : `npx pnpm dev -p ${port}`,
    url: `http://127.0.0.1:${port}/learn/docs`,
    reuseExistingServer: !process.env.CI,
  },
});
