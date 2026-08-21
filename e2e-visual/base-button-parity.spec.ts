import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { test, expect, Page, Locator } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pixel-diffs the Tailwind/shadcn BaseButtonTw against the real
 * (Bootstrap) BaseButton, variant by variant, to verify BaseButtonTw is a
 * true drop-in replacement before it's ever wired into production call
 * sites. Both components render side by side on the same page — a
 * Storybook story, src/core/buttons/BaseButtonParity.stories.tsx — so
 * there's no committed baseline image to go stale — this is a direct A/B
 * comparison of two live renders in the same browser, same run.
 *
 * Run with: yarn playwright test base-button-parity --project visual
 * (use --workers=1 — a full run at --workers=3 exhausted machine RAM)
 *
 * Two complementary checks below (pixelmatch ratio + dominant-color
 * chromaticity), why both are needed, and the full calibration evidence
 * behind every threshold: docs/tailwind-shadcn-migration-notes.md.
 */

// Recalibrated after the harness moved to Storybook (see the
// CHROMATICITY_TOLERANCE comment below for why the move shifts noise at
// all) — measured ceiling rose slightly, from 11.72% to 13.10%, still
// comfortably under this threshold. See migration notes for the full
// calibration history.
const DIFF_RATIO_THRESHOLD = 0.16;
const DIFF_DIR = path.join(
  __dirname,
  '../test-results/base-button-parity-diffs',
);

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

const STORYBOOK_URL = 'http://localhost:6006';

