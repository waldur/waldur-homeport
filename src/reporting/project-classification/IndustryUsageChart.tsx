import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { DonutChart } from '@waldur/reporting/users/charts/DonutChart';

interface IndustryUsageChartProps {
  projectCounts: Array<{ industry_flag: boolean; count: number }>;
}

export const IndustryUsageChart: FC<IndustryUsageChartProps> = ({
  projectCounts,
}) => {
  const aggregatedCounts = useMemo(() => {
    let industryCount = 0;
    let academicCount = 0;
    projectCounts.forEach((item) => {
      if (item.industry_flag) {
        industryCount += item.count;
      } else {
        academicCount += item.count;
      }
    });
    return [
      {
        name: translate('Academic'),
        value: academicCount,
        itemStyle: { color: '#50cd89' },
      },
      {
        name: translate('Industry'),
        value: industryCount,
        itemStyle: { color: '#7239ea' },
      },
    ];
  }, [projectCounts]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Industry Category'), translate('Count')],
      data: aggregatedCounts.map((item) => [item.name, item.value]),
    }),
    [aggregatedCounts],
  );

  return (
    <ChartCard
      title={translate('Projects by industry classification')}
      getExportData={getExportData}
      isEmpty={!aggregatedCounts.some((item) => item.value > 0)}
    >
      {(ref) => <DonutChart ref={ref} data={aggregatedCounts} height="300px" />}
    </ChartCard>
  );
};
