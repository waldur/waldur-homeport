import { FC } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { MaintenanceTimelineItem, TimelineGrouping } from '../types';
import { formatTimelineChart } from '../utils';

interface MaintenanceTimelineChartProps {
  items: MaintenanceTimelineItem[];
  groupBy: TimelineGrouping;
  colorBy: 'state' | 'impact';
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
