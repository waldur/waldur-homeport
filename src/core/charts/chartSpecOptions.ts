import type { EChartsOption } from 'echarts';
import type {
  ChartAnnotation,
  ChartAxis,
  ChartSeries,
  ChartSpec,
} from 'waldur-js-client';

import { escapeHtml } from '@/core/utils';
import { getChartThemeColors } from '@/dashboard/chartColors';

/**
 * ECharts options for a backend chart spec (waldur_mastermind.chat.chart_spec).
 *
 * The spec carries data and a chart kind only; every styling decision is made
 * here, so charts look the same in the assistant and on resource pages and a
 * spec can never inject formatters or markup.
 */

type Tone = NonNullable<ChartSeries['tone']>;
type Point = Array<number | string | null>;

// The theme's status hues, read when a chart is drawn so they follow it.
const toneColor = (tone?: Tone | null): string | undefined => {
  if (!tone) return undefined;
  const colors = getChartThemeColors();
  const byTone: Record<Tone, string> = {
    info: colors.info,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    neutral: colors.neutralStrong,
  };
  return byTone[tone] || undefined;
};

export const chartSpecHasData = (spec: ChartSpec): boolean =>
  spec.series.some((series) => series.points.length > 0);

/** A comfortable height for the chart's kind and number of rows. */
export const chartSpecHeight = (spec: ChartSpec): number => {
  const rows = spec.y.categories?.length ?? 0;
  if (spec.chart_type === 'timeline') {
    return Math.min(Math.max(rows * 24 + 70, 160), 720);
  }
  if (spec.chart_type === 'heatmap') {
    return Math.max(rows * 30 + 100, 160);
  }
  return 280;
};

