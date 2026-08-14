import { useMemo } from 'react';

import { generateBrandColors } from '@/core/generateColors';
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
 * Reads a CSS custom property off the document root. The light and dark themes
 * ship as separate stylesheets that define the same variable names, so anything
 * resolved this way follows the active theme — charts draw onto a canvas and
 * cannot use the variables directly. Callers must recompute when the theme
 * changes; `useChartThemeColors` does that for them.
 */
const cssVar = (name: string, fallback: string): string => {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

export const getChartThemeColors = () => {
  const brand = generateBrandColors(getBrandColor());
  return {
    brand300: brand[300],
    brand400: brand[400],
    brand500: brand[500],
    brand600: brand[600],
    /** Secondary / remaining / inactive series (gray-300). */
    neutral: cssVar('--waldur-utility-gray-300', '#d0d5dd'),
    /** Track / background fill (gray-200). */
    track: cssVar('--bs-secondary-bg', '#e4e7ec'),
    /** Axis / muted label text (gray-500). */
    muted: cssVar('--bs-secondary-color', '#667085'),
    /** Strong body text (gray-700). */
    text: cssVar('--bs-body-color', '#344054'),
    /** Card / canvas background, for gaps and borders drawn inside a chart. */
    surface: cssVar('--bs-card-bg', '#ffffff'),
    /** Divider between chart elements. */
    border: cssVar('--bs-border-color', '#e4e7ec'),
    /** $success-600 */
    success: '#039855',
    /** $warning-600 */
    warning: '#dc6803',
    /** $danger-600 */
    danger: '#d92d20',
    /** $info-600 */
    info: '#6938ef',
  };
};

/**
 * Four-step usage-saturation ramp (healthy → danger), all drawn from the
 * theme's brand/warning/danger ramps so gauges and horizon bars stay on-theme.
 */
export const getSaturationRamp = () => {
  const c = getChartThemeColors();
  return {
    ok: c.brand500, // green — healthy
    notice: '#fdb022', // $warning-400 — early notice
    warning: c.warning, // $warning-600 — approaching
    danger: c.danger, // $danger-600 — over
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
