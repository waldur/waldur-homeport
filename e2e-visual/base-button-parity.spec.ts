import * as path from 'path';
import { fileURLToPath } from 'url';

import { test } from '@playwright/test';

import { createParityHarness } from './visualParityHarness';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pixel-diffs the Tailwind/shadcn BaseButtonTw against the real
 * (Bootstrap) BaseButton, variant by variant, to verify BaseButtonTw is a
 * true drop-in replacement before it's ever wired into production call
 * sites. Shares its checks (dimension parity, pixelmatch ratio,
 * dominant-color chromaticity) with stat-card-parity.spec.ts via
 * visualParityHarness.ts — see that file and
 * docs/tailwind-shadcn-migration-notes.md for the full rationale behind the
 * checks below and the calibration evidence for the thresholds. Both
 * components render side by side on the same page — a Storybook story,
 * src/core/buttons/BaseButtonParity.stories.tsx — so there's no committed
 * baseline image to go stale.
 *
 * Run with: yarn playwright test base-button-parity --project visual
 * (use --workers=1 — a full run at --workers=3 exhausted machine RAM)
 *
 * Coverage: 12 variants × 2 sizes × 2 themes × 6 states (`enabled`,
 * `disabled`, `hover`, `active`, `focus` via `.focus()`, `focus` via a real
 * `.click()`) = 288 cases. The hover/active/focus tests below don't use the
 * harness's `expectPixelParity` convenience wrapper — they need custom
 * interaction (hover/focus/mouse-down) between capturing old vs new, so
 * they call `expectBufferParity` directly on manually-captured buffers.
 */

// Recalibrated after the harness moved to Storybook (see the
// CHROMATICITY_TOLERANCE comment below for why the move shifts noise at
// all) — measured ceiling rose slightly, from 11.72% to 13.10%, still
// comfortably under this threshold. See migration notes for the full
// calibration history.
const DIFF_RATIO_THRESHOLD = 0.16;

const VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'tertiary-ghost',
  'danger',
  'warning',
  'success',
  'text-primary',
  'text-secondary',
  'text-danger',
  'text-warning',
  'text-success',
] as const;

const SIZES = ['sm', 'lg'] as const;

const FOREGROUND_DISTANCE_THRESHOLD = 30; // per-channel-sum distance from background to count as "content"

// Recalibrated after the harness moved from a raw route to a
// Storybook story (different DOM wrapper chain around the buttons shifts
// sub-pixel rendering slightly, even though the components/tokens are
// unchanged) — the old ceiling (5, from the raw-route harness) started
// flaking here. Measured the new ceiling across three separate full
// 192-case runs, including one against a genuinely cold Storybook server
// (the scenario CI always hits) — all three converged on an identical max
// of 4.61, not just similar. (One single-test diagnostic script run
// earlier showed 5.567 for the same case; re-run through the real spec
// three times and it never reproduced — an artifact of that ad hoc script,
// not the suite.) Tolerance set to 10: >2x margin over a
// three-times-reproduced stable ceiling, while staying clearly below the
// confirmed real-bug signal (~17, see migration notes) so the check stays
// useful, not just quiet.
const CHROMATICITY_TOLERANCE = 10; // out of 255, scaled chromaticity units

// Empirically measured across all 12 variants × 2 sizes × 2 themes
// (enabled), via locator.boundingBox() — exact CSS pixels, not the
// screenshot PNG's rounded integer dimensions: the real noise ceiling is
// 0.0625px. See migration notes for the full investigation (including a
// deliberately reintroduced ~1.94px width bug, to confirm PNG-dimension
// comparison would have missed it). 0.5 gives ~8x headroom over the
// measured 0.0625px noise ceiling while staying far below any real
// regression.
const MAX_DIMENSION_SLACK_PX = 0.5;

