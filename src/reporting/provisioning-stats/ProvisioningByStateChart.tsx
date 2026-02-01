import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

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

const STATE_LABELS: { [key: string]: string } = {
  done: translate('Done'),
  erred: translate('Erred'),
  canceled: translate('Canceled'),
  rejected: translate('Rejected'),
  pending: translate('Pending'),
  executing: translate('Executing'),
};

export const ProvisioningByStateChart: FC<ProvisioningByStateChartProps> = ({
  byState,
}) => {
  const chartData = useMemo(() => {
    return Object.entries(byState)
      .filter(([, count]) => count > 0)
      .map(([state, count]) => ({
        name: STATE_LABELS[state] || state,
        value: count,
        itemStyle: { color: STATE_COLORS[state] || '#a1a5b7' },
      }));
  }, [byState]);

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData],
  );

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percent =
            total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
          return `${params.name}: ${params.value.toLocaleString()} (${percent}%)`;
        },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        type: 'scroll',
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () =>
              `{total|${total.toLocaleString()}}\n{label|${translate('Total')}}`,
            rich: {
              total: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#181C32',
                lineHeight: 32,
              },
              label: {
                fontSize: 12,
                color: '#A1A5B7',
                lineHeight: 20,
              },
            },
          },
          emphasis: {
            label: { show: true },
          },
          labelLine: { show: false },
          data: chartData,
        },
      ],
    }),
    [chartData, total],
  );

  if (chartData.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title>{translate('Orders by state')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <NoResult
            title={translate('No data available')}
            message={translate('Try adjusting your filters or date range.')}
          />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Orders by state')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height="300px" />
      </Card.Body>
    </Card>
  );
};
