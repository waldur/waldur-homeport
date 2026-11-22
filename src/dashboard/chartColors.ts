import {
  getChartThemeColors as getSharedChartThemeColors,
  useChartThemeColors as useSharedChartThemeColors,
} from 'waldur-charts';

import { getBrandColor } from '@/core/utils';
import { useTheme } from '@/theme/useTheme';

// The palette moved to waldur-charts, shared with the micro-apps. The portal
// keeps these names: its brand colour comes from its own configuration, and
// its theme from its own context.
export { getCategoricalColors, getSaturationRamp } from 'waldur-charts';

export const getChartThemeColors = () =>
  getSharedChartThemeColors(getBrandColor());

export const useChartThemeColors = () => {
  const { theme } = useTheme();
  return useSharedChartThemeColors(theme);
};
