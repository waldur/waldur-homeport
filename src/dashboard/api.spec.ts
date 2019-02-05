import { advanceTo, clear } from 'jest-date-mock';

import * as api from './api';
import { Quota } from './types';

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
    const result = api.padMissingValues(pairs, 30);
    expect(result.length).toBe(30);
    expect(result[0].value).toBe(0);
    expect(result[result.length - 3].date).toEqual(new Date(2018, 8, 1));
    clear();
  });

  it('computes filesize unit', () => {
    const tb10 = 1024 * 1024 * 10;
    const gb20 = 1024 * 20;
    const result = api.getFormatterUnits('filesize', tb10);
    expect(result.units).toBe('TB');
    expect(result.formatter(tb10)).toBe('10.0');
    expect(result.formatter(gb20)).toBe('0.0');
  });

  it('formats quota chart', () => {
    const quota: Quota = {
      quota: 'nc_volume_size',
      title: 'Volume size',
      type: 'filesize',
    };
    const values = [10, 20, 40];
    advanceTo(new Date(2018, 9, 16));
    const chart = api.formatQuotaChart(quota, values);
    clear();

    expect(chart.units).toBe('MB');
    expect(chart.current).toBe(40);
    expect(chart.data).toEqual([
      { label: '2018-09-16', value: 10 },
      { label: '2018-09-17', value: 20 },
      { label: '2018-09-18', value: 40 },
    ]);
  });
});
