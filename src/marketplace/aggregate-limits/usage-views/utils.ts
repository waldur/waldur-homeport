import { useMemo } from 'react';
import { ComponentsUsageStatsPerOffering } from 'waldur-js-client';

import { generateBrandColors } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { CHART_BAR_ROUNDING } from '@/dashboard/constants';
import { translate } from '@/i18n';
import { numberFormatter } from '@/i18n/LanguageUtilsService';

import { TERMINATED_SERIES_NAME, splitUsage } from '../utils';

interface ChartResult {
  options: any;
}

export function useAggregateLimitChart(
  data: ComponentsUsageStatsPerOffering | undefined,
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

    // X-axis label uses offering name only — the component name is conveyed
    // by the chart title (and by the tooltip on hover). Keeps labels short
    // so they don't need rotation when there are several offerings.
    const xAxisData = components.map((component) => component.offering_name);

    const usageData = [];
    const terminatedData = [];
    const remainingData = [];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];

      const { live: usageValue, terminated } = splitUsage(component);

      usageData.push({
        value: usageValue,
        rawValue: usageValue,
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

      if (component.limit != null) {
        const remainingValue = Math.max(0, component.limit - usageValue);
        remainingData.push({
          value: remainingValue,
          rawValue: remainingValue,
          tooltipLabel: `${translate('Limit')}: ${remainingValue} ${component.measured_unit}`,
          componentType: component.type,
          measured_unit: component.measured_unit,
        });
      } else {
        remainingData.push({
          value: null,
          rawValue: 0,
          componentType: component.type,
          measured_unit: component.measured_unit,
        });
      }
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
            color: '#667085',
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

          let tooltip = `${component.name} · ${component.offering_name}<br/>`;
          tooltip += `<small>${billingTypeLabel}`;
          if (component.current_period_label) {
            tooltip += ` · ${component.current_period_label}`;
          }
          tooltip += `</small><br/>`;
          tooltip += `${usageBar.marker} ${usageName}: ${numberFormatter.format(usageValue || 0)} ${component.measured_unit}<br/>`;

          const terminatedBar = bySeries(terminatedName);
          if (terminatedBar?.data?.rawValue > 0) {
            tooltip += `${terminatedBar.marker} ${terminatedName}: ${numberFormatter.format(terminatedBar.data.rawValue)} ${component.measured_unit}<br/>`;
          }

          const limitBar = bySeries(limitName);
          if (component.limit != null && limitBar) {
            tooltip += `${limitBar.marker} ${limitName}: ${numberFormatter.format(component.limit)} ${component.measured_unit}`;
            if (component.limit > 0) {
              const pct = Math.round(
                ((usageValue || 0) / component.limit) * 100,
              );
              tooltip += ` <small>(${pct}%)</small>`;
            }
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
          color: '#667085',
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
        type: 'value',
        axisLabel: {
          formatter: function (value) {
            if (value >= 1000000) return value / 1000000 + 'M';
            if (value >= 1000) return value / 1000 + 'k';
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
          color: brandColors[100],
        },
      ],
    };
    return options;
  }, [data, limit]);
  return { options };
}
