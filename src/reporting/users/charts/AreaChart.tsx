import { EChartsOption, graphic } from 'echarts';
import React, { useMemo } from 'react';

import { EChart } from '@/core/EChart';
import { generateBrandColors, hexToRgb } from '@/core/generateColors';
import { getChartBrandColor } from '@/dashboard/constants';

interface AreaChartItem {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartItem[];
  height?: string;
  color?: string;
  showPoints?: boolean;
}

/**
 * Reusable area chart component with smoothed line and gradient fill
 */
export const AreaChart = React.forwardRef<any, AreaChartProps>(
  (
    {
      data,
      height = '300px',
      color = getChartBrandColor(),
      showPoints = false,
    },
    ref,
  ) => {
    const categories = useMemo(() => data.map((item) => item.name), [data]);
    const values = useMemo(() => data.map((item) => item.value), [data]);

    const options = useMemo<EChartsOption>(
      () => ({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              width: 1,
            },
          },
        },
        grid: {
          left: '3%',
          right: 0,
          bottom: '3%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories,
          axisLabel: {
            interval: 'auto',
            rotate: categories.length > 10 ? 45 : 0,
          },
        },
        yAxis: {
          type: 'value',
          // Every series here is a count, so fractional ticks are meaningless.
          minInterval: 1,
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        series: [
          {
            data: values,
            type: 'line',
            smooth: true,
            // A single point draws no line segment, so it needs a symbol.
            showSymbol: showPoints || values.length === 1,
            symbolSize: 8,
            itemStyle: {
              color: color,
            },
            lineStyle: {
              width: 1,
              color: color,
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: generateBrandColors(color)['200'],
                },
                {
                  offset: 1,
                  color: `rgba(${hexToRgb(color)}, 0)`,
                },
              ]),
              opacity: 0.6,
            },
          },
        ],
      }),
      [categories, values, color, showPoints],
    );

    return <EChart ref={ref} options={options} height={height} />;
  },
);
