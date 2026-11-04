import { describe, expect, it } from 'vitest';
import type { ChartSpec } from 'waldur-js-client';

import {
  buildChartSpecOptions,
  chartSpecHasData,
  chartSpecHeight,
} from './chartSpecOptions';

const burn: ChartSpec = {
  chart_type: 'area',
  title: 'CPU against the allocation',
  x: { type: 'time' },
  y: { type: 'value', label: 'CPU-h', min: 0 },
  series: [
    {
      name: 'Used',
      tone: 'info',
      points: [
        [0, 0],
        [86400000, 100],
      ],
    },
    {
      name: 'Forecast',
      style: 'dashed',
      points: [
        [86400000, 100],
        [172800000, 500],
      ],
    },
  ],
  annotations: [
    { type: 'line_y', value: 450, label: 'Limit', tone: 'danger' },
    { type: 'area_x', value: 0, value_end: 40, label: 'Low', tone: 'warning' },
  ],
};

describe('buildChartSpecOptions', () => {
  it('draws the first series as an area with the annotations on it', () => {
    const options: any = buildChartSpecOptions(burn);
    expect(options.series[0].type).toBe('line');
    expect(options.series[0].areaStyle).toBeTruthy();
    expect(options.series[1].lineStyle.type).toBe('dashed');
    expect(options.series[1].areaStyle).toBeUndefined();
    expect(options.series[0].markLine.data[0].yAxis).toBe(450);
    expect(options.series[0].markArea.data[0][1].xAxis).toBe(40);
    expect(options.xAxis.type).toBe('time');
    expect(options.tooltip.trigger).toBe('axis');
  });

  it('stacks bars and keeps category labels', () => {
    const options: any = buildChartSpecOptions({
      chart_type: 'stacked_bar',
      title: 'Outcomes',
      x: { type: 'category', categories: ['a', 'b'] },
      y: { type: 'value' },
      series: [
        { name: 'ok', points: [[0, 1]] },
        { name: 'failed', points: [[0, 2]] },
      ],
    });
    expect(options.series.map((s) => s.stack)).toEqual(['total', 'total']);
    expect(options.xAxis.data).toEqual(['a', 'b']);
  });

  it('colours only untoned heatmap series through the visual map', () => {
    const spec: ChartSpec = {
      chart_type: 'heatmap',
      title: 'Nodes',
      x: { type: 'category', categories: ['1', '2'] },
      y: { type: 'category', categories: ['batch'] },
      series: [
        { name: 'CPU load', points: [[0, 0, 80]] },
        { name: 'Unavailable', tone: 'danger', points: [[1, 0, null]] },
      ],
    };
    const options: any = buildChartSpecOptions(spec);
    expect(options.visualMap[0].seriesIndex).toEqual([0]);
    expect(options.visualMap[1]).toMatchObject({ seriesIndex: 1, show: false });
    expect(options.series[1].data).toEqual([[1, 0, 0]]);
    expect(chartSpecHeight(spec)).toBe(160);
  });

  it('renders timelines with a custom series and escapes tooltip labels', () => {
    const spec: ChartSpec = {
      chart_type: 'timeline',
      title: 'Jobs',
      x: { type: 'time' },
      y: { type: 'category', categories: ['1 job'] },
      series: [
        {
          name: 'Done',
          points: [[0, 1, 2, 3]],
          labels: ['<b>x</b>'],
          ids: ['1'],
        },
      ],
    };
    const options: any = buildChartSpecOptions(spec);
    expect(options.series[0].type).toBe('custom');
    expect(options.tooltip.formatter({ seriesIndex: 0, dataIndex: 0 })).toBe(
      '&lt;b&gt;x&lt;/b&gt;',
    );
  });

  it('knows when there is nothing to draw', () => {
    expect(
      chartSpecHasData({ ...burn, series: [{ name: 'a', points: [] }] }),
    ).toBe(false);
  });

  it('puts a secondary series on a right-hand axis', () => {
    const options: any = buildChartSpecOptions({
      chart_type: 'line',
      title: 'Energies',
      x: { type: 'value', label: 'ps' },
      y: { type: 'value', label: 'Potential' },
      y2: { type: 'value', label: 'Temperature' },
      series: [
        { name: 'Potential', points: [[0, -500000]] },
        { name: 'Temperature', y_axis: 'secondary', points: [[0, 300]] },
      ],
    });
    expect(options.yAxis).toHaveLength(2);
    expect(options.series.map((s) => s.yAxisIndex)).toEqual([0, 1]);
    expect(options.yAxis[0].scale).toBe(true);
  });
});
