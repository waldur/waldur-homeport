import { advanceTo, clear } from 'jest-date-mock';

import { getPeriodLabel } from './api';

describe('Marketplace usage API', () => {
  beforeAll(() => {
    advanceTo(new Date(2018, 9, 16));
  });

  afterAll(() => {
    clear();
  });

  it('uses start of current billing period if plan has been enabled in previous billing period', () => {
    const period = {
      start: '2018-08-01',
      end: null,
      plan_name: 'Basic',
    };
    expect(getPeriodLabel(period)).toBe('Basic (from 2018-10-01 00:00)');
  });

  it('uses start field if plan has been enabled in current billing period', () => {
    const period = {
      start: '2018-10-10',
      end: null,
      plan_name: 'Basic',
    };
    expect(getPeriodLabel(period)).toBe('Basic (from 2018-10-10 00:00)');
  });
});
