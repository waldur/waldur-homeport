import { FC, useMemo } from 'react';
import { OrderState } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { DonutChart } from '@waldur/reporting/users/charts/DonutChart';
import { ExportData } from '@waldur/table/exporters/types';

interface ProvisioningByStateChartProps {
  byState: { [key: string]: number };
}

const STATE_COLORS: { [key: string]: string } = {
  done: '#50cd89',
  erred: '#f1416c',
  canceled: '#a1a5b7',
  rejected: '#ffa800',
  pending: '#ffc700',
  executing: '#009ef7',
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
    return Object.entries(byState)
      .filter(([, count]) => (count as number) > 0)
      .map(([state, count]) => ({
        name: STATE_LABELS[state] || state,
        value: count as number,
        itemStyle: { color: STATE_COLORS[state] || '#a1a5b7' },
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
