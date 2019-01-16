import { advanceTo, clear } from 'jest-date-mock';

import { formatCostChart } from './api';

jest.mock('@waldur/core/services', () => ({
  defaultCurrency: val => `EUR${val}`,
}));

describe('Customer dashboard chart API', () => {
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
    const chart = formatCostChart(invoices, 12);
    clear();

    expect(chart.current).toEqual('EUR300');
    expect(chart.data.length).toEqual(12);
    expect(chart.data[chart.data.length - 1].label).toEqual('EUR300 at 2018-10-31, estimated');
    expect(chart.data[chart.data.length - 2].label).toEqual('EUR200 at 2018-09-01');
    expect(chart.data[chart.data.length - 4].label).toEqual('EUR0 at 2018-09-01');
  });
});
