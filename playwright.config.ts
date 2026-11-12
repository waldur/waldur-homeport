import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:8001',
  },
  projects: [
    {
      name: 'e2e',
      testDir: './e2e',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn start',
    url: 'http://localhost:8001',
    reuseExistingServer: !process.env.CI,
  },
});