async function gotoParity(page: Page, theme: 'light' | 'dark') {
  // Renders old (Bootstrap) BaseButton and BaseButtonTw side by side — see
  // src/core/buttons/BaseButtonParity.stories.tsx. Absolute URL: Storybook
  // runs on its own dev server (6006), separate from the main app (8001,
  // playwright.config.ts's baseURL) — both are started via webServer.
  // globals=theme:X is read by .storybook/preview.tsx's theme decorator,
  // which calls the same loadTheme() the real app uses.
  await page.goto(
    `${STORYBOOK_URL}/iframe.html?id=migration-basebutton-parity--default&viewMode=story&globals=theme:${theme}`,
  );

  // The old BaseButton needs the compiled Metronic stylesheet, swapped in
  // async by loadTheme() — wait for it or it screenshots as unstyled
  // UA-default buttons.
  await page.waitForFunction(
    (expectedTheme) => {
      const link = document.querySelector(
        'link[rel="stylesheet"]',
      ) as HTMLLinkElement | null;
      if (!link || !link.href) return false;
      const isDark = link.href.includes('dark');
      if (expectedTheme === 'dark' ? !isDark : isDark) return false;
      try {
        return (link.sheet?.cssRules.length ?? 0) > 0;
      } catch {
        return false;
      }
    },
    theme,
    // 15s wasn't enough margin: a cold Storybook server (first request of
    // the run, triggering on-demand story-chunk compilation) measured
    // 17.5s here after a fresh `yarn install` invalidated Vite's dep-cache.
    { timeout: 30000 },
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

  await page.addStyleTag({
    content:
      '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });

  await page.waitForTimeout(100);
}

function readPng(buffer: Buffer): PNG {
  return PNG.sync.read(buffer);
}

// Empirically measured across all 12 variants × 2 sizes × 2 themes
// (enabled), via locator.boundingBox() — exact CSS pixels, not the
// screenshot PNG's rounded integer dimensions: the real noise ceiling is
// 0.0625px. PNG dimensions were tried first and rejected — Playwright's
// screenshot clip region rounds based on the element's exact fractional
// *position* on the page, not just its own width, so a genuinely tiny
// ~0.06px difference and a real ~2px regression could both round to the
// same 1px integer PNG delta depending on where the element happened to
// sit. Confirmed by deliberately reintroducing a real ~1.94px width bug
// and finding it produced the exact same 1px *PNG* delta as the correct
// code's own noise (73 vs 74, same magnitude as 75 vs 74) — the PNG-based
// version of this check would have silently passed it. See migration
// notes for the full investigation. 0.5 gives ~8x headroom over the
// measured 0.0625px noise ceiling while staying far below any real
// regression (the bug this replaced measured ~1.94px).
const MAX_DIMENSION_SLACK_PX = 0.5;

/** Copies src into a width×height canvas, top-left aligned, extra area fully opaque black. */
function padTo(png: PNG, width: number, height: number): PNG {
  const out = new PNG({ width, height });
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

interface Box {
  width: number;
  height: number;
}

/**
 * Diffs two already-captured screenshot buffers and asserts pixel parity.
 * oldBox/newBox are each locator's exact-pixel boundingBox() at capture
 * time — the actual size-parity decision happens on those, not on the
 * PNG's rounded dimensions (see MAX_DIMENSION_SLACK_PX above for why).
 */
function expectBufferParity(
  oldBuf: Buffer,
  newBuf: Buffer,
  oldBox: Box,
  newBox: Box,
  name: string,
) {
  const widthDeltaPx = Math.abs(oldBox.width - newBox.width);
  const heightDeltaPx = Math.abs(oldBox.height - newBox.height);

  if (
    widthDeltaPx > MAX_DIMENSION_SLACK_PX ||
    heightDeltaPx > MAX_DIMENSION_SLACK_PX
  ) {
    throw new Error(
      `${name}: dimension mismatch — old ${oldBox.width}x${oldBox.height} vs new ${newBox.width}x${newBox.height} ` +
        `(beyond the ${MAX_DIMENSION_SLACK_PX}px exact-pixel allowance). Not a color/rendering difference — ` +
        `the components are sized differently.`,
    );
  }

  let oldPng = readPng(oldBuf);
  let newPng = readPng(newBuf);

  // The precise CSS-pixel check above is the real size-parity decision.
  // This is purely mechanical: pixelmatch requires equal-sized buffers,
  // and the PNG's rounded dimensions can still differ by a pixel even
  // when the exact box sizes above are within tolerance (screenshot clip
  // rounding) — pad the smaller one so pixelmatch has something to
  // compare; the padded region counts as fully differing pixels in the
  // ratio below.
  if (oldPng.width !== newPng.width || oldPng.height !== newPng.height) {
    const width = Math.max(oldPng.width, newPng.width);
    const height = Math.max(oldPng.height, newPng.height);
    oldPng = padTo(oldPng, width, height);
    newPng = padTo(newPng, width, height);
  }

  const { width, height } = oldPng;
  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(
    oldPng.data,
    newPng.data,
    diff.data,
    width,
    height,
    // 0.25 tolerates blended antialiasing edge colors on text-heavy/pastel
    // variants — see migration notes for the calibration and its blind
    // spot (why the dominant-color check below also exists).
    { threshold: 0.25 },
  );
  const ratio = numDiffPixels / (width * height);

  if (ratio > DIFF_RATIO_THRESHOLD) {
    fs.mkdirSync(DIFF_DIR, { recursive: true });
    fs.writeFileSync(path.join(DIFF_DIR, `${name}-old.png`), oldBuf);
    fs.writeFileSync(path.join(DIFF_DIR, `${name}-new.png`), newBuf);
    fs.writeFileSync(
      path.join(DIFF_DIR, `${name}-diff.png`),
      PNG.sync.write(diff),
    );
  }

  expect(
    ratio,
    `${name}: ${numDiffPixels}/${width * height} px differ (${(ratio * 100).toFixed(2)}%). ` +
      (ratio > DIFF_RATIO_THRESHOLD
        ? `Diff images saved to ${DIFF_DIR}/${name}-{old,new,diff}.png`
        : ''),
  ).toBeLessThanOrEqual(DIFF_RATIO_THRESHOLD);

  expectDominantColorParity(oldPng, newPng, name);
}

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

/**
 * Average RGB over "foreground" pixels (glyph/border/fill, isolated by
 * distance from the button's own background color) — catches hue bugs the
 * pixelmatch ratio above misses on small/text-heavy elements, where a
 * completely wrong color only touches a small fraction of the image. See
 * migration notes for why this exists and how it's built.
 */
function expectDominantColorParity(oldPng: PNG, newPng: PNG, name: string) {
  const pixelAt = (png: PNG, x: number, y: number) => {
    const i = (png.width * y + x) << 2;
    return [png.data[i], png.data[i + 1], png.data[i + 2]];
  };

  const foregroundAverage = (png: PNG, background: number[]) => {
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      const distance =
        Math.abs(png.data[i] - background[0]) +
        Math.abs(png.data[i + 1] - background[1]) +
        Math.abs(png.data[i + 2] - background[2]);
      if (distance > FOREGROUND_DISTANCE_THRESHOLD) {
        r += png.data[i];
        g += png.data[i + 1];
        b += png.data[i + 2];
        count++;
      }
    }
    if (count === 0) return null; // nothing but background — e.g. a disabled ghost button with invisible text
    return [r / count, g / count, b / count];
  };

  // Corner pixel: outside any border-radius arc, so it's always the page's
  // own background, never the button's fill — works for solid-fill and
  // transparent-background variants alike.
  // One shared reference, not a per-image probe: a corner pixel can be pure
  // page background in one render and an antialiased page/fill blend in the
  // other, which flips whether the button's text clears the threshold — so the
  // two averages end up measuring different things (fill vs fill+text).
  const background = pixelAt(oldPng, 0, 0);
  const oldColor = foregroundAverage(oldPng, background);
  const newColor = foregroundAverage(newPng, background);
  if (!oldColor || !newColor) return;

  // Chromaticity (each channel's share of total brightness) cancels out
  // uniform lighter/darker antialiasing shifts while staying sensitive to
  // an actual hue change. See migration notes for the calibration.
  const chromaticity = (c: number[]) => {
    const sum = c[0] + c[1] + c[2];
    return sum === 0 ? [0, 0, 0] : c.map((v) => (v / sum) * 255);
  };
  const oldChroma = chromaticity(oldColor);
  const newChroma = chromaticity(newColor);
  const maxChromaticityDelta = Math.max(
    ...oldChroma.map((c, i) => Math.abs(c - newChroma[i])),
  );
  const fmt = (c: number[]) => c.map((v) => Math.round(v)).join(',');

  expect(
    maxChromaticityDelta,
    `${name}: average foreground-pixel color differs — old rgb(${fmt(oldColor)}) vs new rgb(${fmt(newColor)}), ` +
      `chromaticity delta ${Math.round(maxChromaticityDelta)} (tolerance ${CHROMATICITY_TOLERANCE}). ` +
      `This is a color/token bug (a hue change), not rendering noise — the pixelmatch ratio above doesn't ` +
      `reliably catch this class of mismatch on small/text-heavy elements.`,
  ).toBeLessThanOrEqual(CHROMATICITY_TOLERANCE);
}

/** Locator.boundingBox() is typed nullable (detached/hidden element) — these are always-visible test fixtures, so null means something is genuinely wrong. */
async function requireBox(locator: Locator, name: string): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(
      `${name}: boundingBox() returned null — element not visible/attached?`,
    );
  }
  return box;
}

/** Screenshots both locators (assumed to already be in matching states) and diffs them. */
async function expectPixelParity(
  oldLocator: Locator,
  newLocator: Locator,
  name: string,
) {
  const [oldBuf, newBuf, oldBox, newBox] = await Promise.all([
    oldLocator.screenshot(),
    newLocator.screenshot(),
    requireBox(oldLocator, name),
    requireBox(newLocator, name),
  ]);
  expectBufferParity(oldBuf, newBuf, oldBox, newBox, name);
}

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
