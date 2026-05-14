import { EChartsOption } from 'echarts';
import React, { useMemo } from 'react';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

interface DonutChartItem {
  name: string;
  value: number;
  itemStyle?: { color: string };
  children?: { name: string; value: number }[];
}

interface DonutChartProps {
  data: DonutChartItem[];
  height?: string;
  showTotal?: boolean;
}

const MAX_OTHER_TOOLTIP_ROWS = 20;

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );
}

/**
 * Group small categories into "Other" if there are more than 8 items
 * Preserves itemStyle for top items, and keeps the bucketed rows on the
 * Other slice as `children` so the tooltip can list them.
 */
function prepareChartData(data: DonutChartItem[]): DonutChartItem[] {
  if (data.length <= 8) {
    return data;
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top7 = sorted.slice(0, 7);
  const rest = sorted.slice(7);

  const otherValue = rest.reduce((sum, item) => sum + item.value, 0);

  return [
    ...top7,
    {
      name: translate('Other'),
      value: otherValue,
      children: rest.map((item) => ({ name: item.name, value: item.value })),
    },
  ];
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
          enterable: true,
          extraCssText:
            'max-width: 320px; max-height: 320px; overflow: auto; pointer-events: auto;',
          formatter: (params: any) => {
            const percent = ((params.value / total) * 100).toFixed(1);
            const header = `<div style="font-weight:600; margin-bottom:4px;">${escapeHtml(
              params.name,
            )}: ${params.value.toLocaleString()} (${percent}%)</div>`;

            const children: { name: string; value: number }[] =
              params.data?.children ?? [];
            if (children.length === 0) {
              return header;
            }

            const visible = children.slice(0, MAX_OTHER_TOOLTIP_ROWS);
            const remaining = children.length - visible.length;

            const rows = visible
              .map((item) => {
                const itemPercent =
                  total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                return `<tr>
                    <td style="padding:2px 8px 2px 0; white-space:nowrap; max-width:200px; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(
                      item.name,
                    )}</td>
                    <td style="padding:2px 0; text-align:right; font-variant-numeric: tabular-nums;">${item.value.toLocaleString()}</td>
                    <td style="padding:2px 0 2px 8px; text-align:right; color:#A1A5B7; font-variant-numeric: tabular-nums;">${itemPercent}%</td>
                  </tr>`;
              })
              .join('');

            const footer =
              remaining > 0
                ? `<div style="margin-top:4px; color:#A1A5B7; font-size:11px;">${escapeHtml(
                    translate('… and {count} more', { count: remaining }),
                  )}</div>`
                : '';

            return `${header}<table style="border-collapse:collapse; font-size:12px;">${rows}</table>${footer}`;
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
