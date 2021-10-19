import { advanceTo, clear } from 'jest-date-mock';
import { DateTime } from 'luxon';

import { getEChartOptions } from './utils';

const customers = require('./fixtures/customers.json');
const divisions = require('./fixtures/divisions.json');
const eChartOption = require('./fixtures/echart-option.json');

afterAll(() => {
  clear();
});

describe('Organizations by divisions chart formatter', () => {
  it('parses data and returns eChart option correctly', () => {
    advanceTo(DateTime.fromISO('2020-07-01T00:00:00.000Z').toJSDate());
    expect(getEChartOptions({ divisions, customers })).toEqual(eChartOption);
  });
});
