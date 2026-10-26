import * as path from 'path';
import { fileURLToPath } from 'url';

import { test } from '@playwright/test';

import { createParityHarness } from './visualParityHarness';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pixel-diffs the new Tailwind Avatar / Image / SymbolsGroup components against
 * the legacy Bootstrap/Metronic .symbol implementation.
 *
 * Run with: yarn playwright test avatar-parity --project visual --workers=1
 */

const CASES = [
  'size-24-circle',
  'size-32-circle',
  'size-40-circle',
  'size-50-square',
  'size-60-circle',
  'with-image',
  'avatar-group',
  'classname-size-9',
  'classname-size-50px',
] as const;

const { gotoParity, expectPixelParity } = createParityHarness({
  storyId: 'migration-avatar-parity--default',
  diffDir: path.join(__dirname, '../test-results/avatar-parity-diffs'),
  thresholds: {
    maxDimensionSlackPx: 1.0,
    diffRatioThreshold: 0.08,
    pixelmatchThreshold: 0.25,
    foregroundDistanceThreshold: 30,
    chromaticityTolerance: 5,
  },
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Avatar parity — ${theme}`, () => {
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
