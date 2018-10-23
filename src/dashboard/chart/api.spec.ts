import { advanceTo, clear } from 'jest-date-mock';

import { POINTS_COUNT, PROJECT_DASHBOARD } from '../constants';
import { Quota } from '../registry';
import * as api from './api';

jest.mock('@waldur/core/services', () => ({
  defaultCurrency: val => `EUR${val}`,
}));

describe('Dashboard chart API', () => {
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
    advanceTo(new Date(2018, 10, 1));
    const result = api.padMissingValues(pairs);
    expect(result.length).toBe(POINTS_COUNT);
    expect(result[0].value).toBe(0);
    expect(result[result.length - 3].date).toEqual(new Date(2018, 8, 1));
    clear();
  });

  it('computes relative change', () => {
    const actual = api.getRelativeChange(10, 20);
    expect(actual).toBe(100);
  });

  it('computes filesize unit', () => {
    const tb10 = 1024 * 1024 * 10;
    const gb20 = 1024 * 20;
    const result = api.getFormatterUnits('filesize', [gb20, tb10]);
    expect(result.units).toBe('TB');
    expect(result.formatter(tb10)).toBe('10.0');
    expect(result.formatter(gb20)).toBe('0.0');
  });

  it('formats quota chart', () => {
    const quota: Quota = {
      quota: 'nc_volume_size',
      title: 'Volume size',
      type: 'filesize',
      dashboards: [PROJECT_DASHBOARD],
    };
    const values = [10, 20, 40];
    advanceTo(new Date(2018, 9, 16));
    const chart = api.formatQuotaChart(quota, values);
    clear();

    expect(chart.units).toBe('MB');
    expect(chart.current).toBe(40);
    expect(chart.change).toBe(100);
    expect(chart.data).toEqual([
      {
        label: '10 at 2018-10-16',
        value: 10,
      },
      {
        label: '20 at 2018-10-15',
        value: 20,
      },
      {
        label: '40 at 2018-10-14',
        value: 40,
      },
    ]);
  });

  it('formats cost chart', () => {
    const invoices = [
      {
        year: 2018,
        month: 10,
        price: 300,
      },
      {
        year: 2018,
        month: 9,
        price: 200,
      },
      {
        year: 2018,
        month: 8,
        price: 100,
      },
    ];
    advanceTo(new Date(2018, 9, 16));
    const chart = api.formatCostChart(invoices);
    clear();

    expect(chart.current).toEqual('EUR300');
    expect(chart.change).toEqual(50);
    expect(chart.data.length).toEqual(POINTS_COUNT);
    expect(chart.data[chart.data.length - 1].label).toEqual('EUR300 at 2018-10-31, estimated');
    expect(chart.data[chart.data.length - 2].label).toEqual('EUR200 at 2018-09-01');
    expect(chart.data[chart.data.length - 4].label).toEqual('EUR0 at 2018-09-01');
  });
});
