import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

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
          <NoResult
            title={translate('No data available')}
            message={translate('Try adjusting your filters or date range.')}
          />
        )}
      </Card.Body>
    </Card>
  );
};
