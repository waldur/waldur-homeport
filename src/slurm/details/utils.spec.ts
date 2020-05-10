import { formatCharts } from './utils';
import { palette, getChartSpec } from './constants';

const usages = require('./fixtures/usages.json');
const pricePackage = require('./fixtures/pricePackage.json');
const charts = require('./fixtures/charts.json');

describe('SLURM allocation usage chart formatter', () => {
  it('parses and formats charts correctly', () => {
    expect(formatCharts(palette, getChartSpec(), usages, pricePackage)).toEqual(
      charts,
    );
  });
});
