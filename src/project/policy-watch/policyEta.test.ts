import { describe, expect, it } from 'vitest';

import { costPolicyMetrics } from './policyEta';

describe('costPolicyMetrics', () => {
  it('reads the projection from the server rather than deriving one', () => {
    // The client cannot derive it: `current_cost` is net of a draw only the
    // backend can simulate, so nothing here is denominated in the quantity a
    // rate would need. Deriving it anyway is #244.
    expect(
      costPolicyMetrics({
        limit_cost: 2000,
        current_cost: '0E-20',
        eta_days: 211,
        eta_date: '2027-03-30',
      }),
    ).toEqual({
      thresholdValue: 2000,
      currentValue: 0,
      saturationPct: 0,
      etaDays: 211,
      etaDate: '2027-03-30',
    });
  });

  it('passes a null projection through as no date', () => {
    const m = costPolicyMetrics({
      limit_cost: 1567,
      current_cost: '0.91',
      eta_days: null,
      eta_date: null,
    });
    expect(m.etaDays).toBeNull();
    expect(m.etaDate).toBeNull();
  });

  it('passes a reached threshold through as reached', () => {
    // 0 is not a rounded-down projection: the server reports it only when the
    // policy is genuinely triggered, which for a cost policy also needs the
    // credit balance to have fallen to the limit.
    const m = costPolicyMetrics({
      limit_cost: 100,
      current_cost: '250',
      eta_days: 0,
      eta_date: '2026-09-01',
    });
    expect(m.etaDays).toBe(0);
    expect(m.saturationPct).toBe(250);
  });

  it('treats a backend without the field as having no projection', () => {
    const m = costPolicyMetrics({ limit_cost: 2000, current_cost: '500' });
    expect(m.etaDays).toBeNull();
    expect(m.etaDate).toBeNull();
    expect(m.saturationPct).toBe(25);
  });

  it('falls back to the price estimate when current_cost is absent', () => {
    const m = costPolicyMetrics({
      limit_cost: 2000,
      billing_price_estimate: { total: '500.0000000000' },
    });
    expect(m.currentValue).toBe(500);
  });

  it('does not divide by a zero cap', () => {
    expect(costPolicyMetrics({ limit_cost: 0 }).saturationPct).toBe(0);
  });
});