const compact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${+(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${+(value / 1e3).toFixed(1)}k`;
  return `${+value.toFixed(2)}`;
};

const axisName = (axis: ChartAxis) =>
  [axis.label, axis.unit && `(${axis.unit})`].filter(Boolean).join(' ');

const buildAxis = (axis: ChartAxis, isX: boolean) => {
  const category = axis.type === 'category';
  const common = {
    name: axisName(axis) || undefined,
    // A value axis name runs along the axis, clear of the plot and labels.
    nameLocation: isX || !category ? ('middle' as const) : ('end' as const),
    nameGap: isX ? 28 : 44,
    nameRotate: isX || category ? undefined : 90,
    min: axis.min ?? undefined,
    max: axis.max ?? undefined,
  };
  if (axis.type === 'category') {
    return {
      ...common,
      type: 'category' as const,
      data: axis.categories ?? [],
      inverse: !isX,
      axisTick: { show: false },
      axisLabel: { hideOverlap: true },
    };
  }
  if (axis.type === 'time') {
    return { ...common, type: 'time' as const, splitLine: { show: !isX } };
  }
  return {
    ...common,
    type: axis.type === 'log' ? ('log' as const) : ('value' as const),
    // Without a stated minimum, fit the data (energies far from zero).
    scale: axis.min === null || axis.min === undefined,
    axisLabel: { formatter: (value: number) => compact(value) },
  };
};

const formatValue = (value: unknown, axis: ChartAxis): string => {
  if (value === null || value === undefined) return '–';
  if (axis.type === 'time' && typeof value === 'number') {
    return new Date(value).toLocaleString();
  }
  if (axis.type === 'category' && typeof value === 'number') {
    return axis.categories?.[value] ?? String(value);
  }
  if (typeof value === 'number') {
    return `${compact(value)}${axis.unit ? ` ${axis.unit}` : ''}`;
  }
  return String(value);
};

const lineType = (style?: ChartSeries['style']) =>
  style === 'dashed' ? 'dashed' : style === 'dotted' ? 'dotted' : 'solid';

/** Points rendered as reference lines inside point-based charts. */
const isReferenceLine = (series: ChartSeries) =>
  series.style === 'dashed' || series.style === 'dotted';

const timelineItem = (params, api) => {
  const row = api.value(0);
  const start = api.coord([api.value(1), row]);
  const end = api.coord([api.value(2), row]);
  const limitValue = api.value(3);
  const height = Math.max(api.size([0, 1])[1] * 0.6, 4);
  const color = api.visual('color');
  const y = start[1] - height / 2;
  const children: any[] = [];
  if (limitValue) {
    const limit = api.coord([limitValue, row]);
    if (limit[0] > end[0]) {
      children.push({
        type: 'rect',
        shape: { x: end[0], y, width: limit[0] - end[0], height },
        style: { fill: color, opacity: 0.18 },
      });
    }
  }
  children.push({
    type: 'rect',
    shape: { x: start[0], y, width: Math.max(end[0] - start[0], 2), height },
    style: { fill: color },
  });
  return { type: 'group', children };
};

const buildSeries = (spec: ChartSpec, series: ChartSeries, index: number) => {
  const color = toneColor(series.tone);
  const data = series.points as Point[];
  const base = {
    name: series.name,
    color,
    emphasis: { focus: 'series' as const },
  };
  switch (spec.chart_type) {
    case 'bar':
    case 'stacked_bar':
      return {
        ...base,
        type: 'bar' as const,
        data,
        stack: spec.chart_type === 'stacked_bar' ? 'total' : undefined,
        barMaxWidth: 36,
      };
    case 'scatter':
      if (isReferenceLine(series)) {
        return {
          ...base,
          type: 'line' as const,
          data,
          showSymbol: false,
          silent: true,
          lineStyle: { type: lineType(series.style), width: 1 },
        };
      }
      return {
        ...base,
        type: 'scatter' as const,
        data,
        symbolSize: 9,
        itemStyle: { opacity: 0.8 },
      };
    case 'heatmap':
      return {
        ...base,
        type: 'heatmap' as const,
        // A toned series is a set of flagged cells drawn in one colour.
        data: series.tone ? data.map(([x, y]) => [x, y, 0]) : data,
        itemStyle: {
          borderColor: 'transparent',
          borderWidth: 3,
          borderRadius: 3,
          ...(color ? { color } : {}),
        },
      };
    case 'timeline':
      return {
        ...base,
        type: 'custom' as const,
        renderItem: timelineItem,
        encode: { x: [1, 2], y: 0 },
        data,
      };
    default: {
      const solidArea =
        spec.chart_type === 'area' && !isReferenceLine(series) && index === 0;
      return {
        ...base,
        type: 'line' as const,
        data,
        yAxisIndex: series.y_axis === 'secondary' && spec.y2 ? 1 : 0,
        showSymbol: data.length <= 24,
        symbolSize: 5,
        lineStyle: { type: lineType(series.style), width: 2 },
        areaStyle: solidArea ? { opacity: 0.12 } : undefined,
      };
    }
  }
};

const markers = (annotations: ChartAnnotation[]) => {
  const lines = annotations
    .filter((a) => a.type === 'line_x' || a.type === 'line_y')
    .map((a) => ({
      [a.type === 'line_x' ? 'xAxis' : 'yAxis']: a.value,
      label: {
        formatter: a.label || '',
        position: a.type === 'line_x' ? 'insideEndTop' : 'insideStartTop',
        color: toneColor(a.tone),
        fontSize: 11,
      },
      lineStyle: {
        color: toneColor(a.tone),
        type: a.tone === 'neutral' ? 'dotted' : 'solid',
      },
    }));
  const areas = annotations
    .filter((a) => a.type === 'area_x' || a.type === 'area_y')
    .map((a) => {
      const key = a.type === 'area_x' ? 'xAxis' : 'yAxis';
      return [
        {
          [key]: a.value,
          name: a.label || '',
          itemStyle: { color: toneColor(a.tone), opacity: 0.08 },
          label: { color: toneColor(a.tone), fontSize: 11 },
        },
        { [key]: a.value_end ?? undefined },
      ];
    });
  return {
    markLine: lines.length
      ? { symbol: ['none', 'none'], silent: true, data: lines }
      : undefined,
    markArea: areas.length ? { silent: true, data: areas } : undefined,
  };
};

const tooltipFormatter = (spec: ChartSpec) => (params) => {
  const items = Array.isArray(params) ? params : [params];
  if (!items.length) return '';
  const rows = items.map((item) => {
    const series = spec.series[item.seriesIndex];
    const label = series?.labels?.[item.dataIndex];
    const marker = item.marker || '';
    if (label) return `${marker}${escapeHtml(label)}`;
    const point = (item.value ?? []) as Point;
    const shown = spec.chart_type === 'heatmap' ? point[2] : point[1];
    const axis = spec.chart_type === 'timeline' ? spec.x : spec.y;
    return `${marker}${escapeHtml(series?.name ?? '')}: ${escapeHtml(
      formatValue(shown, axis),
    )}`;
  });
  const first = items[0];
  const header =
    Array.isArray(params) && first?.value
      ? `${escapeHtml(formatValue((first.value as Point)[0], spec.x))}<br/>`
      : '';
  return header + rows.join('<br/>');
};

export const buildChartSpecOptions = (spec: ChartSpec): EChartsOption => {
  const axisTrigger = ['line', 'area', 'bar', 'stacked_bar'].includes(
    spec.chart_type,
  );
  const series = spec.series.map((item, index) =>
    buildSeries(spec, item, index),
  );
  const annotations = spec.annotations ?? [];
  if (annotations.length && series.length) {
    Object.assign(series[0], markers(annotations));
  }
  // Keep horizontal annotations (a limit, a forecast length) in view.
  const lineYs = annotations
    .filter((a) => a.type === 'line_y')
    .map((a) => a.value);
  const yMax =
    spec.y.max ??
    (lineYs.length
      ? (extent: { max: number }) => Math.max(extent.max, ...lineYs)
      : undefined);
  const heatmapRange = spec.series
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => spec.chart_type === 'heatmap' && !item.tone);
  const flagged = spec.series
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => spec.chart_type === 'heatmap' && item.tone);
  const heatmapValues = heatmapRange.flatMap(({ item }) =>
    (item.points as Point[]).map((point) => Number(point[2] ?? 0)),
  );

  return {
    animationDuration: 300,
    grid: {
      // Room for axis names, which containLabel does not count.
      left: spec.y.label && spec.y.type !== 'category' ? 40 : 8,
      right: spec.y2?.label ? 40 : 16,
      top: spec.series.length > 1 && spec.chart_type !== 'heatmap' ? 40 : 16,
      bottom: spec.chart_type === 'heatmap' ? 48 : spec.x.label ? 28 : 8,
      containLabel: true,
    },
    // A heatmap's colours come from its visual map, not from series colours.
    legend:
      spec.series.length > 1 && spec.chart_type !== 'heatmap'
        ? { top: 0, type: 'scroll', itemWidth: 14, itemHeight: 8 }
        : undefined,
    tooltip: {
      trigger: axisTrigger ? 'axis' : 'item',
      confine: true,
      formatter: tooltipFormatter(spec),
    },
    xAxis: buildAxis(spec.x, true),
    yAxis: spec.y2
      ? [
          { ...buildAxis(spec.y, false), max: yMax },
          { ...buildAxis(spec.y2, false), splitLine: { show: false } },
        ]
      : { ...buildAxis(spec.y, false), max: yMax },
    visualMap: [
      ...(heatmapRange.length
        ? [
            {
              type: 'continuous' as const,
              seriesIndex: heatmapRange.map(({ index }) => index),
              min: 0,
              max: Math.max(100, ...heatmapValues),
              orient: 'horizontal' as const,
              left: 'center',
              bottom: 0,
              itemHeight: 140,
              itemWidth: 10,
              calculable: false,
              text: ['100%', '0%'],
              inRange: {
                color: [
                  toneColor('neutral'),
                  toneColor('success'),
                  toneColor('warning'),
                ],
              },
            },
          ]
        : []),
      // ECharts draws a heatmap only through a visual map, so each toned
      // series (flagged cells) gets a hidden one with its single colour.
      ...flagged.map(({ item, index }) => ({
        type: 'piecewise' as const,
        show: false,
        seriesIndex: index,
        pieces: [{ value: 0, color: toneColor(item.tone) }],
      })),
    ],
    series: series as EChartsOption['series'],
  };
};
