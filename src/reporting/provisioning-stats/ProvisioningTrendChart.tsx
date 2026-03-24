import { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';
import { DailyOrderStats } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface ProvisioningTrendChartProps {
  daily: DailyOrderStats[];
}

export const ProvisioningTrendChart = React.forwardRef<
  any,
  ProvisioningTrendChartProps
>(({ daily }, ref) => {
  const chartData = useMemo(() => {
    // Calculate daily success rate using by_state
    return daily.map((day) => {
      const done = day.by_state?.done || 0;
      const erred = day.by_state?.erred || 0;
      const completed = done + erred;
      const successRate =
        completed > 0 ? Math.round((done / completed) * 100) : 100;
      return {
        date: day.date,
        successRate,
        total: day.total,
        done,
        erred,
      };
    });
  }, [daily]);

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          const data = chartData[param.dataIndex];
          return `
            <div>${data.date}</div>
            <div>${translate('Success rate')}: ${data.successRate}%</div>
            <div>${translate('Done')}: ${data.done}</div>
            <div>${translate('Erred')}: ${data.erred}</div>
            <div>${translate('Total')}: ${data.total}</div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map((d) => d.date),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          type: 'line',
          data: chartData.map((d) => d.successRate),
          smooth: true,
          areaStyle: {
            opacity: 0.3,
          },
          itemStyle: {
            color: '#50cd89',
          },
          lineStyle: {
            width: 2,
          },
          markLine: {
            silent: true,
            data: [
              {
                yAxis: 95,
                lineStyle: { color: '#50cd89', type: 'dashed' },
                label: { formatter: '95%' },
              },
              {
                yAxis: 80,
                lineStyle: { color: '#ffc700', type: 'dashed' },
                label: { formatter: '80%' },
              },
            ],
          },
        },
      ],
    }),
    [chartData],
  );

  return <EChart ref={ref} options={options} height="300px" />;
});
