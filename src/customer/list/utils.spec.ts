import { advanceTo, clear } from 'jest-date-mock';
import { DateTime } from 'luxon';

import { makeAccountingPeriods } from './utils';

afterAll(() => {
  clear();
});

describe('makeAccountingPeriods', () => {
  it('iterates through months', () => {
    advanceTo(
      DateTime.fromObject({ year: 2021, month: 10, day: 1 }).toJSDate(),
    );
    const options = makeAccountingPeriods(
      DateTime.fromObject({ year: 2021, month: 1, day: 1 }),
    );
    expect(options).toMatchSnapshot();
  });
});
