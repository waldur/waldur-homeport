import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

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
  const chartOptions = useMemo(
    () => formatYearOverYearChart(comparison, year),
    [comparison, year],
  );

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Month'),
        translate('Current Year ({year})', { year }),
        translate('Previous Year ({year})', { year: year - 1 }),
        translate('Growth %'),
      ],
      data: (comparison || []).map((c) => [
        c.monthName,
        c.currentYear,
        c.previousYear,
        c.growthPercent.toFixed(1),
      ]),
    }),
    [comparison, year],
  );

  return (
    <ChartCard
      title={translate('Year-over-year comparison: {current} vs {previous}', {
        current: year,
        previous: year - 1,
      })}
      getExportData={getExportData}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="350px" />}
    </ChartCard>
  );
};
