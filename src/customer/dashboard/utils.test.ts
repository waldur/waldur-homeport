import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { formatOrganizationCostChart } from '@waldur/dashboard/utils';

vi.mock('@waldur/core/config', () => ({
  ENV: {
    plugins: { WALDUR_CORE: { CURRENCY_NAME: 'EUR' } },
  },
}));

describe('Customer dashboard chart API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats cost chart', () => {
    const invoices = [
      {
        year: 2018,
        month: 10,
        price: '300',
        incurred_costs: 400,
        compensations: -100,
      },
      {
        year: 2018,
        month: 9,
        price: '200',
        incurred_costs: 200,
        compensations: 0,
      },
      {
        year: 2018,
        month: 8,
        price: '100',
        incurred_costs: 120,
        compensations: -20,
      },
    ];
    vi.setSystemTime(new Date(2018, 9, 16));
    const chart = formatOrganizationCostChart(invoices);

    expect(chart.current).toEqual('€300.00');
    expect(chart.data.length).toEqual(12);

    expect(chart.data[chart.data.length - 1].label).toEqual(
      '€300.00 at 2018-10-31, estimated',
    );
    expect(chart.data[chart.data.length - 2].label).toEqual(
      '€200.00 at 2018-09-01',
    );
    expect(chart.data[chart.data.length - 4].label).toEqual(
      '€0.00 at 2018-07-01',
    );

    expect(chart.incurred[chart.incurred.length - 1].label).toEqual(
      '€400.00 at 2018-10-31, estimated',
    );
    expect(chart.incurred[chart.incurred.length - 2].label).toEqual(
      '€200.00 at 2018-09-01',
    );
    expect(chart.incurred[chart.incurred.length - 4].label).toEqual(
      '€0.00 at 2018-07-01',
    );

    expect(chart.compensation[chart.compensation.length - 1].label).toEqual(
      '€100.00 at 2018-10-31, estimated',
    );
    expect(chart.compensation[chart.compensation.length - 2].label).toEqual(
      '€0.00 at 2018-09-01',
    );
    expect(chart.compensation[chart.compensation.length - 4].label).toEqual(
      '€0.00 at 2018-07-01',
    );
  });
});
