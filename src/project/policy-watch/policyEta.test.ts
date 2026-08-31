import { describe, expect, it } from 'vitest';

import { costPolicyEtaDays, costPolicyMetrics } from './policyEta';

const TODAY = new Date(2026, 7, 31, 14);

describe('costPolicyEtaDays', () => {
  // The shape of the incident this module exists to prevent: a project whose
  // credit covered everything it spent, so the policy's own metric sat at
  // 0.06% of the cap and did not move, was told it would be paused in days.
  it('does not project a date for a cap the metric is nowhere near', () => {
    expect(costPolicyEtaDays(1567, 0.91)).toBeNull();
  });

  it('does not project a date however fast the credit is being drawn', () => {
    // The old derivation divided the remaining cap by the credit burn rate, so
    // a larger credit draw produced a *sooner* pause. Nothing about the credit
    // is an input here any more, which is the whole point.
    expect(costPolicyEtaDays(1567, 0.91)).toBeNull();
    expect(costPolicyEtaDays(100, 0.91)).toBeNull();
  });

  it('reports an exceeded cap, because that is measured and not extrapolated', () => {
    expect(costPolicyEtaDays(100, 250.5)).toBe(0);
  });

  // `_is_triggered` is `_evaluated_cost(...) > self.limit_cost`, so a cost that
  // has exactly reached the cap has not triggered.
  it('agrees with the server at the boundary', () => {
    expect(costPolicyEtaDays(100, 100)).toBeNull();
    expect(costPolicyEtaDays(100, 100.01)).toBe(0);
  });

  it('does not call a zero-spend policy reached just because its cap is zero', () => {
    expect(costPolicyEtaDays(0, 0)).toBeNull();
    expect(costPolicyEtaDays(0, 0.01)).toBe(0);
  });
});

describe('costPolicyMetrics', () => {
  it('reads every figure off the policy, and takes no rate at all', () => {
    // Payload copied verbatim from a running backend, decimals as strings.
    expect(
      costPolicyMetrics({ limit_cost: 2000, current_cost: '0E-20' }, TODAY),
    ).toEqual({
      thresholdValue: 2000,
      currentValue: 0,
      saturationPct: 0,
      etaDays: null,
      etaDate: null,
    });
  });

  it('falls back to the price estimate when current_cost is absent', () => {
    const m = costPolicyMetrics(
      { limit_cost: 2000, billing_price_estimate: { total: '500.0000000000' } },
      TODAY,
    );
    expect(m.currentValue).toBe(500);
    expect(m.saturationPct).toBe(25);
    expect(m.etaDays).toBeNull();
  });

  it('dates an exceeded cap today rather than in the future', () => {
    const m = costPolicyMetrics({ limit_cost: 100, current_cost: 250 }, TODAY);
    expect(m.etaDays).toBe(0);
    expect(m.etaDate).toBe('2026-08-31');
  });

  it('does not divide by a zero cap', () => {
    expect(costPolicyMetrics({ limit_cost: 0 }, TODAY).saturationPct).toBe(0);
  });
});
