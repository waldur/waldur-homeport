import * as fs from 'fs';
import * as path from 'path';

import { expect, Page, Locator } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/**
 * Shared machinery behind every old-(Bootstrap)-vs-new-(Tailwind/shadcn)
 * component parity spec (base-button-parity.spec.ts, stat-card-parity.spec.ts,
 * ...). Both components render side by side on the same Storybook page — a
 * `Migration/* Parity` story tagged data-pair/data-role — so there's never a
 * committed baseline image to go stale; this is a direct A/B comparison of
 * two live renders in the same browser, same run. See
 * docs/tailwind-shadcn-migration-notes.md for the full rationale behind the
 * three checks below and the calibration evidence for base-button-parity's
 * own thresholds — each spec's thresholds are its own, measured against its
 * own component, and passed in via `ParityThresholds` rather than shared.
 *
 * Three checks, in the order they run:
 * 1. Dimension parity (`boundingBox()`, exact CSS pixels captured at
 *    screenshot time — not the screenshot PNG's rounded integer dimensions,
 *    which round based on the element's exact fractional *position* on the
 *    page, not just its own width, letting real regressions and noise round
 *    to the same PNG delta depending on where the element sits).
 * 2. Pixelmatch ratio — the primary pixel-diff check.
 * 3. Dominant-color chromaticity — catches a real color/token bug that's a
 *    small fraction of a small/text-heavy element's area, where a completely
 *    wrong hue still reads as a low pixelmatch ratio. Averages RGB over
 *    "foreground" pixels (anything beyond `foregroundDistanceThreshold` from
 *    the element's own corner-background color) and compares chromaticity
 *    (each channel's share of total brightness), which cancels out uniform
 *    lighter/darker antialiasing shifts while staying sensitive to an actual
 *    hue change.
 */

interface Box {
  width: number;
  height: number;
}

interface ParityThresholds {
  /** Real CSS-pixel slack for boundingBox() width/height parity. */
  maxDimensionSlackPx: number;
  /** Max fraction of differing pixels (pixelmatch, 0-1) before failing. */
  diffRatioThreshold: number;
  /** Per-pixel pixelmatch color-distance tolerance (0-1). */
  pixelmatchThreshold: number;
  /** Per-channel-sum distance from background to count as "foreground". */
  foregroundDistanceThreshold: number;
  /** Max allowed chromaticity delta (0-255 scale) between old and new. */
  chromaticityTolerance: number;
}

export interface ParityHarnessOptions {
  /** Storybook story id, e.g. 'migration-statcard-parity--default'. */
  storyId: string;
  /** Absolute path to write {name}-{old,new,diff}.png on a failing diff. */
  diffDir: string;
  thresholds: ParityThresholds;
}

const STORYBOOK_URL = 'http://localhost:6006';

function readPng(buffer: Buffer): PNG {
  return PNG.sync.read(buffer);
}

