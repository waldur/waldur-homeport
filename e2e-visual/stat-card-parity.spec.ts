import * as path from 'path';
import { fileURLToPath } from 'url';

import { test } from '@playwright/test';

import { createParityHarness } from './visualParityHarness';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pixel-diffs the Tailwind/shadcn StatCard against the real (Bootstrap)
 * StatsCard, case by case, to verify StatCard is a true drop-in replacement
 * before it's ever wired into production call sites. Shares its checks
 * (dimension parity, pixelmatch ratio, dominant-color chromaticity) with
 * base-button-parity.spec.ts via visualParityHarness.ts — see that file and
 * docs/tailwind-shadcn-migration-notes.md for the full rationale. Both
 * components render side by side on the same page —
 * src/core/StatCardParity.stories.tsx — so there's no committed baseline
 * image to go stale.
 *
 * Run with: yarn playwright test stat-card-parity --project visual --workers=1
 *
 * Only "basic" and "with-hint" cases are covered — see
 * StatCardParity.stories.tsx's comment for why `icon` and the Badge-driven
 * `trend` footer are deliberately excluded from this harness for now.
 */

const CASES = ['basic', 'with-hint'] as const;

const { gotoParity, expectPixelParity } = createParityHarness({
  storyId: 'migration-statcard-parity--default',
  diffDir: path.join(__dirname, '../test-results/stat-card-parity-diffs'),
  thresholds: {
    maxDimensionSlackPx: 0.5,
    // Measured (not borrowed from BaseButtonTw's own, much looser
    // thresholds) across all 4 cases (2 shapes x 2 themes): max ratio
    // 4.76%. StatCard is large solid-fill blocks with far less
    // antialiasing-prone geometry than a small button's text/border, so
    // BaseButtonTw's 0.16 would hide a real StatCard-sized regression —
    // 0.06 keeps roughly the same ~1.2x margin over measured noise that
    // base-button-parity.spec.ts itself uses (13.10% measured / 16%
    // threshold), scaled to this component's actual ceiling.
    diffRatioThreshold: 0.06,
    pixelmatchThreshold: 0.25,
    foregroundDistanceThreshold: 30,
    // Measured ceiling across all 4 cases: max 0.37 (out of 255). Set to 3 —
    // ~8x margin over that noise floor, while staying far below the ~11
    // signal this check actually measured for a real bug caught while
    // building this spec (dark mode's --surface-card-bg token was one gray
    // step too light for StatCard's bordered variant — see StatCard.tsx's
    // dark:bg override comment).
    chromaticityTolerance: 3,
  },
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`StatCard parity — ${theme}`, () => {
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
