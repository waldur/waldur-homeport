import { FC } from 'react';

import {
  ChartCanvasProps,
  ChartSpecView as SharedChartSpecView,
  ChartSpecViewProps,
} from 'waldur-charts';

import { EChart } from '@/core/EChart';
import { useTheme } from '@/theme/useTheme';

// The portal's chart: the shared canvas's job, with the export menu.
const PortalChart: FC<ChartCanvasProps> = ({ options, height, onClick }) => (
  <EChart options={options} height={height} onClick={onClick} />
);

/**
 * Renders a backend chart spec: title, subtitle, chart or empty message,
 * link. The shared one (waldur-charts), drawn with the portal's EChart and
 * theme.
 */
export const ChartSpecView: FC<Omit<ChartSpecViewProps, 'theme' | 'Chart'>> = (
  props,
) => {
  const { theme } = useTheme();
  return <SharedChartSpecView {...props} theme={theme} Chart={PortalChart} />;
};
