import { ENV } from '@waldur/core/config';

export const LINE_CHART_COLOR =
  ENV.plugins.WALDUR_CORE.BRAND_COLOR || '#12B76A'; // green
export const COMMON_WIDGET_HEIGHT = { height: 'auto', minHeight: '200px' };
export const CHART_BAR_ROUNDING = 5;
