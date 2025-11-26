import { ENV } from '@waldur/core/config';

export const CHART_LINE_COLOR =
  ENV.plugins.WALDUR_CORE.BRAND_COLOR || '#307300'; // green
export const CHART_SPLIT_LINE_COLOR_LIGHT = '#f2f4f7';
export const CHART_SPLIT_LINE_COLOR_DARK = '#1f242f';
export const COMMON_WIDGET_HEIGHT = { height: 'auto', minHeight: '200px' };
export const CHART_BAR_ROUNDING = 5;
