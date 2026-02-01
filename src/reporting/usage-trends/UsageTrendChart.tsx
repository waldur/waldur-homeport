import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { MonthlyUsageData } from './types';
import { formatUsageTrendChart } from './utils';

interface UsageTrendChartProps {
  monthlyData: MonthlyUsageData[];
  year: number;
}

export const UsageTrendChart: FC<UsageTrendChartProps> = ({
  monthlyData,
  year,
}) => {
  const chartOptions = formatUsageTrendChart(monthlyData);
  const hasData = monthlyData.length > 0;

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>
          {translate('Monthly usage trend ({year})', { year })}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {hasData ? (
          <EChart options={chartOptions} height="350px" />
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
