import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { UserOrganizationCount } from '../types';

interface OrganizationsChartProps {
  data: UserOrganizationCount[];
}

/**
 * Prepare data for horizontal bar chart (top 10, rest as "Other")
 */
function prepareChartData(data: UserOrganizationCount[]): {
  names: string[];
  values: number[];
  total: number;
} {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return { names: [], values: [], total: 0 };
  }

  // Sort by count descending
  const sorted = [...data].sort((a, b) => b.count - a.count);

  let items: Array<{ name: string; value: number }>;

  if (sorted.length <= 10) {
    items = sorted.map((item) => ({
      name: item.organization || translate('Unknown'),
      value: item.count,
    }));
  } else {
    const top9 = sorted.slice(0, 9);
    const rest = sorted.slice(9);
    const otherCount = rest.reduce((sum, item) => sum + item.count, 0);

    items = [
      ...top9.map((item) => ({
        name: item.organization || translate('Unknown'),
        value: item.count,
      })),
      { name: translate('Other'), value: otherCount },
    ];
  }

  // Reverse for horizontal bar (first item at top)
  const reversed = [...items].reverse();

  return {
    names: reversed.map((item) => item.name),
    values: reversed.map((item) => item.value),
    total,
  };
}

export const OrganizationsChart: FC<OrganizationsChartProps> = ({ data }) => {
  const { names, values, total } = useMemo(
    () => prepareChartData(data),
    [data],
  );

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0];
          const percent =
            total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
          return `${param.name}: ${param.value.toLocaleString()} (${percent}%)`;
        },
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          width: 150,
          overflow: 'truncate',
          ellipsis: '...',
        },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const percent =
                total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
              return `${percent}%`;
            },
          },
        },
      ],
    }),
    [names, values, total],
  );

  if (data.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title>{translate('User organizations')}</Card.Title>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted">
          {translate('No data available')}
        </Card.Body>
      </Card>
    );
  }

  // Calculate height based on number of items (min 200px, max 400px)
  const chartHeight = Math.min(400, Math.max(200, names.length * 35));

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('User organizations')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height={`${chartHeight}px`} />
      </Card.Body>
    </Card>
  );
};
