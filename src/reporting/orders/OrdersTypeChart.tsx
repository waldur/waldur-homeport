import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { formatOrdersTypeChart } from './utils';

interface OrdersTypeChartProps {
  typeStats: Record<string, number>;
}

export const OrdersTypeChart: FC<OrdersTypeChartProps> = ({ typeStats }) => {
  const chartOptions = formatOrdersTypeChart(typeStats);
  const hasData = Object.values(typeStats).some((v) => v > 0);

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Orders by type')}</Card.Title>
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
