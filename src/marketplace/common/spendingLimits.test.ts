import { describe, expect, it } from 'vitest';

import {
  formatComponentSpendingLimitPeriods,
  formatSpendingLimits,
  getCappedComponents,
  getDefaultSpendingLimits,
  getOfferedSpendingLimits,
  getOfferedPeriods,
  getSpendingLimitLabel,
  getSpendingLimitOrderErrors,
  getSpendingLimitPeriodLabel,
  getSpendingLimitResetText,
  getSpendingLimitsNotice,
  getSpendingLimitSubmitErrors,
  offersAllTimeLimit,
  parseComponentSpendingLimitPeriods,
  validateSpendingLimitAmount,
} from './spendingLimits';

const tokenCost: any = {
  type: 'token_cost',
  name: 'Token cost',
  billing_type: 'usage',
  spending_limit_periods: {
    month: { default: 300, maximum: 1000 },
    day: { default: 20, maximum: 100 },
    week: {},
  },
};

const storage: any = {
  type: 'storage',
  name: 'Storage',
  billing_type: 'usage',
  spending_limit_periods: {},
};

const cores: any = {
  type: 'cores',
  name: 'Cores',
  billing_type: 'limit',
  spending_limit_periods: {},
};

describe('spending limit periods', () => {
  it('lists offered periods shortest first', () => {
    expect(getOfferedPeriods(tokenCost)).toEqual(['day', 'week', 'month']);
  });

  it('describes when each period resets', () => {
    expect(getSpendingLimitResetText('day')).toBe('resets 00:00 UTC');
    expect(getSpendingLimitResetText('week')).toBe('resets Monday 00:00 UTC');
    expect(getSpendingLimitResetText('month')).toBe('resets on the 1st');
    expect(getSpendingLimitResetText('quarter')).toBe(
      'resets on 1 January, April, July and October',
    );
    expect(getSpendingLimitResetText('year')).toBe('resets on 1 January');
    expect(getSpendingLimitResetText('total')).toBe('never resets');
  });

  // All-time is the one period that is not a calendar period.
  it('names the all-time limit and lists it after the year', () => {
    expect(getSpendingLimitLabel('total')).toBe('All-time limit');
    expect(getSpendingLimitPeriodLabel('total')).toBe('All-time');
    expect(
      getOfferedPeriods({
        spending_limit_periods: { total: {}, year: {}, month: {} },
      }),
    ).toEqual(['month', 'year', 'total']);
  });

  it('tells whether any component offers an all-time limit', () => {
    expect(offersAllTimeLimit([tokenCost, storage])).toBe(false);
    expect(
      offersAllTimeLimit([
        tokenCost,
        { ...storage, spending_limit_periods: { total: {} } },
      ]),
    ).toBe(true);
  });

  it('keeps only usage-based components that offer a period', () => {
    expect(getCappedComponents([tokenCost, storage, cores])).toEqual([
      tokenCost,
    ]);
    expect(
      getCappedComponents([{ ...tokenCost, billing_type: 'limit' }]),
    ).toEqual([]);
  });
});

describe('getSpendingLimitsNotice', () => {
  it('follows the offering action on a reached limit', () => {
    expect(getSpendingLimitsNotice('pause')).toMatch(
      /^When a limit is reached, access pauses until that limit resets\./,
    );
    expect(getSpendingLimitsNotice('downscale')).toMatch(
      /^When a limit is reached, the resource is downscaled until that limit resets\./,
    );
  });

  it('says what lifts an all-time limit, which never resets', () => {
    const allTime =
      'An all-time limit never resets: once reached, it holds until it is raised or cleared.';
    expect(getSpendingLimitsNotice('pause', true)).toBe(
      `When a limit is reached, access pauses until that limit resets. ${allTime} Limits are checked each time the provider reports usage, so spending can briefly go over one.`,
    );
    expect(getSpendingLimitsNotice('downscale', true)).toBe(
      `When a limit is reached, the resource is downscaled until that limit resets. ${allTime} Limits are checked each time the provider reports usage, so spending can briefly go over one.`,
    );
    expect(getSpendingLimitsNotice('pause')).not.toContain(allTime);
    expect(getSpendingLimitsNotice('downscale')).not.toContain(allTime);
    // Nothing is held when a reached limit is only reported.
    expect(getSpendingLimitsNotice(undefined, true)).toBe(
      'Reaching a limit is reported but does not pause access.',
    );
  });

  it.each([undefined, null, ''])(
    'says a reached limit only is reported when the action is %j',
    (action) => {
      expect(getSpendingLimitsNotice(action)).toBe(
        'Reaching a limit is reported but does not pause access.',
      );
    },
  );
});

