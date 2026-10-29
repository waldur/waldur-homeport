import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { DonutChart } from '@/reporting/users/charts/DonutChart';

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
    const tc = getChartThemeColors();
    return [
      {
        name: translate('Academic'),
        value: academicCount,
        itemStyle: { color: tc.success },
      },
      {
        name: translate('Industry'),
        value: industryCount,
        itemStyle: { color: tc.info },
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
