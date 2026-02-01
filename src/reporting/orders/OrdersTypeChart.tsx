import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

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
          <NoResult
            title={translate('No data available')}
            message={translate('Try adjusting your filters or date range.')}
          />
        )}
      </Card.Body>
    </Card>
  );
};
