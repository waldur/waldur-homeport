import { describe, expect, it, vi } from 'vitest';

import { policyMarkerColor } from './CreditBurnDownChart';

vi.mock('../chartColors', () => ({
  getWatchColors: () => ({
    danger: 'danger',
    warning: 'warning',
    muted: 'muted',
  }),
}));

const policy = (overrides) => ({
  hasFired: false,
  saturationPct: 50,
  gate: null,
  triggered: null,
  etaDays: null,
  ...overrides,
});

describe('policyMarkerColor', () => {
  it('does not flag a cost policy held by credit for a long while', () => {
    expect(
      policyMarkerColor(
        policy({
          saturationPct: 7700,
          gate: 'held_by_project_credit',
          triggered: false,
          etaDays: 200,
        }),
      ),
    ).toBe('muted');
  });

  it('flags a held policy whose credit runs out soon', () => {
    // Saturation says nothing for a held policy; the projection, which
    // counts the credit, does.
    expect(
      policyMarkerColor(
        policy({
          saturationPct: 7700,
          gate: 'held_by_customer_credit',
          triggered: false,
          etaDays: 3,
        }),
      ),
    ).toBe('warning');
  });

  it('flags a policy close to its cap that nothing holds back', () => {
    expect(policyMarkerColor(policy({ saturationPct: 85 }))).toBe('warning');
  });

  it('marks a policy over its limit whose actions are pending', () => {
    expect(
      policyMarkerColor(
        policy({
          saturationPct: 120,
          gate: 'credit_exhausted',
          triggered: true,
        }),
      ),
    ).toBe('danger');
  });

  it('marks a fired policy', () => {
    expect(
      policyMarkerColor(policy({ hasFired: true, saturationPct: 120 })),
    ).toBe('danger');
  });
});
