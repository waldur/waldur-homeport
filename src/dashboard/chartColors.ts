import { generateBrandColors } from '@/core/generateColors';
import { getBrandColor } from '@/core/utils';

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
export const getChartThemeColors = () => {
  const brand = generateBrandColors(getBrandColor());
  return {
    brand300: brand[300],
    brand400: brand[400],
    brand500: brand[500],
    brand600: brand[600],
    /** Secondary / remaining / inactive series (gray-300). */
    neutral: '#d0d5dd',
    /** Track / background fill (gray-200). */
    track: '#e4e7ec',
    /** Axis / muted label text (gray-500). */
    muted: '#667085',
    /** Strong body text (gray-700). */
    text: '#344054',
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
