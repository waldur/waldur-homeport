import { useMemo } from 'react';
import { ComponentsUsageStats } from 'waldur-js-client';

import { generateBrandColors } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { CHART_BAR_ROUNDING } from '@/dashboard/constants';
import { translate } from '@/i18n';

interface ChartResult {
  options: any;
}

type ComponentStats = ComponentsUsageStats['components'][number];

export function getComponentKey(component: ComponentStats): string {
  return `${component.type}__${component.billing_type}`;
}

interface UsageFields {
  billing_type?: string;
  usage?: number;
  limit_usage?: number;
  usage_terminated?: number;
  limit_usage_terminated?: number;
}

/**
 * Split a component's usage into what live resources used and what came from
 * terminated ones. The cap only covers live resources, so remaining capacity
 * and percent of cap are computed from `live`.
 */
export function splitUsage(component: UsageFields): {
  live: number;
  terminated: number;
} {
  const isLimit = component.billing_type === 'limit';
  const total = (isLimit ? component.limit_usage : component.usage) || 0;
  const terminated =
    (isLimit ? component.limit_usage_terminated : component.usage_terminated) ||
    0;
  return { live: Math.max(0, total - terminated), terminated };
}

export const TERMINATED_SERIES_NAME = () => translate('Terminated resources');

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
    const terminatedData = [];
    const remainingData = [];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];

      const { live, terminated } = splitUsage(component);
      const rawUsageValue = live;
      const usageValue = Math.max(rawUsageValue, 0.1);

      usageData.push({
        value: usageValue,
        rawValue: rawUsageValue,
        tooltipLabel: `${component.name} (${component.measured_unit})`,
        componentType: component.type,
        billingType: component.billing_type,
        measured_unit: component.measured_unit,
      });

      terminatedData.push({
        value: terminated > 0 ? terminated : null,
        rawValue: terminated,
        componentType: component.type,
        measured_unit: component.measured_unit,
      });

      let remainingValue = 0.1;
      let rawRemainingValue = 0;

      if (component.limit != null) {
        rawRemainingValue = Math.max(0, component.limit - rawUsageValue);
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

    const hasTerminated = terminatedData.some((d) => d.rawValue > 0);
    const usageName = translate('Usage');
    const limitName = translate('Limit');
    const terminatedName = TERMINATED_SERIES_NAME();

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
          const bySeries = (name) => params.find((p) => p.seriesName === name);
          const usageBar = bySeries(usageName) ?? params[0];
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
          tooltip += `${usageBar.marker} ${usageName}: ${usageValue} ${component.measured_unit}<br/>`;

          const terminatedBar = bySeries(terminatedName);
          if (terminatedBar?.data?.rawValue > 0) {
            tooltip += `${terminatedBar.marker} ${terminatedName}: ${terminatedBar.data.rawValue} ${component.measured_unit}<br/>`;
          }

          const limitBar = bySeries(limitName);
          if (component.limit != null && limitBar) {
            tooltip += `${limitBar.marker} ${limitName}: ${component.limit} ${component.measured_unit}`;
          }
          return tooltip;
        },
      },
      legend: {
        data: hasTerminated
          ? [usageName, terminatedName, limitName]
          : [usageName, limitName],
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
          name: usageName,
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
        ...(hasTerminated
          ? [
              {
                name: terminatedName,
                type: 'bar',
                stack: 'total',
                emphasis: {
                  focus: 'series',
                },
                itemStyle: {
                  borderRadius: [CHART_BAR_ROUNDING, CHART_BAR_ROUNDING, 0, 0],
                },
                data: terminatedData,
                color: getChartThemeColors().muted,
              },
            ]
          : []),
        {
          name: limitName,
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