/** Copies src into a width×height canvas, top-left aligned, extra area fully opaque black. */
function padTo(png: PNG, width: number, height: number): PNG {
  const out = new PNG({ width, height });
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

function expectDominantColorParity(
  oldPng: PNG,
  newPng: PNG,
  name: string,
  thresholds: ParityThresholds,
) {
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
      if (distance > thresholds.foregroundDistanceThreshold) {
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
  // own background, never the element's fill. One shared reference, not a
  // per-image probe: a corner pixel can be pure page background in one
  // render and an antialiased page/fill blend in the other, which flips
  // whether foreground content clears the threshold in just one image.
  const background = pixelAt(oldPng, 0, 0);
  const oldColor = foregroundAverage(oldPng, background);
  const newColor = foregroundAverage(newPng, background);
  if (!oldColor || !newColor) return;

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
      `chromaticity delta ${Math.round(maxChromaticityDelta)} (tolerance ${thresholds.chromaticityTolerance}). ` +
      `This is a color/token bug (a hue change), not rendering noise — the pixelmatch ratio above doesn't ` +
      `reliably catch this class of mismatch on small/text-heavy elements.`,
  ).toBeLessThanOrEqual(thresholds.chromaticityTolerance);
}

export interface ParityHarness {
  /**
   * Navigates to the parity story (old and new component rendered side by
   * side) in the given theme, waits for the old component's compiled
   * Metronic stylesheet to actually be swapped in (loadTheme() is async —
   * screenshotting too early captures unstyled UA-default markup), and
   * disables page-wide transitions/animations so screenshots aren't caught
   * mid-transition.
   */
  gotoParity: (page: Page, theme: 'light' | 'dark') => Promise<void>;
  /** Diffs two already-captured screenshot buffers and asserts pixel parity — for specs that need custom interaction (hover/focus/active) between capturing old vs new. */
  expectBufferParity: (
    oldBuf: Buffer,
    newBuf: Buffer,
    oldBox: Box,
    newBox: Box,
    name: string,
  ) => void;
  /** Screenshots both locators (assumed already in matching states) and diffs them. */
  expectPixelParity: (
    oldLocator: Locator,
    newLocator: Locator,
    name: string,
  ) => Promise<void>;
  /** Locator.boundingBox() is typed nullable (detached/hidden element) — parity fixtures are always-visible, so null means something is genuinely wrong. */
  requireBox: (locator: Locator, name: string) => Promise<Box>;
}

export function createParityHarness(
  options: ParityHarnessOptions,
): ParityHarness {
  const { storyId, diffDir, thresholds } = options;

  async function gotoParity(page: Page, theme: 'light' | 'dark') {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story&globals=theme:${theme}`,
    );

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
      widthDeltaPx > thresholds.maxDimensionSlackPx ||
      heightDeltaPx > thresholds.maxDimensionSlackPx
    ) {
      throw new Error(
        `${name}: dimension mismatch — old ${oldBox.width}x${oldBox.height} vs new ${newBox.width}x${newBox.height} ` +
          `(beyond the ${thresholds.maxDimensionSlackPx}px exact-pixel allowance). Not a color/rendering ` +
          `difference — the components are sized differently.`,
      );
    }

    let oldPng = readPng(oldBuf);
    let newPng = readPng(newBuf);

    // The precise CSS-pixel check above is the real size-parity decision.
    // This is purely mechanical: pixelmatch requires equal-sized buffers,
    // and the PNG's rounded dimensions can still differ by a pixel even
    // when the exact box sizes above are within tolerance (screenshot clip
    // rounding) — pad the smaller one so pixelmatch has something to
    // compare; the padded region counts as fully differing pixels below.
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
      { threshold: thresholds.pixelmatchThreshold },
    );
    const ratio = numDiffPixels / (width * height);

    if (ratio > thresholds.diffRatioThreshold) {
      fs.mkdirSync(diffDir, { recursive: true });
      fs.writeFileSync(path.join(diffDir, `${name}-old.png`), oldBuf);
      fs.writeFileSync(path.join(diffDir, `${name}-new.png`), newBuf);
      fs.writeFileSync(
        path.join(diffDir, `${name}-diff.png`),
        PNG.sync.write(diff),
      );
    }

    expect(
      ratio,
      `${name}: ${numDiffPixels}/${width * height} px differ (${(ratio * 100).toFixed(2)}%). ` +
        (ratio > thresholds.diffRatioThreshold
          ? `Diff images saved to ${diffDir}/${name}-{old,new,diff}.png`
          : ''),
    ).toBeLessThanOrEqual(thresholds.diffRatioThreshold);

    expectDominantColorParity(oldPng, newPng, name, thresholds);
  }

  async function requireBox(locator: Locator, name: string): Promise<Box> {
    const box = await locator.boundingBox();
    if (!box) {
      throw new Error(
        `${name}: boundingBox() returned null — element not visible/attached?`,
      );
    }
    return box;
  }

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

  return { gotoParity, expectBufferParity, expectPixelParity, requireBox };
}
