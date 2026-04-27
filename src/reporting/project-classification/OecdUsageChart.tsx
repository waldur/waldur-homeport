import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { BarChart } from '@/reporting/users/charts/BarChart';

interface OecdUsageChartProps {
  projectCounts: Array<{ oecd_code: string; count: number }>;
}

export const OecdUsageChart: FC<OecdUsageChartProps> = ({ projectCounts }) => {
  const aggregatedCounts = useMemo(() => {
    const countMap = new Map<string, number>();
    projectCounts.forEach((item) => {
      const current = countMap.get(item.oecd_code) || 0;
      countMap.set(item.oecd_code, current + item.count);
    });
    return Array.from(countMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [projectCounts]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('OECD Category'), translate('Count')],
      data: aggregatedCounts.map((item) => [item.name, item.value]),
    }),
    [aggregatedCounts],
  );

  return (
    <ChartCard
      title={translate('Projects by OECD classification')}
      getExportData={getExportData}
      isEmpty={aggregatedCounts.length === 0}
    >
      {(ref) => (
        <BarChart
          ref={ref}
          data={aggregatedCounts.slice(0, 10)}
          height="400px"
          horizontal
        />
      )}
    </ChartCard>
  );
};