describe('validateSpendingLimitAmount', () => {
  it('accepts an empty value, which sets no limit', () => {
    expect(validateSpendingLimitAmount('')).toBeUndefined();
    expect(validateSpendingLimitAmount(undefined)).toBeUndefined();
    expect(validateSpendingLimitAmount(null)).toBeUndefined();
  });

  it('accepts non-negative amounts with up to two decimals', () => {
    expect(validateSpendingLimitAmount('0')).toBeUndefined();
    expect(validateSpendingLimitAmount('20.25')).toBeUndefined();
    expect(validateSpendingLimitAmount(0.29)).toBeUndefined();
  });

  it('rejects negative amounts', () => {
    expect(validateSpendingLimitAmount('-1')).toBe('Must not be negative.');
  });

  it('rejects more than two decimal places', () => {
    expect(validateSpendingLimitAmount('1.234')).toBe(
      'Use at most 2 decimal places.',
    );
  });

  it('rejects an amount above the maximum', () => {
    expect(validateSpendingLimitAmount('101', 100)).toBe(
      'Must not exceed 100.',
    );
    expect(validateSpendingLimitAmount('100', 100)).toBeUndefined();
  });
});

describe('getSpendingLimitOrderErrors', () => {
  it('flags a shorter period above a longer one', () => {
    expect(getSpendingLimitOrderErrors({ day: 50, week: 40 })).toEqual({
      day: 'Must not exceed the amount for the week (40).',
    });
  });

  it('compares across periods left empty', () => {
    expect(
      getSpendingLimitOrderErrors({ day: '50', week: '', month: 30 }),
    ).toEqual({ day: 'Must not exceed the amount for the month (30).' });
  });

  it('names the all-time amount when the longer period is total', () => {
    expect(getSpendingLimitOrderErrors({ year: 600, total: 500 })).toEqual({
      year: 'Must not exceed the all-time amount (500).',
    });
    expect(
      getSpendingLimitOrderErrors({ month: 50, year: '', total: 40 }),
    ).toEqual({ month: 'Must not exceed the all-time amount (40).' });
  });

  it('accepts equal and increasing amounts', () => {
    expect(
      getSpendingLimitOrderErrors({
        day: 20,
        week: 20,
        month: 300,
        year: 1000,
        total: 1000,
      }),
    ).toEqual({});
  });
});

describe('order form payload', () => {
  it('starts from the provider defaults', () => {
    expect(getDefaultSpendingLimits([tokenCost, storage])).toEqual({
      token_cost: { day: 20, month: 300 },
    });
  });

  it('sends offered periods with a value, as numbers', () => {
    expect(
      formatSpendingLimits(
        {
          token_cost: { day: '25', week: '', month: 300, year: 5 },
          cores: { day: 1 },
        },
        [tokenCost, cores],
      ),
    ).toEqual({ token_cost: { day: 25, month: 300 } });
  });

  it('leaves out a component without any value', () => {
    expect(
      formatSpendingLimits({ token_cost: { day: '' } }, [tokenCost]),
    ).toEqual({});
  });
});

describe('getOfferedSpendingLimits', () => {
  it('keeps the limits of offered periods only', () => {
    expect(
      getOfferedSpendingLimits(
        {
          token_cost: { day: 20, month: 300, year: 2000 },
          gone: { day: 5 },
        },
        [tokenCost],
      ),
    ).toEqual({ token_cost: { day: 20, month: 300 } });
  });
});

