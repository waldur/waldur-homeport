import { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface DonutChartItem {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

interface DonutChartProps {
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
export const DonutChart = React.forwardRef<any, DonutChartProps>(
  ({ data, height = '300px', showTotal = true }, ref) => {
    const total = useMemo(
      () => data.reduce((sum, item) => sum + item.value, 0),
      [data],
    );

    const chartData = useMemo(() => prepareChartData(data), [data]);

    const palette = useMemo(
      () => [
        '#97bf89', // primary-300
        '#84caff', // blue-300
        '#5fe9d0', // teal-300
        '#bdb4fe', // info-300
        '#faa7e0', // pink-300
        '#a4bcfd', // indigo-300
        '#acdc79', // moss-300
        '#fea3b4', // rose-300
      ],
      [],
    );

    const options = useMemo<EChartsOption>(
      () => ({
        color: palette,
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

    return <EChart ref={ref} options={options} height={height} />;
  },
);
