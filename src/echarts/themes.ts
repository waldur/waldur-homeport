/**
 * The `light-metronic` and `dark-metronic` ECharts themes, built from the
 * design tokens.
 *
 * Charts draw onto a canvas, which cannot read CSS variables, so each theme
 * resolves the ramp steps its roles use when it is registered. The ramps are
 * `@theme static` and physical, so both themes can be built at once whichever
 * theme is active; each takes the step its semantic token points at in that
 * theme (packages/design-tokens/src/css/semantic). This module is only loaded
 * with ECharts, on the first chart, by when the stylesheets are in place.
 *
 * Only the parts the app draws are themed: axes, legend, title, tooltip,
 * toolbox and dataZoom.
 */

import * as echarts from 'echarts';

import { getCssVar } from 'waldur-design-tokens';

import { getCategoricalColors } from '@/dashboard/chartColors';

const ramp = (name: string, step: number) =>
  getCssVar(`--color-${name}-${step}`);

const buildTheme = (mode: 'light' | 'dark') => {
  const light = mode === 'light';
  // Axis lines and labels, legend and title text: --text-quaternary.
  const contrastColor = light ? ramp('gray', 500) : ramp('gray-dark', 400);
  // Grid lines: a step off the surface.
  const splitLineColor = light ? ramp('gray', 100) : ramp('gray-dark', 800);
  // Legend labels name the series, so they read stronger than axis labels:
  // --text-secondary (gray-700, close to ECharts' default #333 in light).
  const legendColor = light ? ramp('gray', 700) : ramp('gray-dark', 200);

  const axisCommon = () => ({
    axisLine: { lineStyle: { color: contrastColor } },
    axisTick: { lineStyle: { color: contrastColor } },
    axisLabel: { color: contrastColor },
    splitLine: { lineStyle: { color: splitLineColor } },
    splitArea: { areaStyle: { color: contrastColor } },
  });

  // The dark theme also colours plain text and the title (the light one
  // keeps ECharts' defaults there) and fills line symbols.
  const darkOnly = light
    ? { title: { textStyle: { fontWeight: 'normal' } } }
    : {
        textStyle: { color: contrastColor },
        title: { textStyle: { color: contrastColor } },
        line: { symbol: 'circle' },
      };

  return {
    ...darkOnly,
    color: getCategoricalColors(),
    legend: { textStyle: { color: legendColor } },
    tooltip: {
      axisPointer: {
        lineStyle: { color: contrastColor },
        crossStyle: { color: contrastColor },
      },
      // The card surface, not an inverted box: the tooltip HTML charts
      // write uses the theme's text tokens (text-quaternary, text-info), and
      // var() resolves in the tooltip's inline style, so it follows a theme
      // switch with no re-registration.
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-secondary)',
      textStyle: { color: 'var(--text-primary)' },
    },
    // ECharts' default axis-pointer label already reads on a light card.
    ...(light
      ? {}
      : {
          axisPointer: { label: { backgroundColor: ramp('gray-dark', 600) } },
        }),
    toolbox: { iconStyle: { borderColor: contrastColor } },
    dataZoom: light
      ? {
          dataBackgroundColor: ramp('gray', 300),
          // The selected window, a step off the surface.
          fillerColor: ramp('gray', 100),
          handleColor: contrastColor,
          textStyle: { color: contrastColor },
        }
      : { textStyle: { color: contrastColor } },
    timeAxis: axisCommon(),
    logAxis: axisCommon(),
    valueAxis: axisCommon(),
    categoryAxis: axisCommon(),
  };
};

echarts.registerTheme('dark-metronic', buildTheme('dark'));
echarts.registerTheme('light-metronic', buildTheme('light'));
