import { FC, useMemo } from 'react';
import { OrderState } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { DonutChart } from '@/reporting/users/charts/DonutChart';
import { ExportData } from '@/table/exporters/types';

interface ProvisioningByStateChartProps {
  byState: { [key: string]: number };
}

const getStateColors = (): { [key: string]: string } => {
  const tc = getChartThemeColors();
  return {
    done: tc.success,
    erred: tc.danger,
    canceled: tc.muted,
    rejected: tc.warning,
    // The pending states match the Orders report (reporting/orders/types.ts).
    pending: tc.notice,
    'pending-project': tc.notice,
    'pending-start-date': tc.notice,
    'pending-consumer': tc.notice,
    'pending-provider': tc.warning,
    executing: tc.progress,
  };
};

const STATE_LABELS: { [key in OrderState]: string } = {
  done: translate('Done'),
  erred: translate('Erred'),
  canceled: translate('Canceled'),
  rejected: translate('Rejected'),
  'pending-project': translate('Pending project'),
  'pending-start-date': translate('Pending start date'),
  'pending-consumer': translate('Pending consumer'),
  'pending-provider': translate('Pending provider'),
  executing: translate('Executing'),
};

const getByStateExportData = (byState: {
  [key: string]: number;
}): ExportData => ({
  fields: [translate('State'), translate('Count')],
  data: Object.entries(byState || {}).map(([state, count]) => [state, count]),
});

export const ProvisioningByStateChart: FC<ProvisioningByStateChartProps> = ({
  byState,
}) => {
  const chartData = useMemo(() => {
    const colors = getStateColors();
    return Object.entries(byState)
      .filter(([, count]) => (count as number) > 0)
      .map(([state, count]) => ({
        name: STATE_LABELS[state] || state,
        value: count as number,
        itemStyle: { color: colors[state] || colors.canceled },
      }));
  }, [byState]);

  const hasData = chartData.length > 0;

  return (
    <ChartCard
      title={translate('Orders by state')}
      getExportData={() => getByStateExportData(byState)}
      isEmpty={!hasData}
    >
      {(cardRef) => (
        <DonutChart ref={cardRef} data={chartData} height="300px" />
      )}
    </ChartCard>
  );
};
