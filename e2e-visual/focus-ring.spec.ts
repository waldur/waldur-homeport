import { test, expect, Page } from '@playwright/test';

/**
 * Asserts that keyboard focus produces a *visible* indicator, with enough
 * contrast to satisfy WCAG 1.4.11.
 *
 * base-button-parity.spec.ts compares the old and new buttons against each
 * other, so it passes just as happily when neither renders a ring at all. It
 * cannot catch a control losing its indicator outright (WCAG 2.4.7), which is
 * what had happened across the login page.
 *
 * Each fixture below is a place where a `box-shadow`-based ring was previously
 * suppressed — button groups, `.btn-no-focus`, elevation utilities, unlayered
 * page CSS, `.btn-link`, `.menu-link` — so re-adding any such suppression
 * fails CI instead of silently costing keyboard users their focus indicator.
 */

const STORYBOOK_URL = 'http://localhost:6006';

/** Any story will do — we only need Storybook's compiled Metronic stylesheet
 *  and its seeded --waldur-brand-* tokens, then we supply our own markup. */
const STORY =
  '/iframe.html?id=migration-basebutton-parity--default&viewMode=story&globals=theme:';

/** Mimics the unlayered `.btn` box-shadow that src/auth/layouts/NeumorphismLayout.css
 *  applies via a plain (non-`@layer`) import. */
const UNLAYERED_OVERRIDE = `.layout-neumorphism-card .btn {
  box-shadow: 5px 5px 10px #bec3c9, -5px -5px 10px #ffffff;
}`;

const FIXTURES = `
<div id="focus-fixtures" style="padding:40px;display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <button class="btn btn-tertiary" data-ring="tertiary">Tertiary</button>
  <button class="btn btn-primary" data-ring="primary">Primary</button>
  <button class="btn btn-link" data-ring="btn-link">Link button</button>
  <button class="btn btn-tertiary btn-no-focus" data-ring="btn-no-focus">No-focus</button>
  <button class="btn btn-tertiary shadow-sm" data-ring="shadow-sm">Elevated</button>
  <div class="btn-group">
    <input class="btn-check" type="radio" id="ring-toggle" name="ring-group">
    <label class="btn btn-tertiary" for="ring-toggle" data-ring="btn-group-label">Toggle</label>
  </div>
  <div class="layout-neumorphism-card">
    <button class="btn btn-tertiary" data-ring="unlayered-override">Neumorphic</button>
  </div>
  <ul class="menu"><li class="menu-item">
    <a href="#" class="menu-link" data-ring="menu-link">Menu link</a>
  </li></ul>
</div>`;

const CASES = [
  'tertiary',
  'primary',
  'btn-link',
  'btn-no-focus',
  'shadow-sm',
  'btn-group-label',
  'unlayered-override',
  'menu-link',
] as const;

/** Controls whose ring is drawn straight onto a solid brand fill, where the
 *  brand-on-brand contrast is inherently too low. See the comment at the
 *  test.fail() call for why these are recorded rather than fixed here. */
const KNOWN_CONTRAST_GAPS = new Set<string>(['primary']);

/** WCAG 1.4.11 Non-text Contrast: an indicator needs 3:1 against what it sits against. */
const MIN_CONTRAST = 3;

function relativeLuminance([r, g, b]: number[]) {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: number[], b: number[]) {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(value: string): number[] | null {
  const parts = value.match(/[\d.]+/g);
  return parts && parts.length >= 3 ? parts.slice(0, 3).map(Number) : null;
}

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
 *  .focus() call would not exercise the `.btn-check:focus + .btn` sibling path
 *  at all, and measuring in a later round-trip let focus drift. */
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
      // For `.btn-check` toggles the focus sits on the visually hidden input
      // while the ring is drawn on its label.
      const styled = active.classList.contains('btn-check')
        ? (active.nextElementSibling as HTMLElement | null)
        : active;
      if (!styled || styled.dataset?.ring !== target) return null;
      const styles = getComputedStyle(styled);
      return {
        outlineWidth: parseFloat(styles.outlineWidth),
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        outlineOffset: parseFloat(styles.outlineOffset),
        boxShadow: styles.boxShadow,
        background: styles.backgroundColor,
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

        const ringColor = parseRgb(measured!.outlineColor);
        expect(ringColor, `${ring}: unreadable outline color`).not.toBeNull();

        // With a positive offset the ring is separated from the control by a
        // gap showing whatever is behind it, so the page background — not the
        // control's own fill — is what it must contrast against. Drawn flush,
        // it sits directly on the control.
        const ownBackground = parseRgb(measured!.background);
        const isTransparent = /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(
          measured!.background,
        );
        const behind =
          measured!.outlineOffset > 0 || isTransparent || !ownBackground
            ? parseRgb(measured!.pageBackground)
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
