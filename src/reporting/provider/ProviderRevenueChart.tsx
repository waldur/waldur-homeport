import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';
import { Row } from 'react-bootstrap';
import { ServiceProviderRevenues } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { BarChart } from '@/reporting/users/charts/BarChart';

interface ProviderRevenueChartProps {
  data: ServiceProviderRevenues[];
}

export const ProviderRevenueChart: FC<ProviderRevenueChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      (data || []).map((d) => ({
        name: DateTime.fromObject({ year: d.year, month: d.month }).toFormat(
          'MMM yyyy',
        ),
        value: d.total || 0,
      })),
    [data],
  );

  const tooltipFormatter = useCallback((params: any) => {
    const param = Array.isArray(params) ? params[0] : params;
    return `${param.name}: ${defaultCurrency(param.value)}`;
  }, []);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('Revenue')],
      data: (data || []).map((d) => [
        DateTime.fromObject({ year: d.year, month: d.month }).toFormat(
          'MMM yyyy',
        ),
        d.total || 0,
      ]),
    }),
    [data],
  );

  return (
    <Row>
      <ChartCard
        title={translate('Revenue trend (12 months)')}
        getExportData={getExportData}
        isEmpty={!data || data.length === 0}
      >
        {(ref) => (
          <BarChart
            ref={ref}
            data={chartData}
            height="400px"
            isSorted={false}
            tooltipFormatter={tooltipFormatter}
          />
        )}
      </ChartCard>
    </Row>
  );
};
