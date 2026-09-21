import { useMemo } from 'react';

import { generateBrandColors, getCssVar } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { useTheme } from '@/theme/useTheme';

/**
 * Theme-aligned colors for dashboard charts and widgets.
 *
 * Mirrors the conventions the main dashboard charts use
 * (src/dashboard/utils.ts, src/marketplace/aggregate-limits/utils.ts): the
 * primary/consumed series is the brand green ramp, the secondary / remaining
 * series is neutral gray-300, and status hues use the theme's semantic ramp
 * values (src/metronic/sass/_colors.scss) instead of ad-hoc Tailwind/Bootstrap
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
 * and physical, so `ramp()` is the same value in either theme. It is also the
 * fallback for the Bootstrap variables, three of which (`--bs-secondary-bg`,
 * `--bs-secondary-color`, `--bs-card-bg`) the compiled stylesheet does not
 * define, so those three are, today, light-theme values in dark mode too.
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
    neutral: getCssVar('--waldur-utility-gray-300', ramp('gray', 300)),
    /** Track / background fill (gray-200). */
    track: getCssVar('--bs-secondary-bg', ramp('gray', 200)),
    /** Axis / muted label text (gray-500). */
    muted: getCssVar('--bs-secondary-color', ramp('gray', 500)),
    /** Strong body text (gray-700). */
    text: getCssVar('--bs-body-color', ramp('gray', 700)),
    /** Card / canvas background, for gaps and borders drawn inside a chart. */
    surface: getCssVar('--bs-card-bg', getCssVar('--surface-card-bg')),
    /** Divider between chart elements. */
    border: getCssVar('--bs-border-color', ramp('gray', 200)),
    /** success-600 */
    success: ramp('success', 600),
    /** warning-600 */
    warning: ramp('warning', 600),
    /** error-600 (the `danger` of the SCSS variables) */
    danger: ramp('error', 600),
    /** info-600 */
    info: ramp('info', 600),
  };
};

/**
 * Eight series colours for a chart that needs many: the brand's 300 first, then
 * the 300 step of each accent hue.
 */
export const getCategoricalColors = () => [
  getChartThemeColors().brand300,
  ...['blue', 'teal', 'info', 'pink', 'indigo', 'moss', 'rose'].map((hue) =>
    ramp(hue, 300),
  ),
];

/**
 * Four-step usage-saturation ramp (healthy → danger), all drawn from the
 * theme's brand/warning/danger ramps so gauges and horizon bars stay on-theme.
 */
export const getSaturationRamp = () => {
  const c = getChartThemeColors();
  return {
    ok: c.brand500, // green — healthy
    notice: ramp('warning', 400), // early notice
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
