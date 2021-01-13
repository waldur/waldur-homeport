import { getEChartOptions } from './utils';

const customers = require('./fixtures/customers.json');
const divisions = require('./fixtures/divisions.json');
const eChartOption = require('./fixtures/echart-option.json');

jest.mock('moment-timezone', () => {
  return () => jest.requireActual('moment')('2020-07-01T00:00:00.000Z');
});

describe('Organizations by divisions chart formatter', () => {
  it('parses data and returns eChart option correctly', () => {
    expect(getEChartOptions({ divisions, customers })).toEqual(eChartOption);
  });
});
