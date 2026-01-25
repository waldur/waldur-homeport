import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface DonutChartItem {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

interface DonutChartProps {
  title: string;
  data: DonutChartItem[];
  height?: string;
  showTotal?: boolean;
}

/**
 * Group small categories into "Other" if there are more than 8 items
 * Preserves itemStyle for top items
 */
function prepareChartData(data: DonutChartItem[]): DonutChartItem[] {
  if (data.length <= 8) {
    return data;
  }

  // Sort by value descending
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top7 = sorted.slice(0, 7);
  const rest = sorted.slice(7);

  const otherValue = rest.reduce((sum, item) => sum + item.value, 0);

  return [...top7, { name: translate('Other'), value: otherValue }];
}

/**
 * Reusable donut chart component with centered total
 */
export const DonutChart: FC<DonutChartProps> = ({
  title,
  data,
  height = '300px',
  showTotal = true,
}) => {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  const chartData = useMemo(() => prepareChartData(data), [data]);

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percent = ((params.value / total) * 100).toFixed(1);
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
          label: showTotal
            ? {
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
              }
            : { show: false },
          emphasis: {
            label: {
              show: true,
            },
          },
          labelLine: {
            show: false,
          },
          data: chartData,
        },
      ],
    }),
    [chartData, total, showTotal],
  );

  if (data.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted">
          {translate('No data available')}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height={height} />
      </Card.Body>
    </Card>
  );
};
