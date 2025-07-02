import { useMemo } from 'react';
import { ComponentsUsageStats } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { DEFAULT_PRIMARY_COLORS } from '@waldur/core/constants';
import { generateBrandColors } from '@waldur/core/generateColors';
import { CHART_BAR_ROUNDING } from '@waldur/dashboard/constants';
import { translate } from '@waldur/i18n';

interface ChartResult {
  options: any;
}

export function useAggregateLimitChart(
  data: ComponentsUsageStats | undefined,
  isMonthly = false,
  limit = 0,
): ChartResult {
  const options = useMemo(() => {
    if (!data?.components?.length) {
      return null;
    }

    const components =
      limit !== 0 ? data.components.slice(0, limit) : data.components;

    if (!components.length) {
      return null;
    }

    const brand =
      ENV.plugins.WALDUR_CORE.BRAND_COLOR || DEFAULT_PRIMARY_COLORS[600];
    const brandColors = generateBrandColors(brand);

    const xAxisData = components.map((component) => component.name);

    const usageData = [];
    const remainingData = [];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];

      const rawUsageValue =
        component.billing_type === 'limit'
          ? component.limit_usage
          : component.usage;
      const usageValue = Math.max(rawUsageValue || 0, 0.1);

      usageData.push({
        value: usageValue,
        rawValue: rawUsageValue || 0,
        tooltipLabel: `${component.name} (${component.measured_unit})`,
        componentType: component.type,
        billingType: component.billing_type,
        measured_unit: component.measured_unit,
      });

      let remainingValue = 0.1;
      let rawRemainingValue = 0;

      if (component.limit != null) {
        rawRemainingValue = Math.max(0, component.limit - (rawUsageValue || 0));
        remainingValue = rawRemainingValue > 0 ? rawRemainingValue : 0.1;
      }

      remainingData.push({
        value: remainingValue,
        rawValue: rawRemainingValue,
        tooltipLabel: `${translate('Limit')}: ${rawRemainingValue} ${component.measured_unit}`,
        componentType: component.type,
        measured_unit: component.measured_unit,
      });
    }

    const options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          crossStyle: {
            color: '#999',
          },
        },
        formatter: function (params) {
          const usageBar = params[0];
          const compIndex = components.findIndex(
            (c) => c.name === usageBar.name,
          );
          const component = components[compIndex];

          if (!component) {
            return '';
          }
          const billingTypeLabel =
            component.billing_type === 'limit'
              ? translate('Limit-based')
              : translate('Usage-based');

          const usageValue = usageBar.data.rawValue;

          let tooltip = component.name;
          tooltip += component.measured_unit
            ? ` (${component.measured_unit})<br/>`
            : '<br/>';
          tooltip += `<small>${billingTypeLabel} </small><br/>`;
          tooltip += `${params[0].marker} ${translate('Usage')}: ${usageValue} ${component.measured_unit}<br/>`;

          if (component.limit != null) {
            tooltip += `${params[1].marker} ${translate('Limit')}: ${component.limit} ${component.measured_unit}`;
          }
          return tooltip;
        },
      },
      legend: {
        data: [translate('Usage'), translate('Limit')],
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 12,
          color: '#555',
        },
        itemGap: 8,
        left: '0%',
        align: 'left',
      },
      grid: {
        left: 35,
        right: '0%',
        bottom: limit ? '0%' : '5%',
        top: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          overflow: 'break',
          width: 80,
        },
      },
      yAxis: {
        type: 'log',
        name: translate('Usage'),
        nameGap: 45,
        nameLocation: 'middle',
        nameRotate: 90,
        min: 1,
        max: 10000000,
        logBase: 100,
        axisLabel: {
          formatter: function (value) {
            if (value >= 1000000) return value / 1000000 + 'M';
            if (value >= 1000) return value / 1000 + 'K';
            return value;
          },
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            opacity: 0.6,
          },
        },
      },
      dataZoom:
        components.length > 15
          ? [
              {
                type: 'slider',
                realtime: true,
                xAxisIndex: [0],
                bottom: 5,
                height: limit ? 10 : 20,
                start: 0,
                end: 50,
              },
              {
                type: 'inside',
                xAxisIndex: [0],
                start: 0,
                end: 50,
              },
            ]
          : [],
      series: [
        {
          name: translate('Usage'),
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series',
          },
          itemStyle: {
            borderRadius: [CHART_BAR_ROUNDING, CHART_BAR_ROUNDING, 0, 0],
          },
          data: usageData,
          color: brandColors[500],
        },
        {
          name: translate('Limit'),
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series',
          },
          itemStyle: {
            borderRadius: [CHART_BAR_ROUNDING, CHART_BAR_ROUNDING, 0, 0],
          },
          data: remainingData,
          color: brandColors[200],
        },
      ],
    };
    return options;
  }, [data, isMonthly, limit]);
  return { options };
}
