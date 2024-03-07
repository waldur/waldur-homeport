import { advanceTo, clear } from 'jest-date-mock';
import { DateTime } from 'luxon';

import { getEChartOptions } from './utils';

const customers = require('./fixtures/customers.json');
const eChartOption = require('./fixtures/echart-option.json');
const organizationGroups = require('./fixtures/organization-groups.json');

afterAll(() => {
  clear();
});

describe('Organizations by organization-groups chart formatter', () => {
  it('parses data and returns eChart option correctly', () => {
    advanceTo(DateTime.fromISO('2020-07-01T00:00:00.000Z').toJSDate());
    expect(getEChartOptions({ organizationGroups, customers })).toEqual(
      eChartOption,
    );
  });
});
