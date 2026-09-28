import { test, expect, Page } from '@playwright/test';

import { contrastRatio, parseColor } from 'waldur-design-tokens/contrast';

import { buttonVariants } from '../packages/ui/src/BaseButton';

/**
 * Asserts that keyboard focus produces a *visible* indicator, with enough
 * contrast to satisfy WCAG 1.4.11.
 *
 * A visual comparison passes just as happily when a control renders no ring at
 * all, so it cannot catch a control losing its indicator outright (WCAG 2.4.7),
 * which is what had happened across the login page.
 *
 * Each fixture below is a place where a `box-shadow`-based ring was previously
 * suppressed — elevation utilities, unlayered page CSS, `.menu-link` — so
 * re-adding any such suppression fails CI instead of silently costing
 * keyboard users their focus indicator. The buttons are rendered with the
 * same `buttonVariants()` classes BaseButton uses.
 *
 * `.btn-no-focus` is deliberately not a fixture: its
 * `:not(:focus-visible) { outline: none !important }` rule is rewritten by
 * Storybook's pseudo-states addon into `:not(.pseudo-focus-visible)`, which
 * always matches, so the case fails here while the real app keeps its ring.
 */

const STORYBOOK_URL = 'http://localhost:6006';

/** Any story will do — we only need Storybook's compiled stylesheets (Metronic,
 *  Tailwind) and its seeded --waldur-brand-* tokens, then we supply our own markup. */
const STORY =
  '/iframe.html?id=actions-basebutton--playground&viewMode=story&globals=theme:';

/** Mimics an unlayered page stylesheet putting a `box-shadow` on every button
 *  inside a container — a plain (non-`@layer`) rule beats every layered ring. */
const UNLAYERED_OVERRIDE = `.layout-neumorphism-card button {
  box-shadow: 5px 5px 10px #bec3c9, -5px -5px 10px #ffffff;
}`;

const button = (variant: Parameters<typeof buttonVariants>[0]['variant']) =>
  buttonVariants({ variant, size: 'md' });

const FIXTURES = `
<div id="focus-fixtures" style="padding:40px;display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <button class="${button('tertiary')}" data-ring="tertiary">Tertiary</button>
  <button class="${button('primary')}" data-ring="primary">Primary</button>
  <button class="${button('text-primary')}" data-ring="text-primary">Text button</button>
  <button class="${button('tertiary')} shadow-sm" data-ring="shadow-sm">Elevated</button>
  <div class="layout-neumorphism-card">
    <button class="${button('tertiary')}" data-ring="unlayered-override">Neumorphic</button>
  </div>
  <ul class="menu"><li class="menu-item">
    <a href="#" class="menu-link" data-ring="menu-link">Menu link</a>
  </li></ul>
  <ul class="nav nav-tabs nav-line-tabs">
    <li class="nav-item">
      <a href="#" class="nav-link" data-ring="nav-line-tab">View</a>
    </li>
  </ul>
</div>`;

const CASES = [
  'tertiary',
  'primary',
  'text-primary',
  'shadow-sm',
  'unlayered-override',
  'menu-link',
  'nav-line-tab',
] as const;

/** Controls whose ring is drawn straight onto a solid brand fill, where the
 *  brand-on-brand contrast is inherently too low. See the comment at the
 *  test.fail() call for why these are recorded rather than fixed here. */
const KNOWN_CONTRAST_GAPS = new Set<string>(['primary']);

/** WCAG 1.4.11 Non-text Contrast: an indicator needs 3:1 against what it sits against. */
const MIN_CONTRAST = 3;

async function setUpFixtures(page: Page, theme: 'light' | 'dark') {
  await page.goto(`${STORYBOOK_URL}${STORY}${theme}`, {
    waitUntil: 'networkidle',
  });
  // The theme decorator swaps the compiled Metronic stylesheet asynchronously.
  await page.waitForTimeout(1500);
  await page.evaluate(
    ({ fixtures, override }) => {
      const style = document.createElement('style');
      style.textContent = override;
      document.head.append(style);
      document.body.innerHTML = fixtures;
    },
    { fixtures: FIXTURES, override: UNLAYERED_OVERRIDE },
  );
}

