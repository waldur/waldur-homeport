import { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { getBrandColor } from '@waldur/core/utils';

interface BarChartItem {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  height?: string;
  horizontal?: boolean;
  color?: string;
  isSorted?: boolean;
}

/**
 * Reusable bar chart component
 */
export const BarChart = React.forwardRef<any, BarChartProps>(
  (
    {
      data,
      height = '300px',
      horizontal = false,
      color = getBrandColor(),
      isSorted = true,
    },
    ref,
  ) => {
    const sortedData = useMemo(
      () => (isSorted ? [...data].sort((a, b) => b.value - a.value) : data),
      [data, isSorted],
    );

    const categories = useMemo(
      () => sortedData.map((item) => item.name),
      [sortedData],
    );
    const values = useMemo(
      () =>
        sortedData.map((item) => ({
          value: item.value,
          itemStyle: item.color ? { color: item.color } : undefined,
        })),
      [sortedData],
    );

    const options = useMemo<EChartsOption>(
      () => ({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '5%',
          containLabel: true,
        },
        xAxis: horizontal
          ? { type: 'value' }
          : {
              type: 'category',
              data: categories,
              axisLabel: {
                interval: 0,
                rotate: categories.length > 1 ? 45 : 0,
              },
            },
        yAxis: horizontal
          ? {
              type: 'category',
              data: categories,
            }
          : { type: 'value' },
        series: [
          {
            data: values,
            type: 'bar',
            itemStyle: {
              color,
              borderRadius: [4, 4, 0, 0],
            },
            barMaxWidth: 40,
          },
        ],
      }),
      [categories, values, horizontal, color],
    );

    return <EChart ref={ref} options={options} height={height} />;
  },
);
