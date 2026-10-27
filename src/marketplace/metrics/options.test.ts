import { describe, expect, it } from 'vitest';

import {
  formatFigure,
  formatMetricPeriod,
  formatUnit,
  getRateUnit,
  getSecondsAxis,
} from './options';

describe('formatFigure', () => {
  it('scales bytes in decimal steps, alone and as a rate', () => {
    expect(formatFigure(670246125, 'By')).toBe('670.25 MB');
    expect(formatFigure(0, 'By')).toBe('0 B');
    expect(formatFigure(999, 'By')).toBe('999 B');
    expect(formatFigure(2500000000, 'By/s')).toBe('2.5 GB/s');
  });

  it('scales seconds to minutes and hours', () => {
    expect(formatFigure(42, 's')).toBe('42 s');
    expect(formatFigure(950.65, 's')).toBe('15.84 min');
    expect(formatFigure(7200, 's')).toBe('2 h');
  });

  it('reads a counted thing in the plural, one of it as written', () => {
    expect(formatFigure(12379, '{operation}')).toBe('12,379 operations');
    expect(formatFigure(1, '{operation}')).toBe('1 operation');
    expect(formatFigure(5, '{learners}')).toBe('5 learners');
  });

  it('steps up a unit when the rounded figure reaches it', () => {
    expect(formatFigure(999996, 'By')).toBe('1 MB');
    expect(formatFigure(999.996, 'By')).toBe('1 kB');
    expect(formatFigure(59.996, 's')).toBe('1 min');
  });

  it('counts I/O operations, and per second calls them IOPS', () => {
    expect(formatFigure(22263, '{I/O operation}')).toBe(
      '22,263 I/O operations',
    );
    expect(formatFigure(12.5, '{I/O operation}/s')).toBe('12.5 IOPS');
    // A quiet disk is not idle.
    expect(formatFigure(0.0028, '{I/O operation}/s')).toBe('0.0028 IOPS');
    expect(formatUnit('{I/O operation}/s')).toBe('IOPS');
  });

  it('reads one of a thing after rounding, and not a number as a dash', () => {
    expect(formatFigure(1.004, '{operation}')).toBe('1 operation');
    expect(formatFigure(NaN, 'By')).toBe('—');
  });

  it('shows other units as written, and no value as a dash', () => {
    expect(formatFigure(12.04, '%')).toBe('12.04 %');
    expect(formatFigure(3, 'h')).toBe('3 h');
    expect(formatFigure(1500)).toBe('1,500');
    expect(formatFigure(null, 'By')).toBe('—');
  });
});

describe('getRateUnit', () => {
  it('gives bytes and I/O operations per second, nothing else', () => {
    expect(getRateUnit('By')).toBe('By/s');
    expect(getRateUnit('{I/O operation}')).toBe('{I/O operation}/s');
    expect(getRateUnit('{job}')).toBeNull();
    expect(getRateUnit('s')).toBeNull();
    expect(getRateUnit('%')).toBeNull();
  });
});

describe('getSecondsAxis', () => {
  it('ticks in whole hours, minutes or seconds', () => {
    const hours = getSecondsAxis(100000, 2);
    expect(hours.interval).toBe(20 * 3600);
    expect(hours.formatter(72000)).toBe('20 h');
    expect(getSecondsAxis(5000, 2).interval).toBe(50 * 60);
    expect(getSecondsAxis(50, 2).interval).toBe(50);
  });

  it('leaves an empty axis to the chart', () => {
    expect(getSecondsAxis(0, 2)).toBeNull();
  });
});

describe('formatUnit', () => {
  it('names base units for labels and inputs', () => {
    expect(formatUnit('By')).toBe('bytes');
    expect(formatUnit('By/s')).toBe('bytes/s');
    expect(formatUnit('s')).toBe('seconds');
    expect(formatUnit('{operation}')).toBe('operations');
    expect(formatUnit('{request}/s')).toBe('requests/s');
    expect(formatUnit('{batch}')).toBe('batches');
    expect(formatUnit('{query}')).toBe('queries');
    expect(formatUnit(undefined)).toBe('');
  });
});

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
