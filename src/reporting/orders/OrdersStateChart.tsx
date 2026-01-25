import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { formatOrdersStateChart } from './utils';

interface OrdersStateChartProps {
  stateStats: Record<string, number>;
}

export const OrdersStateChart: FC<OrdersStateChartProps> = ({ stateStats }) => {
  const chartOptions = formatOrdersStateChart(stateStats);
  const hasData = Object.values(stateStats).some((v) => v > 0);

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Orders by state')}</Card.Title>
      </Card.Header>
      <Card.Body>
        {hasData ? (
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
