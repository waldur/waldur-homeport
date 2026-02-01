import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

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
          <NoResult
            title={translate('No data available')}
            message={translate('Try adjusting your filters or date range.')}
          />
        )}
      </Card.Body>
    </Card>
  );
};