const { gotoParity, expectBufferParity, expectPixelParity, requireBox } =
  createParityHarness({
    storyId: 'migration-basebutton-parity--default',
    diffDir: path.join(__dirname, '../test-results/base-button-parity-diffs'),
    thresholds: {
      maxDimensionSlackPx: MAX_DIMENSION_SLACK_PX,
      diffRatioThreshold: DIFF_RATIO_THRESHOLD,
      // 0.25 tolerates blended antialiasing edge colors on text-heavy/pastel
      // variants — see migration notes for the calibration and its blind
      // spot (why the dominant-color check below also exists).
      pixelmatchThreshold: 0.25,
      foregroundDistanceThreshold: FOREGROUND_DISTANCE_THRESHOLD,
      chromaticityTolerance: CHROMATICITY_TOLERANCE,
    },
  });

for (const theme of ['light', 'dark'] as const) {
  test.describe(`BaseButtonTw parity — ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoParity(page, theme);
    });

    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const pairId = `${variant}-${size}`;

        test(`${pairId} — enabled`, async ({ page }) => {
          await expectPixelParity(
            page.locator(`[data-pair="${pairId}"][data-role="old"]`),
            page.locator(`[data-pair="${pairId}"][data-role="new"]`),
            `${theme}-${pairId}-enabled`,
          );
        });

        test(`${pairId} — disabled`, async ({ page }) => {
          await expectPixelParity(
            page.locator(`[data-pair="${pairId}-disabled"][data-role="old"]`),
            page.locator(`[data-pair="${pairId}-disabled"][data-role="new"]`),
            `${theme}-${pairId}-disabled`,
          );
        });

        test(`${pairId} — hover`, async ({ page }) => {
          // Can't hover both siblings with one pointer at once — capture
          // each independently, then diff afterward. The wait is
          // load-bearing: a synchronous getComputedStyle() right after
          // hover()/focus() reads the pre-transition value, not the
          // settled one (screenshot() forces a real paint). See migration
          // notes.
          const oldBtn = page.locator(
            `[data-pair="${pairId}"][data-role="old"]`,
          );
          const newBtn = page.locator(
            `[data-pair="${pairId}"][data-role="new"]`,
          );
          await oldBtn.hover();
          await page.waitForTimeout(350);
          const oldBuf = await oldBtn.screenshot();
          const oldBox = await requireBox(oldBtn, `${theme}-${pairId}-hover`);
          await page.mouse.move(0, 0);
          await newBtn.hover();
          await page.waitForTimeout(350);
          const newBuf = await newBtn.screenshot();
          const newBox = await requireBox(newBtn, `${theme}-${pairId}-hover`);
          expectBufferParity(
            oldBuf,
            newBuf,
            oldBox,
            newBox,
            `${theme}-${pairId}-hover`,
          );
        });

        test(`${pairId} — active`, async ({ page }) => {
          // page.mouse.down() + an async getComputedStyle() can silently
          // fail to reflect real :active state — especially testing
          // several elements in one page load, where prior mouse moves
          // leave stale layout/coordinate assumptions. Each Playwright
          // test already gets its own fresh page, but the explicit
          // matches(':active') check below still guards against a
          // mouse.down() that missed (e.g. a scroll-position mismatch),
          // since a false pass here would silently reintroduce the
          // pressed-state bug this test exists to catch. See migration
          // notes.
          const oldBtn = page.locator(
            `[data-pair="${pairId}"][data-role="old"]`,
          );
          const newBtn = page.locator(
            `[data-pair="${pairId}"][data-role="new"]`,
          );

          await oldBtn.scrollIntoViewIfNeeded();
          const oldRawBox = await requireBox(
            oldBtn,
            `${theme}-${pairId}-active`,
          );
          await page.mouse.move(
            oldRawBox.x + oldRawBox.width / 2,
            oldRawBox.y + oldRawBox.height / 2,
          );
          await page.mouse.down();
          await page.waitForTimeout(350);
          if (!(await oldBtn.evaluate((el) => el.matches(':active')))) {
            throw new Error(
              `${theme}-${pairId}-active: old button never entered :active state — mouse.down() missed?`,
            );
          }
          const oldBuf = await oldBtn.screenshot();
          const oldBox = await requireBox(oldBtn, `${theme}-${pairId}-active`);
          await page.mouse.up();

          await newBtn.scrollIntoViewIfNeeded();
          const newRawBox = await requireBox(
            newBtn,
            `${theme}-${pairId}-active`,
          );
          await page.mouse.move(
            newRawBox.x + newRawBox.width / 2,
            newRawBox.y + newRawBox.height / 2,
          );
          await page.mouse.down();
          await page.waitForTimeout(350);
          if (!(await newBtn.evaluate((el) => el.matches(':active')))) {
            throw new Error(
              `${theme}-${pairId}-active: new button never entered :active state — mouse.down() missed?`,
            );
          }
          const newBuf = await newBtn.screenshot();
          const newBox = await requireBox(newBtn, `${theme}-${pairId}-active`);
          await page.mouse.up();

          expectBufferParity(
            oldBuf,
            newBuf,
            oldBox,
            newBox,
            `${theme}-${pairId}-active`,
          );
        });

        test(`${pairId} — focus (keyboard/programmatic)`, async ({ page }) => {
          // See the hover test above for why the wait is load-bearing.
          // Named "keyboard/programmatic" (not "focus-visible") because
          // that's genuinely what .focus() exercises here — a JS-level
          // focus() call, which Chromium's :focus-visible heuristic
          // treats the same as keyboard navigation. BaseButtonTw ties its
          // ring to plain :focus (not :focus-visible — see BaseButton.tsx
          // for why), so this test alone can't distinguish the two; the
          // — focus (mouse click) test below exercises the path that
          // actually differs between them. See migration notes.
          const oldBtn = page.locator(
            `[data-pair="${pairId}"][data-role="old"]`,
          );
          const newBtn = page.locator(
            `[data-pair="${pairId}"][data-role="new"]`,
          );
          await oldBtn.focus();
          await page.waitForTimeout(350);
          const oldBuf = await oldBtn.screenshot();
          const oldBox = await requireBox(oldBtn, `${theme}-${pairId}-focus`);
          await newBtn.focus();
          await page.waitForTimeout(350);
          const newBuf = await newBtn.screenshot();
          const newBox = await requireBox(newBtn, `${theme}-${pairId}-focus`);
          expectBufferParity(
            oldBuf,
            newBuf,
            oldBox,
            newBox,
            `${theme}-${pairId}-focus`,
          );
        });

        test(`${pairId} — focus (mouse click)`, async ({ page }) => {
          // A real .click() — not .focus() — is the only way to trigger
          // Chromium's :focus-visible-suppression heuristic for
          // pointer-originated focus. This is what caught the bug the
          // test above couldn't: BaseButtonTw originally used
          // focus-visible:, which (correctly, per spec) never applies
          // after a mouse click, silently leaving only whatever :hover
          // had already set — a real, user-reported divergence from the
          // old button, which ties its ring to plain :focus regardless
          // of input method. See migration notes.
          const oldBtn = page.locator(
            `[data-pair="${pairId}"][data-role="old"]`,
          );
          const newBtn = page.locator(
            `[data-pair="${pairId}"][data-role="new"]`,
          );
          await oldBtn.scrollIntoViewIfNeeded();
          await oldBtn.click();
          await page.waitForTimeout(350);
          const oldBuf = await oldBtn.screenshot();
          const oldBox = await requireBox(
            oldBtn,
            `${theme}-${pairId}-focus-click`,
          );
          await newBtn.scrollIntoViewIfNeeded();
          await newBtn.click();
          await page.waitForTimeout(350);
          const newBuf = await newBtn.screenshot();
          const newBox = await requireBox(
            newBtn,
            `${theme}-${pairId}-focus-click`,
          );
          expectBufferParity(
            oldBuf,
            newBuf,
            oldBox,
            newBox,
            `${theme}-${pairId}-focus-click`,
          );
        });
      }
    }
  });
}
