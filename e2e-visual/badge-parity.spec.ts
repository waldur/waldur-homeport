import * as path from 'path';
import { fileURLToPath } from 'url';

import { test } from '@playwright/test';

import { createParityHarness } from './visualParityHarness';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pixel-diffs the Tailwind/shadcn Badge against the real (Bootstrap)
 * Badge, variant/tone/pill combination by combination, to verify the new
 * Badge is a true drop-in replacement before it's ever wired into
 * production call sites. Shares its checks with base-button-parity.spec.ts/
 * stat-card-parity.spec.ts via visualParityHarness.ts. Both components
 * render side by side on the same page — src/core/BadgeParity.stories.tsx
 * — so there's no committed baseline image to go stale.
 *
 * Run with: yarn playwright test badge-parity --project visual --workers=1
 *
 * Scoped to the 7 colors + "default" that account for the large majority
 * of real usage, plus blue/indigo/moss/pink for real dark-theme
 * regression coverage (see BadgeParity.stories.tsx's own comment — purple
 * slipped through at 88/88 "passing" with a genuinely wrong dark color,
 * and these four share its exact bug pattern) × 3 tones × pill on/off.
 * size/icons/tooltip/hasBullet are excluded — see that file.
 */

const COLORS = [
  'warning',
  'success',
  'danger',
  'secondary',
  'primary',
  'info',
  'purple',
  'blue',
  'indigo',
  'moss',
  'pink',
] as const;
const TONES = ['solid', 'light', 'outline'] as const;
const PILL_STATES = [false, true] as const;

const { gotoParity, expectPixelParity } = createParityHarness({
  storyId: 'migration-badge-parity--default',
  diffDir: path.join(__dirname, '../test-results/badge-parity-diffs'),
  thresholds: {
    maxDimensionSlackPx: 0.5,
    // Measured against this component (not borrowed from BaseButton/
    // StatCard — see docs/tailwind-shadcn-migration-notes.md). Badge is
    // small enough (54x24px) that both checks need real headroom:
    // - diffRatioThreshold: pixelmatch topped out at ~0.09 across all 88
    //   cases once visualParityHarness.ts's expectPixelParity started
    //   cropping both locators with rounded, shared-size clip rects
    //   (fixing a real harness bug: raw locator.screenshot() clips on each
    //   element's own unrounded page position, so two equal-width elements
    //   at different fractional x offsets came back as differently-sized
    //   PNGs with the true edge misaligned within the frame — every case
    //   failed at 8-18% even with byte-identical computed styles, until
    //   that fix). The residual ~0.09 is real sub-pixel AA noise from the
    //   two badges still sitting at different fractional page positions.
    // - chromaticityTolerance: light/outline tones use a pale, near-white
    //   fill (e.g. warning-light's bg is rgb(255,250,235)), which sits
    //   right at expectDominantColorParity's 30-unit foreground/background
    //   split (that check anchors "background" to the page's white corner
    //   pixel). AA noise flips a handful of boundary pixels in/out of the
    //   foreground average between old/new, topping out at a delta of 19
    //   (danger-solid/primary-solid, both vivid solid fills — the same
    //   noise source shows up outside pale fills too, just smaller)
    //   confirmed as measurement noise, not a real bug, via
    //   getComputedStyle (background-color/color were byte-identical for
    //   every failing case).
    diffRatioThreshold: 0.1,
    pixelmatchThreshold: 0.25,
    foregroundDistanceThreshold: 30,
    chromaticityTolerance: 20,
  },
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Badge parity — ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoParity(page, theme);
    });

    for (const color of COLORS) {
      for (const tone of TONES) {
        for (const pill of PILL_STATES) {
          const pairId = `${color}-${tone}${pill ? '-pill' : ''}`;
          test(pairId, async ({ page }) => {
            await expectPixelParity(
              page.locator(`[data-pair="${pairId}"][data-role="old"]`),
              page.locator(`[data-pair="${pairId}"][data-role="new"]`),
              `${theme}-${pairId}`,
            );
          });
        }
      }
    }

    for (const pill of PILL_STATES) {
      const pairId = `neutral-outline${pill ? '-pill' : ''}`;
      test(pairId, async ({ page }) => {
        await expectPixelParity(
          page.locator(`[data-pair="${pairId}"][data-role="old"]`),
          page.locator(`[data-pair="${pairId}"][data-role="new"]`),
          `${theme}-${pairId}`,
        );
      });
    }
  });
}
