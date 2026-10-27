import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import {
  canFixCostPolicy,
  CostPolicyDetailsPolicy,
  getCostPolicySummary,
  getFixOptions,
  getPolicyPeriodText,
  getResetScenarios,
} from './costPolicyDetails';

// The deployment's figures: 2 871 left uncovered earlier, 3 863 this month
// after credit, 6 734 in all.
const policy = (
  limit: number,
  overrides: Partial<CostPolicyDetailsPolicy> = {},
): CostPolicyDetailsPolicy => ({
  current_cost: '6734.00',
  limit_cost: limit,
  period: 1,
  has_fired: true,
  trigger_status: {
    gate: 'cost_over_limit',
    triggered: true,
    credit_value_compared: null,
  },
  cost_breakdown: {
    cost_before_credit: '15363.00',
    credit_drawn: '6329.00',
    credit_pending: '2300.00',
    earlier_months: '2871.00',
  },
  ...overrides,
});

const today = DateTime.fromISO('2026-10-27');
const byKey = <T extends { key: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.key, item]));

const owner = {
  type: 'project' as const,
  isStaff: false,
  isOwnerOrStaff: true,
  credit: { pay_earlier_invoices: false },
  payableNow: 0,
};

describe('getCostPolicySummary', () => {
  it('says credit does not reset a policy the earlier months hold', () => {
    expect(getCostPolicySummary(policy(100))).toContain(
      'adding credit does not reset it',
    );
  });

  it('keeps to the figures when credit can reset it', () => {
    expect(getCostPolicySummary(policy(5615))).toBe(
      'The cost after credit, €6,734.00, is over the €5,615.00 limit.',
    );
  });
});

describe('getPolicyPeriodText', () => {
  it('names the first month of a Total period when it is known', () => {
    expect(getPolicyPeriodText(policy(100), '2025-11-01', today)).toBe(
      'Total: every month since November 2025, this one included.',
    );
  });

  it('names the months of a shorter period', () => {
    expect(getPolicyPeriodText(policy(100, { period: 3 }), null, today)).toBe(
      '3 months: August 2026 to October 2026.',
    );
    expect(getPolicyPeriodText(policy(100, { period: 2 }), null, today)).toBe(
      'One month: October 2026 only.',
    );
  });
});

describe('getResetScenarios', () => {
  it('resets with credit alone when the earlier months are under the limit', () => {
    const rows = byKey(getResetScenarios(policy(5615), today));
    expect(rows.credit.change).toContain('€1,119.00');
    expect(rows.credit.costAfter).toBe(5615);
    expect(rows.credit.resets).toBe(true);
    expect(rows.earlier.resets).toBe(true);
    expect(rows.both).toBeUndefined();
    expect(rows.new_month.resets).toBe(false);
  });

  it('needs both changes when each part alone is over the limit', () => {
    const rows = byKey(getResetScenarios(policy(100), today));
    expect(rows.credit.costAfter).toBe(2871);
    expect(rows.credit.resets).toBe(false);
    expect(rows.earlier.costAfter).toBe(3863);
    expect(rows.earlier.resets).toBe(false);
    expect(rows.both.resets).toBe(true);
  });

  it('resets a one-month policy when the new month starts', () => {
    const rows = byKey(
      getResetScenarios(
        policy(100, {
          period: 2,
          current_cost: '3863.00',
          cost_breakdown: {
            cost_before_credit: '6163.00',
            credit_drawn: '0.00',
            credit_pending: '2300.00',
            earlier_months: '0.00',
          },
        }),
        today,
      ),
    );
    expect(rows.new_month.change).toContain('1 Nov 2026');
    expect(rows.new_month.resets).toBe(true);
    expect(rows.earlier).toBeUndefined();
  });

  it('lists nothing for a policy below its limit', () => {
    const below = policy(10000, {
      trigger_status: {
        gate: 'cost_below_limit',
        triggered: false,
        credit_value_compared: null,
      },
    });
    expect(getResetScenarios(below, today)).toEqual([]);
  });
});

describe('getFixOptions', () => {
  it('gives owners every option but paying earlier invoices', () => {
    const options = byKey(getFixOptions(policy(100), owner));
    expect(Object.keys(options)).toEqual([
      'add_credit',
      'pay_earlier_invoices',
      'count_one_month',
      'edit_policy',
    ]);
    expect(options.add_credit.allowed).toBe(true);
    expect(options.pay_earlier_invoices.allowed).toBe(false);
    expect(options.pay_earlier_invoices.audience).toBe('staff');
    expect(options.count_one_month.costAfter).toBe(3863);
  });

  it('shows staff what paying earlier invoices leaves', () => {
    const options = byKey(
      getFixOptions(policy(5615), {
        ...owner,
        isStaff: true,
        payableNow: 2871,
      }),
    );
    expect(options.pay_earlier_invoices.allowed).toBe(true);
    expect(options.pay_earlier_invoices.costAfter).toBe(3863);
    expect(options.pay_earlier_invoices.resets).toBe(true);
  });

  it('does not offer to pay earlier invoices twice', () => {
    const options = byKey(
      getFixOptions(policy(100), {
        ...owner,
        credit: { pay_earlier_invoices: true },
      }),
    );
    expect(options.pay_earlier_invoices).toBeUndefined();
  });

  it('offers nothing for a policy below its limit', () => {
    const below = policy(10000, {
      trigger_status: {
        gate: 'cost_below_limit',
        triggered: false,
        credit_value_compared: null,
      },
    });
    expect(getFixOptions(below, owner)).toEqual([]);
  });
});

describe('canFixCostPolicy', () => {
  it('lets owners fix project policies and only staff fix organization ones', () => {
    expect(canFixCostPolicy('project', false, true)).toBe(true);
    expect(canFixCostPolicy('organization', false, true)).toBe(false);
    expect(canFixCostPolicy('organization', true, true)).toBe(true);
    expect(canFixCostPolicy('project', false, false)).toBe(false);
  });
});
