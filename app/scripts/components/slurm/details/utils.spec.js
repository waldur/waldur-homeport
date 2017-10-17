import { formatCharts } from './utils';
import usages from './fixtures/usages.json';
import pricePackage from './fixtures/pricePackage.json';
import charts from './fixtures/charts.json';
import { palette, chartSpec } from './constants';

describe('SLURM allocation usage chart formatter', () => {
  it('parses and formats charts correctly', () => {
    expect(formatCharts(palette, chartSpec, usages, pricePackage)).toEqual(charts);
  });
});
