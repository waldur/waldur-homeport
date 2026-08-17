import { useMemo } from 'react';
import { ComponentsUsageStats } from 'waldur-js-client';

import { generateBrandColors } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { CHART_BAR_ROUNDING } from '@/dashboard/constants';
import { translate } from '@/i18n';

interface ChartResult {
  options: any;
}

type ComponentStats = ComponentsUsageStats['components'][number];

export function getComponentKey(component: ComponentStats): string {
  return `${component.type}__${component.billing_type}`;
}

export function getComponentDisplayName(
  component: ComponentStats,
  allComponents: ComponentStats[],
): string {
  const sameNameCount = allComponents.filter(
    (c) => c.name === component.name,
  ).length;
  if (sameNameCount > 1) {
    const suffix =
      component.billing_type === 'limit'
        ? translate('limit-based')
        : translate('usage-based');
    return `${component.name} (${suffix})`;
  }
  return component.name;
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

    const brand = getBrandColor();
    const brandColors = generateBrandColors(brand);

    const xAxisData = components.map((component) =>
      getComponentDisplayName(component, components),
    );

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
          const component = components[usageBar.dataIndex];

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
        top: 0,
        right: 0,
      },
      grid: {
        left: 35,
        right: '0%',
        bottom: limit ? '0%' : '5%',
        top: 40,
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
            // NOTE: There is a gap between the stacks due to borderRadius. There is currently no solution for this for now.
            borderRadius: [CHART_BAR_ROUNDING, CHART_BAR_ROUNDING, 0, 0],
          },
          data: usageData,
          color: brandColors[300],
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
          color: '#d0d5dd', // gray-300
        },
      ],
    };
    return options;
  }, [data, isMonthly, limit]);
  return { options };
}
