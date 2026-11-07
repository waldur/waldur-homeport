import { describe, expect, it } from 'vitest';

import { describeBudget, isOverspent, orderBudgetRows } from './budgetRows';
import { budgetReport } from './fixtures';

const [callPool, roundPool, noPool] = budgetReport.pools;

describe('orderBudgetRows', () => {
  it('puts each call-wide pool first, its rounds under it', () => {
    const otherComponent = {
      ...callPool,
      component_type: 'cpu_hours',
      pool_uuid: 'other',
    };
    expect(
      orderBudgetRows([roundPool, otherComponent, noPool, callPool]),
    ).toEqual([callPool, roundPool, otherComponent, noPool]);
  });
});

describe('describeBudget', () => {
  it('says what budget each row is', () => {
    expect(describeBudget(callPool)).toBe('Call-wide pool');
    expect(describeBudget(roundPool)).toBe(
      'Round 11.12.2025-20.01.2026, part of the call-wide pool',
    );
    expect(describeBudget(noPool)).toBe(
      'Round 10.05.2026-08.08.2026 · no pool of its own',
    );
    expect(describeBudget({ ...roundPool, within_call_pool: false })).toBe(
      'Round 11.12.2025-20.01.2026',
    );
  });
});

describe('isOverspent', () => {
  it('is true only when the awards went past the offer', () => {
    expect(isOverspent(callPool)).toBe(false);
    expect(isOverspent({ ...callPool, remaining: -36000 })).toBe(true);
    // No pool, nothing to overspend.
    expect(isOverspent(noPool)).toBe(false);
  });
});
