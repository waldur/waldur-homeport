import { getEChartOptions } from './utils';
import { palette } from '@waldur/slurm/details/constants';

const usages = require('./fixtures/usages.json');
const userUsages = require('./fixtures/user-usages.json');
const chartSpec = require('./fixtures/chart-spec.json');
const eChartOption = require('./fixtures/echart-option.json');

describe('SLURM allocation usage chart formatter', () => {
  it('parses data and returns eChart option correctly', () => {
    expect(getEChartOptions(chartSpec, usages, userUsages)).toEqual({
      ...eChartOption,
      color: palette,
    });
  });
});
