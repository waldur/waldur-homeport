import { FC, useCallback, useMemo } from 'react';
import { ResourceState } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';
import { DonutChart } from '@waldur/reporting/users/charts/DonutChart';

const STATE_MAPPING: Partial<
  Record<ResourceState, { label: string; color: string }>
> = {
  Creating: { label: translate('Creating'), color: '#009ef7' },
  OK: { label: translate('OK'), color: '#50cd89' },
  Erred: { label: translate('Erred'), color: '#f1416c' },
  Updating: { label: translate('Updating'), color: '#ffc700' },
  Terminating: { label: translate('Terminating'), color: '#7e8299' },
  Terminated: { label: translate('Terminated'), color: '#7e8299' },
};

interface ResourcesByStateChartProps {
  byState: Record<string, number>;
}

export const ResourcesByStateChart: FC<ResourcesByStateChartProps> = ({
  byState,
}) => {
  const chartData = useMemo(() => {
    return Object.entries(byState || {})
      .filter(([, value]) => value > 0)
      .map(([state, value]) => {
        const mapping = STATE_MAPPING[state] || {
          label: state,
          color: '#7e8299',
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
        STATE_MAPPING[state]?.label || state,
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
