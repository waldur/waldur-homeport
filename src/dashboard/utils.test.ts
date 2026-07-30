import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import * as api from './utils';

ENV.plugins.WALDUR_CORE.BRAND_COLOR = '#12B76A';

describe('Dashboard chart API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appends missing items', () => {
    const pairs = [
      {
        date: '2018-09-01',
        value: 10,
      },
      {
        date: '2018-10-01',
        value: 20,
      },
    ];
    vi.setSystemTime(new Date(2018, 9, 1));
    const result = api.padMissingValues(pairs);
    expect(result.length).toBe(12);
    expect(result[0].value).toBe(0);
    expect(result[result.length - 3].date).toEqual(
      DateTime.fromISO('2018-08-01'),
    );
  });

  it('credit chart plots compensation, not net price, for a fully-offset month', () => {
    vi.setSystemTime(new Date(2026, 6, 28)); // 2026-07-28, 0-indexed month
    const invoiceCosts = [
      {
        year: 2026,
        month: 1,
        // Incurred cost and credit compensation nearly cancel out, so net
        // `price` reads ~0 even though real credit was consumed that month.
        price: 0.53,
        compensation: -3739.32,
      },
    ] as any;

    const { chart } = api.getCreditChartAndOptions(invoiceCosts, 0);
    const january = chart.data.find((datum) => datum.xAxisValue === 'Jan');

    expect(january).toBeDefined();
    expect(january.value).toBeCloseTo(3739.32);
  });
});
