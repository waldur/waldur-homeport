import { describe, expect, it } from 'vitest';

import { getUsageLineChartOptions } from './utils';

describe('getUsageLineChartOptions', () => {
  it('escapes the axis and series names in the tooltip', () => {
    const name = '<img src=x onerror=alert(1)>';
    const options = getUsageLineChartOptions(['2026-01'], [1]);
    const tooltip = (options.tooltip as any).formatter([
      { axisValue: name, marker: '', seriesName: name, data: 1 },
    ]);

    expect(tooltip.split('&lt;img src=x onerror=alert(1)&gt;')).toHaveLength(3);
    expect(tooltip).not.toContain('<img');
  });
});
