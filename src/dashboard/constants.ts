import { generateBrandColors } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';

export const getChartBrandColor = () =>
  generateBrandColors(getBrandColor())['300'];
export const COMMON_WIDGET_HEIGHT = { height: 'auto', minHeight: '200px' };
export const CHART_BAR_ROUNDING = 5;
