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

const MAX_DIMENSION_SLACK = 4; // px allowance for font padding & subpixel text layout rounding

/** Copies src into a width×height canvas, top-left aligned, extra area fully opaque black. */
function padTo(png: PNG, width: number, height: number): PNG {
  const out = new PNG({ width, height });
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

/** Diffs two already-captured screenshot buffers and asserts pixel parity. */
function expectBufferParity(oldBuf: Buffer, newBuf: Buffer, name: string) {
  let oldPng = readPng(oldBuf);
  let newPng = readPng(newBuf);

  const widthDelta = Math.abs(oldPng.width - newPng.width);
  const heightDelta = Math.abs(oldPng.height - newPng.height);

  if (widthDelta > MAX_DIMENSION_SLACK || heightDelta > MAX_DIMENSION_SLACK) {
    throw new Error(
      `${name}: dimension mismatch — old ${oldPng.width}x${oldPng.height} vs new ${newPng.width}x${newPng.height} ` +
        `(beyond the ${MAX_DIMENSION_SLACK}px subpixel-rounding allowance). Not a color/rendering difference — ` +
        `the components are sized differently.`,
    );
  }

  // Within slack: pad the smaller buffer instead of throwing, and let the
  // padded region count as fully differing pixels in the ratio below — a
  // real few-px size bug still fails on ratio, a subpixel rounding
  // difference doesn't.
  if (widthDelta > 0 || heightDelta > 0) {
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

// Recalibrated after the harness moved from a raw ?tw-parity route to a
// Storybook story (different DOM wrapper chain around the buttons shifts
// sub-pixel rendering slightly, even though the components/tokens are
// unchanged) — the old ceiling (5, from the ?tw-parity harness) started
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
  const oldBackground = pixelAt(oldPng, 0, 0);
  const oldColor = foregroundAverage(oldPng, oldBackground);
  const newColor = foregroundAverage(newPng, pixelAt(newPng, 0, 0));
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

/** Screenshots both locators (assumed to already be in matching states) and diffs them. */
async function expectPixelParity(
  oldLocator: Locator,
  newLocator: Locator,
  name: string,
) {
  const [oldBuf, newBuf] = await Promise.all([
    oldLocator.screenshot(),
    newLocator.screenshot(),
  ]);
  expectBufferParity(oldBuf, newBuf, name);
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
          await page.mouse.move(0, 0);
          await newBtn.hover();
          await page.waitForTimeout(350);
          const newBuf = await newBtn.screenshot();
          expectBufferParity(oldBuf, newBuf, `${theme}-${pairId}-hover`);
        });

        test(`${pairId} — focus-visible`, async ({ page }) => {
          // See the hover test above for why the wait is load-bearing.
          const oldBtn = page.locator(
            `[data-pair="${pairId}"][data-role="old"]`,
          );
          const newBtn = page.locator(
            `[data-pair="${pairId}"][data-role="new"]`,
          );
          await oldBtn.focus();
          await page.waitForTimeout(350);
          const oldBuf = await oldBtn.screenshot();
          await newBtn.focus();
          await page.waitForTimeout(350);
          const newBuf = await newBtn.screenshot();
          expectBufferParity(oldBuf, newBuf, `${theme}-${pairId}-focus`);
        });
      }
    }
  });
}
