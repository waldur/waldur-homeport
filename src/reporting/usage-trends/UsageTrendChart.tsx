import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

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
          <div className="text-muted text-center py-10">
            {translate('No usage data available for {year}', { year })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