describe('component dialog periods', () => {
  it('round-trips the API shape', () => {
    const form = parseComponentSpendingLimitPeriods(
      tokenCost.spending_limit_periods,
    );
    expect(form).toEqual({
      day: { enabled: true, default: 20, maximum: 100 },
      week: { enabled: true, default: undefined, maximum: undefined },
      month: { enabled: true, default: 300, maximum: 1000 },
    });
    expect(formatComponentSpendingLimitPeriods(true, form, 'usage')).toEqual({
      day: { default: 20, maximum: 100 },
      week: {},
      month: { default: 300, maximum: 1000 },
    });
  });

  it('round-trips an all-time period', () => {
    const form = parseComponentSpendingLimitPeriods({
      total: { maximum: 5000 },
      month: {},
    });
    expect(form).toEqual({
      month: { enabled: true, default: undefined, maximum: undefined },
      total: { enabled: true, default: undefined, maximum: 5000 },
    });
    expect(formatComponentSpendingLimitPeriods(true, form, 'usage')).toEqual({
      month: {},
      total: { maximum: 5000 },
    });
  });

  it('drops unticked periods and empty bounds', () => {
    expect(
      formatComponentSpendingLimitPeriods(
        true,
        {
          day: { enabled: false, default: 5 },
          month: { enabled: true, default: '', maximum: '50' },
        },
        'usage',
      ),
    ).toEqual({ month: { maximum: 50 } });
  });

  it('sends no periods when switched off or not usage-based', () => {
    const periods = { month: { enabled: true, default: 1 } };
    expect(
      formatComponentSpendingLimitPeriods(false, periods, 'usage'),
    ).toEqual({});
    expect(formatComponentSpendingLimitPeriods(true, periods, 'limit')).toEqual(
      {},
    );
  });
});

describe('getSpendingLimitSubmitErrors', () => {
  const types = ['token_cost', 'storage'];

  it('puts a message naming a period on that period', () => {
    expect(
      getSpendingLimitSubmitErrors(
        { token_cost: ['The month limit may not exceed 200.'] },
        types,
      ),
    ).toEqual({
      token_cost: { month: ['The month limit may not exceed 200.'] },
    });
  });

  it('puts an ordering message on the shorter period', () => {
    expect(
      getSpendingLimitSubmitErrors(
        {
          storage: [
            'Limits: the day amount (50) is above the week amount (40).',
          ],
        },
        types,
      ),
    ).toEqual({
      storage: {
        day: ['Limits: the day amount (50) is above the week amount (40).'],
      },
    });
  });

  it('puts a message naming the total on that period', () => {
    expect(
      getSpendingLimitSubmitErrors(
        {
          token_cost: [
            'Limits: the year amount (600) is above the total amount (500).',
          ],
          storage: ['The total limit may not exceed 900.'],
        },
        types,
      ),
    ).toEqual({
      token_cost: {
        year: [
          'Limits: the year amount (600) is above the total amount (500).',
        ],
      },
      storage: { total: ['The total limit may not exceed 900.'] },
    });
  });

  it('keeps a message naming no period on its component', () => {
    expect(
      getSpendingLimitSubmitErrors(
        { token_cost: ['This component does not accept spending limits.'] },
        types,
      ),
    ).toEqual({
      token_cost: ['This component does not accept spending limits.'],
    });
  });

  it('reads per-period errors wrapped in spending_limits', () => {
    expect(
      getSpendingLimitSubmitErrors(
        {
          spending_limits: {
            token_cost: { day: ['A valid number is required.'] },
          },
        },
        types,
      ),
    ).toEqual({ token_cost: { day: ['A valid number is required.'] } });
  });

  it('leaves errors with no field to the toast', () => {
    expect(
      getSpendingLimitSubmitErrors(
        { 0: 'Spending limits cannot be changed in the current state.' },
        types,
      ),
    ).toBeUndefined();
    expect(getSpendingLimitSubmitErrors(undefined, types)).toBeUndefined();
  });
});
