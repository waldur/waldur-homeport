import { FC } from 'react';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

import {
  MaintenanceTimelineItem,
  TimelineColoring,
  TimelineGrouping,
} from '../types';
import { formatTimelineChart } from '../utils';

interface MaintenanceTimelineChartProps {
  items: MaintenanceTimelineItem[];
  groupBy: TimelineGrouping;
  colorBy: TimelineColoring;
  chartRef?: React.RefObject<any>;
}

export const MaintenanceTimelineChart: FC<MaintenanceTimelineChartProps> = ({
  items,
  groupBy,
  colorBy,
  chartRef,
}) => {
  const chartOptions = formatTimelineChart(items, groupBy, colorBy);

  return (
    <EChart
      ref={chartRef}
      options={chartOptions}
      height="400px"
      exportTitle={translate('Maintenance timeline')}
    />
  );
};
