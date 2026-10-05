import { describe, expect, it } from 'vitest';

import { formatMetricPeriod } from './options';

describe('formatMetricPeriod', () => {
  it('names the calendar month in UTC, whatever the viewer’s zone', () => {
    // Midnight UTC on 1 October is still 30 September west of Greenwich.
    expect(formatMetricPeriod('month', '2026-10-01T00:00:00+00:00')).toMatch(
      /2026, so far$/,
    );
    expect(
      formatMetricPeriod('month', '2026-10-01T00:00:00+00:00'),
    ).not.toMatch(/Sep/);
  });

  it('names the quarter', () => {
    expect(formatMetricPeriod('quarter', '2026-10-01T00:00:00+00:00')).toBe(
      'Q4 2026, so far',
    );
    expect(formatMetricPeriod('quarter', '2026-01-01T00:00:00+00:00')).toBe(
      'Q1 2026, so far',
    );
  });

  it('describes a rolling window without a date', () => {
    expect(formatMetricPeriod('rolling_30d', '2026-09-05T08:00:00+00:00')).toBe(
      'Last 30 days',
    );
  });
});
