import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { contrastRatio, parseColor } from 'waldur-design-tokens/contrast';
import { buttonVariants, menuItem, tabTriggerVariants } from 'waldur-ui';

/**
 * Asserts that keyboard focus produces a *visible* indicator, with enough
 * contrast to satisfy WCAG 1.4.11.
 *
 * A visual comparison passes just as happily when a control renders no ring at
 * all, so it cannot catch a control losing its indicator outright (WCAG 2.4.7),
 * which is what had happened across the login page.
 *
 * Each fixture is a place where a `box-shadow`-based ring was previously
 * suppressed — elevation utilities, unlayered page CSS, menu rows — so
 * re-adding any such suppression fails the Storybook tests instead of silently
 * costing keyboard users their focus indicator. The buttons are rendered with
 * the same `buttonVariants()` classes BaseButton uses.
 *
 * `.btn-no-focus` is deliberately not a fixture: its
 * `:not(:focus-visible) { outline: none !important }` rule is rewritten by
 * Storybook's pseudo-states addon into `:not(.pseudo-focus-visible)`, which
 * always matches, so the case fails here while the real app keeps its ring.
 */
const meta: Meta = {
  title: 'Foundations/Focus ring',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

/** Mimics an unlayered page stylesheet putting a `box-shadow` on every button
 *  inside a container — a plain (non-`@layer`) rule beats every layered ring. */
const UNLAYERED_OVERRIDE = `.layout-neumorphism-card button {
  box-shadow: 5px 5px 10px currentColor, -5px -5px 10px currentColor;
}`;

const button = (variant: Parameters<typeof buttonVariants>[0]['variant']) =>
  buttonVariants({ variant, size: 'md' });

const Fixtures = () => (
  <>
    <style>{UNLAYERED_OVERRIDE}</style>
    <div className="flex flex-col items-start gap-4 p-10">
      <button className={button('tertiary')} data-ring="tertiary">
        Tertiary
      </button>
      <button className={button('primary')} data-ring="primary">
        Primary
      </button>
      <button className={button('text-primary')} data-ring="text-primary">
        Text button
      </button>
      <button
        className={`${button('tertiary')} shadow-sm`}
        data-ring="shadow-sm"
      >
        Elevated
      </button>
      <div className="layout-neumorphism-card">
        <button className={button('tertiary')} data-ring="unlayered-override">
          Neumorphic
        </button>
      </div>
      <a
        href="/menu-row"
        className={menuItem({ look: 'nav' })}
        data-ring="nav-menu-row"
      >
        Menu row
      </a>
      <button
        type="button"
        role="tab"
        className={tabTriggerVariants()}
        data-ring="nav-line-tab"
      >
        View
      </button>
    </div>
  </>
);

const CASES = [
  'tertiary',
  'primary',
  'text-primary',
  'shadow-sm',
  'unlayered-override',
  'nav-menu-row',
  'nav-line-tab',
] as const;

/** Controls whose ring is drawn straight onto a solid brand fill, where the
 *  brand-on-brand contrast is inherently too low (~1.6:1). A pre-existing token
 *  gap, not a regression; fixing it is a design decision. These are asserted to
 *  still fall short, so a fix shows up as a failure asking to drop the entry. */
const KNOWN_CONTRAST_GAPS = new Set<string>(['primary']);

/** WCAG 1.4.11 Non-text Contrast: an indicator needs 3:1 against what it sits against. */
const MIN_CONTRAST = 3;

const TRANSPARENT = /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/;

/** Tabs from the top of the page until the wanted element has focus, so
 *  `:focus-visible` matches the way it does for a real keyboard user. */
async function focusByKeyboard(ring: string) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  for (let i = 0; i < 20; i++) {
    await userEvent.tab();
    const active = document.activeElement as HTMLElement | null;
    if (active?.dataset?.ring === ring) return active;
  }
  return null;
}

/** Why `ring` fails, or null when its indicator is visible with enough contrast. */
async function checkRing(ring: string): Promise<string | null> {
  const el = await focusByKeyboard(ring);
  if (!el) return 'never received keyboard focus within 20 tab stops';
  if (!el.matches(':focus-visible')) {
    return 'focused by keyboard, but :focus-visible does not match';
  }

  const cs = getComputedStyle(el);
  const outlineWidth = parseFloat(cs.outlineWidth);
  const hasOutline = cs.outlineStyle !== 'none' && outlineWidth > 0;
  // Tailwind composes its ring from several layers, most of them transparent;
  // the ring is visible when any one layer has a colour and a non-zero length.
  const hasShadow =
    cs.boxShadow !== 'none' &&
    cs.boxShadow
      .split(/,(?![^(]*\))/)
      .some(
        (layer) =>
          !TRANSPARENT.test(layer) &&
          (layer.match(/-?[\d.]+px/g) ?? []).some((n) => parseFloat(n) !== 0),
      );

  if (!hasOutline && !hasShadow) {
    return `no focus indicator at all — outline ${outlineWidth}px/${cs.outlineStyle}, box-shadow ${cs.boxShadow} (WCAG 2.4.7)`;
  }
  // Contrast of a multi-layer box-shadow ring isn't meaningfully one value.
  if (!hasOutline) return null;

  const ringColor = parseColor(cs.outlineColor);
  if (!ringColor) return `unreadable outline color ${cs.outlineColor}`;

  // With a positive offset the ring is separated from the control by a gap
  // showing whatever is behind it, so the page background — not the control's
  // own fill — is what it must contrast against. Drawn flush, it sits directly
  // on the control.
  const ownBackground = parseColor(cs.backgroundColor);
  const behind =
    parseFloat(cs.outlineOffset) > 0 ||
    TRANSPARENT.test(cs.backgroundColor) ||
    !ownBackground
      ? parseColor(getComputedStyle(document.body).backgroundColor)
      : ownBackground;
  if (!behind) return null;

  const ratio = contrastRatio(ringColor, behind);
  const passes = ratio >= MIN_CONTRAST;
  if (KNOWN_CONTRAST_GAPS.has(ring)) {
    return passes
      ? `now reaches ${ratio.toFixed(2)}:1 — remove it from KNOWN_CONTRAST_GAPS`
      : null;
  }
  return passes
    ? null
    : `focus ring contrast ${ratio.toFixed(2)}:1 against rgb(${behind.join(',')}) — WCAG 1.4.11 needs ${MIN_CONTRAST}:1`;
}

const play: Story['play'] = async () => {
  const failures: string[] = [];
  for (const ring of CASES) {
    const failure = await checkRing(ring);
    if (failure) failures.push(`${ring}: ${failure}`);
  }
  await expect(failures).toEqual([]);
};

export const Light: Story = {
  render: () => <Fixtures />,
  globals: { theme: 'light' },
  play,
};

export const Dark: Story = {
  render: () => <Fixtures />,
  globals: { theme: 'dark' },
  play,
};
