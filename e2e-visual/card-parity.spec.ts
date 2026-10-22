import * as path from 'path';
import { fileURLToPath } from 'url';

import { test } from '@playwright/test';

import { createParityHarness } from './visualParityHarness';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pixel-diffs the waldur-ui Card component family against the real (Bootstrap/Metronic)
 * Card, case by case, to verify dimensional and visual parity.
 *
 * Run with: yarn playwright test card-parity --project visual --workers=1
 */

const CASES = ['basic', 'with-footer', 'body-only', 'bordered'] as const;

const { gotoParity, expectPixelParity } = createParityHarness({
  storyId: 'migration-card-parity--default',
  diffDir: path.join(__dirname, '../test-results/card-parity-diffs'),
  thresholds: {
    maxDimensionSlackPx: 1.0,
    diffRatioThreshold: 0.06,
    pixelmatchThreshold: 0.25,
    foregroundDistanceThreshold: 30,
    chromaticityTolerance: 3,
  },
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Card parity — ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoParity(page, theme);
    });

    for (const caseId of CASES) {
      test(`${caseId}`, async ({ page }) => {
        await expectPixelParity(
          page.locator(`[data-pair="${caseId}"][data-role="old"]`),
          page.locator(`[data-pair="${caseId}"][data-role="new"]`),
          `${theme}-${caseId}`,
        );
      });
    }
  });
}
