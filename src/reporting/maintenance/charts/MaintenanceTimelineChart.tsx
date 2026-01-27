import { FC } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { MaintenanceTimelineItem, TimelineGrouping } from '../types';
import { formatTimelineChart } from '../utils';

interface MaintenanceTimelineChartProps {
  items: MaintenanceTimelineItem[];
  groupBy: TimelineGrouping;
  colorBy: 'state' | 'impact';
}

export const MaintenanceTimelineChart: FC<MaintenanceTimelineChartProps> = ({
  items,
  groupBy,
  colorBy,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-muted text-center py-10">
        {translate('No maintenance data for timeline')}
      </div>
    );
  }

  const chartOptions = formatTimelineChart(items, groupBy, colorBy);

  return (
    <EChart
      options={chartOptions}
      height="400px"
      exportCsv
      exportTitle={translate('Maintenance Timeline')}
    />
  );
};
