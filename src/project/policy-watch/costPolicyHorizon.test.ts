import { describe, expect, it } from 'vitest';
import { ProjectCredit } from 'waldur-js-client';

import { buildCreditEvents } from './creditEvents';
import { projectCreditRunway } from './creditRunway';
import { costPolicyMetrics } from './policyEta';

// Payloads copied verbatim from a running dev stack:
//   GET /api/project-credits/?project_uuid=…
//   GET /api/marketplace-project-estimated-cost-policies/?scope_uuid=…
// Typed through `unknown` rather than `never`, which would satisfy any
// signature and let a field-name drift through an SDK regen go unnoticed.
const CREDIT = {
  value: '111100.00000',
  consumption_last_month: '3600.0000',
  spendable_value: '111100.00000',
  is_limited_by_organization_credit: false,
  end_date: '2027-07-01',
  minimal_consumption: '18000.00000',
  apply_as_minimal_consumption: true,
} as unknown as ProjectCredit;

const POLICY = { limit_cost: 2000, current_cost: '0E-20' };
const TODAY = new Date(2026, 7, 31, 14);

const horizon = (etaDays: number | null) => {
  const r = projectCreditRunway(CREDIT, TODAY);
  return buildCreditEvents(
    {
      balance: 111100,
      spendableValue: 111100,
      isLimitedByOrganizationCredit: false,
      exhaustionDate: r.exhaustionDate,
      burnPerDay: r.burnPerDay,
      creditEndDate: '2027-07-01',
      project: null,
      resources: [],
      policies: [
        { actionLabel: 'Pause resources', etaDays, kind: 'project-cost' },
      ],
    },
    TODAY,
  );
};

describe('a credit-covered project reaches no cost cap', () => {
  // The derivation this replaced, kept as the regression it guards against.
  it('the credit burn rate would have put a pause 3 days out', () => {
    const { burnPerDay } = projectCreditRunway(CREDIT, TODAY);
    expect(burnPerDay).toBe(600); // 18000 / 30
    const old = Math.floor((2000 - 0) / burnPerDay);
    expect(old).toBe(3);
    const policyRow = horizon(old).find((e) => e.kind === 'policy');
    expect(policyRow?.title).toBe('Pause resources');
    expect(policyRow?.date).toBe('2026-09-03'); // renders "in 2 days"
  });

  // Through the mapping the hook actually calls, so re-introducing a rate at
  // the call site has to get past this, not merely past the helper's own test.
  it('the mapping gives no date, so no pause row reaches the horizon', () => {
    const { etaDays } = costPolicyMetrics(POLICY, TODAY);
    expect(etaDays).toBeNull();
    expect(horizon(etaDays).find((e) => e.kind === 'policy')).toBeUndefined();
  });

  it('and the credit rows themselves are untouched', () => {
    const { etaDays } = costPolicyMetrics(POLICY, TODAY);
    expect(horizon(etaDays).map((e) => [e.kind, e.date])).toEqual([
      ['exhaustion', '2027-03-04'], // floor(111100*30/18000) = 185 days out
      ['credit-expiry', '2027-07-01'],
    ]);
  });
});
