import { useMemo } from 'react';
import { ComponentsUsageStatsPerOffering } from 'waldur-js-client';

import { generateBrandColors } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { CHART_BAR_ROUNDING } from '@/dashboard/constants';
import { translate } from '@/i18n';
import { numberFormatter } from '@/i18n/LanguageUtilsService';

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
    const remainingData = [];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];

      const rawUsageValue =
        component.billing_type === 'limit'
          ? component.limit_usage
          : component.usage;
      const usageValue = rawUsageValue || 0;

      usageData.push({
        value: usageValue,
        rawValue: usageValue,
        tooltipLabel: `${component.name} (${component.measured_unit})`,
        componentType: component.type,
        billingType: component.billing_type,
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

          let tooltip = `${component.name} · ${component.offering_name}<br/>`;
          tooltip += `<small>${billingTypeLabel}`;
          if (component.current_period_label) {
            tooltip += ` · ${component.current_period_label}`;
          }
          tooltip += `</small><br/>`;
          tooltip += `${params[0].marker} ${translate('Usage')}: ${numberFormatter.format(usageValue || 0)} ${component.measured_unit}<br/>`;

          if (component.limit != null) {
            tooltip += `${params[1].marker} ${translate('Limit')}: ${numberFormatter.format(component.limit)} ${component.measured_unit}`;
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
        data: [translate('Usage'), translate('Limit')],
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
          color: brandColors[100],
        },
      ],
    };
    return options;
  }, [data, limit]);
  return { options };
}
