import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { splitUsage, useAggregateLimitChart } from './utils';

vi.mock('@/core/utils', () => ({ getBrandColor: () => '#307300' }));
vi.mock('@/dashboard/chartColors', () => ({
  getChartThemeColors: () => ({ muted: '#667085' }),
}));

const component = (overrides = {}) => ({
  type: 'cpu',
  name: 'CPU',
  description: '',
  measured_unit: 'vCPU',
  billing_type: 'usage',
  usage: 7,
  limit_usage: 0,
  usage_terminated: 0,
  limit_usage_terminated: 0,
  limit: 8,
  offering_name: 'Cloud',
  offering_uuid: 'abc',
  ...overrides,
});

const chart = (components) =>
  renderHook(() => useAggregateLimitChart({ components } as any)).result.current
    .options;

describe('splitUsage', () => {
  it('splits usage of usage-based components', () => {
    expect(splitUsage(component({ usage: 7, usage_terminated: 2 }))).toEqual({
      live: 5,
      terminated: 2,
    });
  });

  it('splits limit_usage of limit-based components', () => {
    expect(
      splitUsage(
        component({
          billing_type: 'limit',
          usage: 99,
          limit_usage: 10,
          limit_usage_terminated: 4,
        }),
      ),
    ).toEqual({ live: 6, terminated: 4 });
  });

  it('treats missing terminated fields as zero', () => {
    expect(splitUsage({ billing_type: 'usage', usage: 3 })).toEqual({
      live: 3,
      terminated: 0,
    });
  });
});

describe('useAggregateLimitChart', () => {
  it('keeps two series when nothing is terminated', () => {
    const options = chart([component()]);
    expect(options.series.map((s) => s.name)).toEqual(['Usage', 'Limit']);
    expect(options.series[0].data[0].rawValue).toBe(7);
    expect(options.series[1].data[0].rawValue).toBe(1);
  });

  it('stacks terminated usage and computes remaining from live usage', () => {
    const options = chart([component({ usage: 7, usage_terminated: 2 })]);
    expect(options.series.map((s) => s.name)).toEqual([
      'Usage',
      'Terminated resources',
      'Limit',
    ]);
    const [usage, terminated, remaining] = options.series;
    expect(usage.data[0].rawValue).toBe(5);
    expect(terminated.data[0].value).toBe(2);
    expect(remaining.data[0].rawValue).toBe(3);
    expect(options.legend.data).toEqual([
      'Usage',
      'Terminated resources',
      'Limit',
    ]);
  });
});
