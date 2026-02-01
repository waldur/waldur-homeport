import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { YearlyComparison } from './types';
import { formatYearOverYearChart } from './utils';

interface YearOverYearChartProps {
  comparison: YearlyComparison[];
  year: number;
}

export const YearOverYearChart: FC<YearOverYearChartProps> = ({
  comparison,
  year,
}) => {
  const chartOptions = formatYearOverYearChart(comparison, year);
  const hasData = comparison.some(
    (c) => c.currentYear > 0 || c.previousYear > 0,
  );

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>
          {translate('Year-over-year comparison: {current} vs {previous}', {
            current: year,
            previous: year - 1,
          })}
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
