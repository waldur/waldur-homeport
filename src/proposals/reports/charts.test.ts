import { describe, expect, it } from 'vitest';

import { countBudgets, fillMonths } from './charts';
import { budgetReport } from './fixtures';

describe('countBudgets', () => {
  const [callPool, roundPool, noPool] = budgetReport.pools;

  // A round's pool within a call pool counts in the call's pool already.
  it('counts a round pool within the call pool once, as the call pool', () => {
    expect(roundPool.within_call_pool).toBe(true);
    const waiting = { ...roundPool, undecided: 5000, remaining: 0 };
    expect(callPool.undecided).toBeGreaterThan(0);
    expect(countBudgets([callPool, waiting])).toEqual({
      pools: 1,
      usedUp: 0,
      undecided: 1,
    });
    // The same round pool outside any call pool is a budget of its own.
    expect(countBudgets([{ ...waiting, within_call_pool: false }])).toEqual({
      pools: 1,
      usedUp: 1,
      undecided: 1,
    });
  });

  it('leaves out awards made with no pool', () => {
    expect(noPool.pool_uuid).toBeNull();
    expect(countBudgets([{ ...noPool, undecided: 50, remaining: 0 }])).toEqual({
      pools: 0,
      usedUp: 0,
      undecided: 0,
    });
  });

  // The server's totals count the round pool within the call pool as a pool.
  // Awards past the offer use the pool up, and more.
  it('counts an overspent pool as used up', () => {
    expect(
      countBudgets([{ ...callPool, awarded: 36000, remaining: -36000 }]).usedUp,
    ).toBe(1);
  });

  it('may count fewer pools than the server totals', () => {
    expect(budgetReport.totals.pools).toBe(2);
    expect(countBudgets(budgetReport.pools).pools).toBe(1);
  });
});

describe('fillMonths', () => {
  const jan = { month: '2026-01-01', submitted: 3, accepted: 1 };
  const apr = { month: '2026-04-01', submitted: 2, accepted: 0 };

  it('fills the months with no submission between the first and the last', () => {
    expect(fillMonths([jan, apr]).map((month) => month.month)).toEqual([
      '2026-01-01',
      '2026-02-01',
      '2026-03-01',
      '2026-04-01',
    ]);
    expect(fillMonths([jan, apr])[1]).toEqual({
      month: '2026-02-01',
      submitted: 0,
      accepted: 0,
    });
  });

  it('spans the chosen dates when there are any', () => {
    const filled = fillMonths([jan], '2025-11-15', '2026-02-10');
    expect(filled.map((month) => month.month)).toEqual([
      '2025-11-01',
      '2025-12-01',
      '2026-01-01',
      '2026-02-01',
    ]);
    expect(filled[2]).toBe(jan);
  });

  it('leaves no months as none', () => {
    expect(fillMonths([])).toEqual([]);
  });
});
