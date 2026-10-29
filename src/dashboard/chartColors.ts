import { useMemo } from 'react';

import { generateBrandColors, getCssVar, hexToRgb } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { useTheme } from '@/theme/useTheme';

/**
 * Theme-aligned colors for dashboard charts and widgets.
 *
 * Mirrors the conventions the main dashboard charts use
 * (src/dashboard/utils.ts, src/marketplace/aggregate-limits/utils.ts): the
 * primary/consumed series is the brand green ramp, the secondary / remaining
 * series is neutral gray-300, and status hues use the theme's semantic ramp
 * values (packages/design-tokens/src/css/primitives/colorRamps.css) instead of ad-hoc Tailwind/Bootstrap
 * hex. Keeping one source here means the experimental widgets track the brand
 * color and never drift back to off-theme palettes.
 */
/**
 * Colours below are read with getCssVar(). The light and dark themes ship as
 * separate stylesheets that define the same variable names, so anything
 * resolved this way follows the active theme — charts draw onto a canvas and
 * cannot use the variables directly. Callers must recompute when the theme
 * changes; `useChartThemeColors` does that for them.
 *
 * The colour ramps (`--color-<ramp>-<step>`) are always there (`@theme static`)
 * and physical, so `ramp()` is the same value in either theme. The track and
 * muted colours use it directly, so they are the same light-theme grays in dark
 * mode: they used to read `--bs-secondary-bg` and `--bs-secondary-color`,
 * which the Bootstrap we ship (5.1.3) never defined, so the ramp was always
 * the value that rendered. The text, surface and border colours read the
 * design tokens and follow the theme.
 */
const ramp = (name: string, step: number) =>
  getCssVar(`--color-${name}-${step}`);

export const getChartThemeColors = () => {
  const brand = generateBrandColors(getBrandColor());
  return {
    brand300: brand[300],
    brand400: brand[400],
    brand500: brand[500],
    brand600: brand[600],
    /** Secondary / remaining / inactive series (gray-300). */
    neutral: ramp('gray', 300),
    /** The darker partner of `neutral` in a paired series (gray-400). */
    neutralStrong: ramp('gray', 400),
    /** Track / background fill (gray-200). */
    track: ramp('gray', 200),
    /** The unused part of a gauge or pie (--bg-quaternary), theme-aware unlike `track`. */
    remaining: getCssVar('--bg-quaternary', ramp('gray', 200)),
    /** Axis / muted label text (gray-500). */
    muted: ramp('gray', 500),
    /** Strong body text (--text-primary: gray-900, gray-dark-25 in dark). */
    text: getCssVar('--text-primary', ramp('gray', 900)),
    /** Label text a step down from `text` (--text-secondary). */
    textSecondary: getCssVar('--text-secondary', ramp('gray', 700)),
    /** Supporting label text (--text-quaternary), theme-aware unlike `muted`. */
    textQuaternary: getCssVar('--text-quaternary', ramp('gray', 500)),
    /** Card / canvas background, for gaps and borders drawn inside a chart. */
    surface: getCssVar('--card-bg'),
    /** Divider between chart elements. */
    border: getCssVar('--border-secondary', ramp('gray', 200)),
    /** success-600 */
    success: ramp('success', 600),
    /** warning-400: an early notice, or a state waiting on someone. */
    notice: ramp('warning', 400),
    /** warning-600 */
    warning: ramp('warning', 600),
    /** error-600 (the `danger` of the SCSS variables) */
    danger: ramp('error', 600),
    /** info-600 */
    info: ramp('info', 600),
    /** --shadow-color at an opacity, resolved for a canvas (no color-mix there). */
    shadow: (alpha: number) =>
      `rgba(${hexToRgb(getCssVar('--shadow-color')) ?? '0, 0, 0'}, ${alpha})`,
    /** Text and markers in the info hue (--status-info-fg). */
    infoFg: getCssVar('--status-info-fg', ramp('info', 600)),
    /** A tinted chip behind `infoFg` text (--status-info-bg). */
    infoBg: getCssVar('--status-info-bg', ramp('info', 50)),
    /** Work under way: an executing order, a maintenance in progress. */
    progress: ramp('blue', 500),
  };
};

const ACCENT_HUES = ['blue', 'teal', 'info', 'pink', 'indigo', 'moss', 'rose'];

/**
 * Series colours for a chart that needs many: the brand's 300 first, then the
 * 300 step of each accent hue (eight in all). Past eight, the same hues repeat
 * at the 500 step, so `count` up to sixteen stays distinct.
 */
export const getCategoricalColors = (count = 8) => {
  const brand = getChartThemeColors();
  const steps = [
    brand.brand300,
    ...ACCENT_HUES.map((hue) => ramp(hue, 300)),
    brand.brand500,
    ...ACCENT_HUES.map((hue) => ramp(hue, 500)),
  ];
  return steps.slice(0, Math.min(count, steps.length));
};

/**
 * Four-step usage-saturation ramp (healthy → danger), all drawn from the
 * theme's brand/warning/danger ramps so gauges and horizon bars stay on-theme.
 */
export const getSaturationRamp = () => {
  const c = getChartThemeColors();
  return {
    ok: c.brand500, // green — healthy
    notice: c.notice, // warning-400 — early notice
    warning: c.warning, // warning-600 — approaching
    danger: c.danger, // error-600 — over
  };
};

/**
 * Theme-reactive palette for chart components. Recomputes when the user flips
 * the theme, which a bare `getChartThemeColors()` call inside a memo would not.
 */
export const useChartThemeColors = () => {
  const { theme } = useTheme();
  return useMemo(() => getChartThemeColors(), [theme]);
};
