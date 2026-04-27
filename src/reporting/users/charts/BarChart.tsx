import { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';

import { EChart } from '@/core/EChart';
import { getChartBrandColor } from '@/dashboard/constants';

export interface BarChartItem {
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
  showValueLabel?: boolean;
  labelFormatter?: (params: any) => string;
  tooltipFormatter?: (params: any) => string;
  valueFormatter?: (value: number) => string;
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
      color = getChartBrandColor(),
      isSorted = true,
      showValueLabel = false,
      labelFormatter,
      tooltipFormatter,
      valueFormatter,
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
          formatter: tooltipFormatter,
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '5%',
          containLabel: true,
        },
        xAxis: horizontal
          ? {
              type: 'value',
              axisLabel: {
                formatter:
                  valueFormatter || ((value: number) => value.toLocaleString()),
              },
            }
          : {
              type: 'category',
              data: categories,
              axisLabel: {
                interval: 0,
                rotate: categories.length > 5 ? 45 : 0,
              },
            },
        yAxis: horizontal
          ? {
              type: 'category',
              data: categories,
              inverse: true,
              axisLabel: {
                width: 150,
                overflow: 'truncate',
                ellipsis: '...',
              },
            }
          : {
              type: 'value',
              axisLabel: {
                formatter:
                  valueFormatter || ((value: number) => value.toLocaleString()),
              },
            },
        series: [
          {
            data: values,
            type: 'bar',
            itemStyle: {
              color,
              borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
            },
            barMaxWidth: 40,
            label: {
              show: showValueLabel,
              position: horizontal ? 'right' : 'top',
              formatter: labelFormatter,
            },
          },
        ],
      }),
      [
        categories,
        values,
        horizontal,
        color,
        showValueLabel,
        labelFormatter,
        tooltipFormatter,
        valueFormatter,
      ],
    );

    return <EChart ref={ref} options={options} height={height} />;
  },
);
