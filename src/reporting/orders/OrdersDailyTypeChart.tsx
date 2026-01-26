import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { DailyOrderStats } from './types';
import { formatDailyTypeChart } from './utils';

interface OrdersDailyTypeChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersDailyTypeChart: FC<OrdersDailyTypeChartProps> = ({
  dailyStats,
}) => {
  const chartOptions = formatDailyTypeChart(dailyStats);

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Daily orders by type')}</Card.Title>
      </Card.Header>
      <Card.Body>
        {dailyStats.length > 0 ? (
          <EChart options={chartOptions} height="300px" />
        ) : (
          <div className="text-muted text-center py-10">
            {translate('No orders in the selected period')}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
