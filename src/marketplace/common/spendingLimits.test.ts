import { describe, expect, it } from 'vitest';

import {
  formatComponentSpendingLimitPeriods,
  formatSpendingLimits,
  getCappedComponents,
  getDefaultSpendingLimits,
  getOfferedSpendingLimits,
  getOfferedPeriods,
  getSpendingLimitOrderErrors,
  getSpendingLimitResetText,
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

  it('accepts equal and increasing amounts', () => {
    expect(
      getSpendingLimitOrderErrors({
        day: 20,
        week: 20,
        month: 300,
        year: 1000,
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
