import { getEChartOptions } from './utils';

const chartSpec = require('./fixtures/chart-spec.json');
const eChartOption = require('./fixtures/echart-option.json');
const usages = require('./fixtures/usages.json');
const userUsages = require('./fixtures/user-usages.json');

jest.mock('moment-timezone', () => {
  return () => jest.requireActual('moment')('2020-07-01T00:00:00.000Z');
});

describe('SLURM allocation usage chart formatter', () => {
  it('parses data and returns eChart option correctly', () => {
    expect(getEChartOptions(chartSpec, usages, userUsages)).toEqual(
      eChartOption,
    );
  });
});
