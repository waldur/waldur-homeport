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
    {
      name: 'visual',
      testDir: './e2e-visual',
      snapshotDir: './e2e-visual/snapshots',
      use: { ...devices['Desktop Chrome'] },
      expect: {
        toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
      },
    },
  ],
  webServer: [
    {
      command: 'yarn start',
      url: 'http://localhost:8001',
      reuseExistingServer: !process.env.CI,
    },
    // focus-ring.spec.ts and top-bar-geometry.spec.ts render Storybook
    // stories (see .storybook/preview.tsx) instead of a route on the main
    // app — needs its own server.
    {
      command: 'yarn storybook --ci',
      url: 'http://localhost:6006',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