/** Tabs until the wanted element has focus and measures in the same step, so
 *  `:focus-visible` matches the way it does for a real keyboard user. A bare
 *  .focus() call would not exercise `:focus-visible` the way a keyboard user
 *  does, and measuring in a later round-trip let focus drift. */
async function focusByKeyboardAndMeasure(page: Page, ring: string) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.setAttribute('tabindex', '-1');
    document.body.focus();
  });
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const measured = await page.evaluate((target) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return null;
      const styled = active;
      if (styled.dataset?.ring !== target) return null;
      const ringHost =
        target === 'nav-line-tab' ? styled.closest('.nav-item') : styled;
      const ringSource =
        target === 'nav-line-tab' && ringHost
          ? getComputedStyle(ringHost, '::before')
          : getComputedStyle(styled);
      return {
        outlineWidth: parseFloat(ringSource.outlineWidth),
        outlineStyle: ringSource.outlineStyle,
        outlineColor: ringSource.outlineColor,
        outlineOffset: parseFloat(ringSource.outlineOffset),
        boxShadow: ringSource.boxShadow,
        background: ringSource.backgroundColor,
        pageBackground: getComputedStyle(document.body).backgroundColor,
      };
    }, ring);
    if (measured) return measured;
  }
  return null;
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`focus ring — ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await setUpFixtures(page, theme);
    });

    for (const ring of CASES) {
      test(`${ring} — has a visible focus indicator`, async ({ page }) => {
        // Pre-existing token gap, not a regression here: a brand ring on a
        // brand-filled button is ~1.6:1 against its own fill. Fixing it is a
        // design decision (see the KNOWN_CONTRAST_GAPS comment).
        if (KNOWN_CONTRAST_GAPS.has(ring)) test.fail();

        const measured = await focusByKeyboardAndMeasure(page, ring);
        expect(
          measured,
          `${ring}: never received keyboard focus within 20 tab stops`,
        ).not.toBeNull();

        const hasOutline =
          measured!.outlineStyle !== 'none' && measured!.outlineWidth > 0;
        const hasShadow =
          measured!.boxShadow !== 'none' &&
          !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(measured!.boxShadow) &&
          (measured!.boxShadow.match(/-?[\d.]+px/g) ?? []).some(
            (n) => parseFloat(n) !== 0,
          );

        expect(
          hasOutline || hasShadow,
          `${ring}: no focus indicator at all — outline ${measured!.outlineWidth}px/${measured!.outlineStyle}, box-shadow ${measured!.boxShadow} (WCAG 2.4.7)`,
        ).toBe(true);

        // Contrast of a multi-layer box-shadow ring isn't meaningfully one value.
        if (!hasOutline) return;

        const ringColor = parseColor(measured!.outlineColor);
        expect(ringColor, `${ring}: unreadable outline color`).not.toBeNull();

        // With a positive offset the ring is separated from the control by a
        // gap showing whatever is behind it, so the page background — not the
        // control's own fill — is what it must contrast against. Drawn flush,
        // it sits directly on the control.
        const ownBackground = parseColor(measured!.background);
        const isTransparent = /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(
          measured!.background,
        );
        const behind =
          measured!.outlineOffset > 0 || isTransparent || !ownBackground
            ? parseColor(measured!.pageBackground)
            : ownBackground;

        if (!behind) return;
        const ratio = contrastRatio(ringColor!, behind);
        expect(
          ratio,
          `${ring}: focus ring contrast ${ratio.toFixed(2)}:1 against rgb(${behind.join(',')}) — WCAG 1.4.11 needs ${MIN_CONTRAST}:1`,
        ).toBeGreaterThanOrEqual(MIN_CONTRAST);
      });
    }
  });
}
