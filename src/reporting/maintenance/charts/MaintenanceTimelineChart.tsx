import { FC } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

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
      <NoResult
        title={translate('No data available')}
        message={translate('Try adjusting your filters or date range.')}
      />
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
