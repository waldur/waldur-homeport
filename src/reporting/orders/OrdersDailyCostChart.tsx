import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { DailyOrderStats } from './types';
import { formatDailyCostChart } from './utils';

interface OrdersDailyCostChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersDailyCostChart: FC<OrdersDailyCostChartProps> = ({
  dailyStats,
}) => {
  const chartOptions = formatDailyCostChart(dailyStats);
  const hasCosts = dailyStats.some(
    (d) => d.total_cost && parseFloat(d.total_cost) > 0,
  );

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Daily order cost')}</Card.Title>
      </Card.Header>
      <Card.Body>
        {hasCosts ? (
          <EChart options={chartOptions} height="300px" />
        ) : (
          <div className="text-muted text-center py-10">
            {translate('No cost data in the selected period')}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
