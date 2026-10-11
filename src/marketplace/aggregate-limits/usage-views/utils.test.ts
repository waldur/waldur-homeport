import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAggregateLimitChart } from './utils';

vi.mock('@/core/utils', () => ({ getBrandColor: () => '#307300' }));
vi.mock('@/dashboard/chartColors', () => ({
  getChartThemeColors: () => ({ muted: '#667085' }),
}));

const row = (overrides = {}) => ({
  type: 'node',
  name: 'Compute',
  description: '',
  measured_unit: 'node hours',
  billing_type: 'limit',
  usage: 0,
  limit_usage: 140,
  usage_terminated: 0,
  limit_usage_terminated: 0,
  limit: 1000,
  offering_name: 'HPC',
  offering_uuid: 'abc',
  limit_period: 'quarterly',
  current_period_label: 'Q2 2026',
  current_period_start: '2026-04-01',
  current_period_end: '2026-06-30',
  ...overrides,
});

const chart = (components) =>
  renderHook(() => useAggregateLimitChart({ components } as any)).result.current
    .options;

describe('per-offering bars', () => {
  it('keeps two series when nothing is terminated', () => {
    const options = chart([row()]);
    expect(options.series.map((s) => s.name)).toEqual(['Usage', 'Limit']);
    expect(options.series[1].data[0].rawValue).toBe(860);
  });

  it('stacks terminated usage and leaves remaining capacity unchanged', () => {
    const options = chart([row({ limit_usage_terminated: 40 })]);
    const [usage, terminated, remaining] = options.series;
    expect(terminated.name).toBe('Terminated resources');
    expect(usage.data[0].rawValue).toBe(100);
    expect(terminated.data[0].value).toBe(40);
    expect(remaining.data[0].rawValue).toBe(900);
  });

  it('reports live usage as the percent of cap in the tooltip', () => {
    const options = chart([row({ limit_usage_terminated: 40 })]);
    const params = options.series.map((s) => ({
      seriesName: s.name,
      dataIndex: 0,
      marker: '',
      data: s.data[0],
    }));
    const tooltip = options.tooltip.formatter(params);
    expect(tooltip).toContain('(10%)');
    expect(tooltip).toContain('Terminated resources');
  });
});
