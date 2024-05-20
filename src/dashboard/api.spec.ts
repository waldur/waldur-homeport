import { advanceTo, clear } from 'jest-date-mock';
import { DateTime } from 'luxon';

import * as api from './api';

jest.mock('@waldur/core/formatCurrency', () => ({
  defaultCurrency: (val) => `EUR${val}`,
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
    advanceTo(new Date(2018, 9, 1));
    const result = api.padMissingValues(pairs);
    expect(result.length).toBe(12);
    expect(result[0].value).toBe(0);
    expect(result[result.length - 3].date).toEqual(
      DateTime.fromISO('2018-08-01'),
    );
    clear();
  });
});
