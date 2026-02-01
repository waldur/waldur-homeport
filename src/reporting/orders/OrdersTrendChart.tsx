import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { DailyOrderStats } from './types';
import { formatOrdersTrendChart } from './utils';

interface OrdersTrendChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersTrendChart: FC<OrdersTrendChartProps> = ({ dailyStats }) => {
  const chartOptions = formatOrdersTrendChart(dailyStats);

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Daily order volume')}</Card.Title>
      </Card.Header>
      <Card.Body>
        {dailyStats.length > 0 ? (
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
