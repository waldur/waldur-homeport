import { describe, expect, it } from 'vitest';
import { CreditTransaction } from 'waldur-js-client';

import { buildCreditBreakdown } from './creditBreakdown';

let seq = 0;
const row = (
  transaction_type: string,
  amount: number,
  billing_period: string | null = null,
): CreditTransaction =>
  ({
    uuid: `row-${(seq += 1)}`,
    created: '2026-03-01T00:00:00Z',
    amount: amount.toFixed(5),
    transaction_type,
    transaction_type_display: transaction_type,
    billing_period,
  }) as unknown as CreditTransaction;

describe('buildCreditBreakdown', () => {
  it('separates the floor draw from usage, which invoice items could not', () => {
    // A month that used 2,000 against a 8,000 floor: 6,000 bought nothing.
    const breakdown = buildCreditBreakdown(
      [
        row('staff_grant', 93000),
        row('compensation', -2000, '2026-02-01'),
        row('minimal_draw', -6000, '2026-02-01'),
      ],
      85000,
    );

    expect(breakdown.used).toBe(2000);
    expect(breakdown.lost).toBe(6000);
    expect(breakdown.remaining).toBe(85000);
    expect(breakdown.granted).toBe(93000);
  });

  it('reports no forfeiture for a month that meets its floor', () => {
    const breakdown = buildCreditBreakdown(
      [row('staff_grant', 10000), row('compensation', -2000, '2026-02-01')],
      8000,
    );

    expect(breakdown.used).toBe(2000);
    expect(breakdown.lost).toBe(0);
  });

  it('counts expiry as forfeited rather than used', () => {
    // Acceptance criterion: credit expiry appears as forfeited credit.
    const breakdown = buildCreditBreakdown(
      [row('staff_grant', 5000), row('expiry', -5000)],
      0,
    );

    expect(breakdown.used).toBe(0);
    expect(breakdown.lost).toBe(5000);
    expect(breakdown.granted).toBe(5000);
  });

  it('does not count a re-applied month twice', () => {
    // Applying compensations is a roll-back followed by a re-application, and
    // staff can run it against a pending invoice repeatedly. Both runs leave
    // their rows behind.
    const breakdown = buildCreditBreakdown(
      [
        row('staff_grant', 10000),
        row('compensation', -2000, '2026-02-01'),
        row('rollback', 2000, '2026-02-01'),
        row('compensation', -2000, '2026-02-01'),
      ],
      8000,
    );

    expect(breakdown.used).toBe(2000);
    expect(breakdown.granted).toBe(10000);
  });

  it('keeps a project tail forfeited when the roll-back does not restore it', () => {
    // clear_compensations restores project credits by their compensation sum
    // only, so a re-applied month really does take the floor draw twice. The
    // card states what the balance did, not what it should have done.
    const breakdown = buildCreditBreakdown(
      [
        row('compensation', -2000, '2026-02-01'),
        row('minimal_draw', -6000, '2026-02-01'),
        row('rollback', 2000, '2026-02-01'),
        row('compensation', -2000, '2026-02-01'),
        row('minimal_draw', -6000, '2026-02-01'),
      ],
      0,
    );

    expect(breakdown.used).toBe(2000);
    expect(breakdown.lost).toBe(12000);
  });

  it('treats transfers and payouts as neither used nor forfeited', () => {
    const breakdown = buildCreditBreakdown(
      [
        row('staff_grant', 1000),
        row('affiliate_fee', 30),
        row('payout', -30),
        row('compensation', -100, '2026-02-01'),
      ],
      900,
    );

    expect(breakdown.used).toBe(100);
    expect(breakdown.lost).toBe(0);
    expect(breakdown.granted).toBe(1000);
  });

  it('reconciles to the balance for an empty ledger', () => {
    const breakdown = buildCreditBreakdown([], 500);

    expect(breakdown).toEqual({
      used: 0,
      lost: 0,
      remaining: 500,
      granted: 500,
    });
  });

  it('survives an unparseable amount rather than reporting NaN', () => {
    const broken = { ...row('compensation', -100), amount: 'n/a' };
    const breakdown = buildCreditBreakdown([broken as CreditTransaction], 100);

    expect(breakdown.used).toBe(0);
    expect(breakdown.granted).toBe(100);
  });
});
