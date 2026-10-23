import { describe, expect, it } from 'vitest';

import { getQuotaTotals } from './quotaSaturation';

// A prepaid cpu bought at 100 a month for 15 Aug – 15 Nov (three months), and
// a monthly storage limit next to it.
const resource = (overrides = {}) => ({
  limits: { cpu: 100, storage: 20 },
  limit_usage: { cpu: 87, storage: 4 },
  current_usages: { cpu: 12, storage: 4 },
  created: '2026-08-15T10:00:00+00:00',
  end_date: '2026-11-15',
  prepaid_total_component_types: ['cpu'],
  ...overrides,
});

describe('getQuotaTotals', () => {
  // limit_usage holds the cpu's usage for the whole subscription, so its cap
  // is the three months' budget, not one month's: 91 of 320, not 91 of 120.
  it('sets whole-subscription usage against the whole budget', () => {
    expect(getQuotaTotals(resource())).toEqual({
      usedTotal: 91,
      limitTotal: 320,
    });
  });

  it('sums the monthly figures when nothing is shown as a total', () => {
    expect(
      getQuotaTotals(
        resource({
          limit_usage: { cpu: 12, storage: 4 },
          prepaid_total_component_types: [],
        }),
      ),
    ).toEqual({ usedTotal: 16, limitTotal: 120 });
  });

  // Without an end date there is no span to multiply the limit by, so the
  // component falls back to this month against its monthly limit.
  it('keeps the monthly view without the resource dates', () => {
    expect(getQuotaTotals(resource({ end_date: null }))).toEqual({
      usedTotal: 16,
      limitTotal: 120,
    });
  });
});
