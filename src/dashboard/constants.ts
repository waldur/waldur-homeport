import { generateBrandColors } from '@waldur/core/generateColors';
import { getBrandColor } from '@waldur/core/utils';

export const getChartBrandColor = () =>
  generateBrandColors(getBrandColor())['300'];
export const CHART_SPLIT_LINE_COLOR_LIGHT = '#f2f4f7';
export const CHART_SPLIT_LINE_COLOR_DARK = '#1f242f';
export const COMMON_WIDGET_HEIGHT = { height: 'auto', minHeight: '200px' };
export const CHART_BAR_ROUNDING = 5;
