import { describe, it, expect } from 'vitest';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import {
  getOfferingEntryPrice,
  getOrderablePlans,
  getPlanPricing,
} from './planPricing';

const createOffering = (
  components: Array<{
    type: string;
    billing_type: string;
    is_prepaid?: boolean;
    limit_period?: string;
  }>,
): PublicOfferingDetails =>
  ({
    components: components.map((c) => ({
      type: c.type,
      name: c.type,
      billing_type: c.billing_type,
      is_prepaid: c.is_prepaid ?? false,
      limit_period: c.limit_period ?? 'month',
      measured_unit: 'unit',
    })),
  }) as PublicOfferingDetails;

const createPlan = (
  prices: Record<string, number>,
  quotas: Record<string, number> = {},
  unit = 'month',
): BasePublicPlan =>
  ({
    uuid: 'plan-' + unit + JSON.stringify(prices),
    name: 'Plan',
    unit,
    quotas,
    prices: Object.fromEntries(
      Object.entries(prices).map(([k, v]) => [k, String(v)]),
    ),
  }) as unknown as BasePublicPlan;

describe('getPlanPricing', () => {
  it('bases the recurring figure on fixed components only', () => {
    const offering = createOffering([
      { type: 'fee', billing_type: 'fixed' },
      { type: 'cpu', billing_type: 'limit' },
    ]);
    const plan = createPlan({ fee: 20, cpu: 4.5 }, { fee: 1 });

    const pricing = getPlanPricing(offering, plan);

    // The customer has not sized the CPU yet, so it adds nothing to the floor.
    expect(pricing.monthlyBase).toBe(20);
    expect(pricing.hasVariableCost).toBe(true);
  });

  it('converts the plan unit to a month', () => {
    const offering = createOffering([{ type: 'fee', billing_type: 'fixed' }]);
    const plan = createPlan({ fee: 0.5 }, { fee: 1 }, 'hour');

    const pricing = getPlanPricing(offering, plan);

    expect(pricing.isMonthly).toBe(true);
    expect(pricing.monthlyMultiplier).toBe(24 * 30);
    expect(pricing.monthlyBase).toBe(360);
  });

  it('quotes no monthly figure for a plan billed per unit', () => {
    const offering = createOffering([{ type: 'fee', billing_type: 'fixed' }]);
    const plan = createPlan({ fee: 7 }, { fee: 1 }, 'quantity');

    const pricing = getPlanPricing(offering, plan);

    expect(pricing.isMonthly).toBe(false);
    expect(pricing.monthlyMultiplier).toBe(1);
    expect(pricing.periodLabel).not.toBe('month');
  });

  it('counts a one-off charge once, and never in the recurring figure', () => {
    const offering = createOffering([
      { type: 'fee', billing_type: 'fixed' },
      { type: 'setup', billing_type: 'one' },
    ]);
    const plan = createPlan({ fee: 20, setup: 50 }, { fee: 1, setup: 1 });

    const pricing = getPlanPricing(offering, plan);

    expect(pricing.monthlyBase).toBe(20);
    expect(pricing.oneTime).toBe(50);
  });

  it('keeps a prepaid component out of both totals', () => {
    const offering = createOffering([
      { type: 'fee', billing_type: 'fixed' },
      { type: 'storage', billing_type: 'one', is_prepaid: true },
    ]);
    const plan = createPlan({ fee: 20, storage: 99 }, { fee: 1 });

    const pricing = getPlanPricing(offering, plan);

    // Its quantity is the customer's to choose: quoting one unit as a fact
    // would inflate the recurring figure and double-count against oneTime.
    expect(pricing.monthlyBase).toBe(20);
    expect(pricing.oneTime).toBe(0);
    expect(pricing.hasVariableCost).toBe(true);
  });

  it('reports no variable cost when every component is fixed', () => {
    const offering = createOffering([{ type: 'fee', billing_type: 'fixed' }]);
    const plan = createPlan({ fee: 20 }, { fee: 1 });

    expect(getPlanPricing(offering, plan).hasVariableCost).toBe(false);
  });
});

describe('getOfferingEntryPrice', () => {
  it('returns the cheapest plan', () => {
    const offering = {
      ...createOffering([{ type: 'fee', billing_type: 'fixed' }]),
      plans: [
        createPlan({ fee: 40 }, { fee: 1 }),
        createPlan({ fee: 10 }, { fee: 1 }),
        createPlan({ fee: 20 }, { fee: 1 }),
      ],
    } as PublicOfferingDetails;

    expect(getOfferingEntryPrice(offering).monthlyBase).toBe(10);
  });

  it('ignores archived plans, which nobody can order', () => {
    const cheapButArchived = {
      ...createPlan({ fee: 5 }, { fee: 1 }),
      archived: true,
    } as BasePublicPlan;
    const offering = {
      ...createOffering([{ type: 'fee', billing_type: 'fixed' }]),
      plans: [cheapButArchived, createPlan({ fee: 20 }, { fee: 1 })],
    } as PublicOfferingDetails;

    expect(getOrderablePlans(offering)).toHaveLength(1);
    expect(getOfferingEntryPrice(offering).monthlyBase).toBe(20);
  });

  it('does not let a per-unit plan undercut a monthly one', () => {
    const offering = {
      ...createOffering([{ type: 'fee', billing_type: 'fixed' }]),
      plans: [
        createPlan({ fee: 20 }, { fee: 1 }, 'month'),
        createPlan({ fee: 7 }, { fee: 1 }, 'quantity'),
      ],
    } as PublicOfferingDetails;

    // €7 per unit is not cheaper than €20 per month; they are different things.
    expect(getOfferingEntryPrice(offering).monthlyBase).toBe(20);
  });

  it('returns null for an offering with no plans', () => {
    const offering = {
      ...createOffering([]),
      plans: [],
    } as PublicOfferingDetails;

    expect(getOfferingEntryPrice(offering)).toBeNull();
  });
});
