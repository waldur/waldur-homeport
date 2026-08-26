import { describe, expect, it } from 'vitest';
import { ProjectCredit } from 'waldur-js-client';

import { creditableCostThisMonth } from './creditPacing';

/** Only the field the reader looks at; the API sends decimals as strings. */
const credit = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    creditable_cost_this_month: '70764.03000',
    ...overrides,
  }) as unknown as ProjectCredit;

describe('creditableCostThisMonth', () => {
  it('reports what the backend says the credit will be drawn for', () => {
    // The case the fix exists for: the project's invoice for the month is
    // 412,299.36, but only the compute lines come from an offering the credit
    // covers. Pacing has to see 70,764.03, or it reads ten times over.
    expect(creditableCostThisMonth(credit(), 412299.36)).toBe(70764.03);
  });

  it('falls back to the gross cost when no invoice is open yet', () => {
    // Null is "no billing period", not "nothing to draw" — and it is what an
    // older backend without the field sends too. Either way, degrading to the
    // month's gross cost keeps the card at its previous behaviour instead of
    // claiming the project drew nothing.
    expect(
      creditableCostThisMonth(
        credit({ creditable_cost_this_month: null }),
        1200,
      ),
    ).toBe(1200);
    expect(creditableCostThisMonth({} as ProjectCredit, 1200)).toBe(1200);
    expect(creditableCostThisMonth(null, 1200)).toBe(1200);
  });

  it('reads zero as zero, not as missing', () => {
    // A project whose whole invoice sits outside the credit's offerings draws
    // nothing. Treating that as absent would fall back to the gross cost and
    // reproduce the bug exactly where it bites hardest.
    expect(
      creditableCostThisMonth(
        credit({ creditable_cost_this_month: '0.00000' }),
        40.48,
      ),
    ).toBe(0);
  });

  it('never reports a negative draw', () => {
    expect(
      creditableCostThisMonth(
        credit({ creditable_cost_this_month: '-5' }),
        100,
      ),
    ).toBe(0);
  });

  it('falls back when the figure is not a number', () => {
    expect(
      creditableCostThisMonth(
        credit({ creditable_cost_this_month: 'n/a' }),
        250,
      ),
    ).toBe(250);
  });
});
