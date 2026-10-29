import { FC, useCallback, useMemo } from 'react';
import { ResourceState } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { DonutChart } from '@/reporting/users/charts/DonutChart';

const getStateMapping = (): Partial<
  Record<ResourceState, { label: string; color: string }>
> => {
  const tc = getChartThemeColors();
  return {
    Creating: { label: translate('Creating'), color: tc.progress },
    OK: { label: translate('OK'), color: tc.success },
    Erred: { label: translate('Erred'), color: tc.danger },
    Updating: { label: translate('Updating'), color: tc.notice },
    Terminating: { label: translate('Terminating'), color: tc.muted },
    Terminated: { label: translate('Terminated'), color: tc.muted },
  };
};

interface ResourcesByStateChartProps {
  byState: Record<string, number>;
}

export const ResourcesByStateChart: FC<ResourcesByStateChartProps> = ({
  byState,
}) => {
  const chartData = useMemo(() => {
    const stateMapping = getStateMapping();
    return Object.entries(byState || {})
      .filter(([, value]) => value > 0)
      .map(([state, value]) => {
        const mapping = stateMapping[state] || {
          label: state,
          color: getChartThemeColors().muted,
        };
        return {
          name: mapping.label,
          value,
          itemStyle: { color: mapping.color },
        };
      });
  }, [byState]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('State'), translate('Count')],
      data: Object.entries(byState || {}).map(([state, count]) => [
        getStateMapping()[state]?.label || state,
        count,
      ]),
    }),
    [byState],
  );

  return (
    <ChartCard
      title={translate('Resources by state')}
      getExportData={getExportData}
      isEmpty={!chartData || chartData.length === 0}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} height="300px" />}
    </ChartCard>
  );
};
